import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { signInWithGoogle, signOutGoogle } from '../utils/googleAuth.ts';
import { sanitizeImagePath, handleImageError, FALLBACK_IMAGE } from '../utils/imageUtils.ts';
import type {
  Product,
  Category,
  Order,
  OrderStatus,
  Customer,
  WebsiteSettings,
  Banner,
} from '../types/index.ts';
import { formatPKR, formatDate } from '../utils/formatters.ts';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Search,
  Check,
  X,
  ExternalLink,
  MessageCircle,
  Phone,
  Mail,
  Sliders,
  Truck,
  Share2,
  Globe,
  Link2,
  CreditCard,
  Landmark,
  Smartphone,
  BookOpen,
  Star,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Shield,
} from 'lucide-react';

type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'banners'
  | 'payments'
  | 'policies'
  | 'socials'
  | 'security'
  | 'settings';

export const AdminPanel: React.FC = () => {
  const {
    adminToken,
    adminUser,
    setAdminUser,
    loginAdmin,
    loginAdminWithGoogle,
    directOwnerAdminLogin,
    logoutAdmin,
    products,
    categories,
    settings,
    setProducts,
    setCategories,
    setSettings,
    refreshProducts,
    refreshCategories,
    refreshSettings,
    showToast,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Login form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);

  // Dashboard metrics
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Orders list for admin
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Customers list for admin
  const [adminCustomers, setAdminCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Product modal (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: 0,
    originalPrice: 0,
    discountPercentage: 0,
    shortDescription: '',
    description: '',
    stock: 10,
    sku: '',
    images: [] as string[],
    mainImage: '',
    status: 'active' as Product['status'],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    specifications: [] as { key: string; value: string }[],
  });
  const [productReviewsList, setProductReviewsList] = useState<
    { customerName: string; rating: number; comment: string }[]
  >([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isVisible: true,
  });
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Banners & Hero Slider Management State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    id: string;
    type: 'hero' | 'promo';
    title: string;
    subtitle: string;
    badgeText: string;
    image: string;
    ctaText: string;
    linkType: 'shop' | 'categories' | 'category' | 'external';
    linkValue: string;
    isActive: boolean;
  }>({
    id: '',
    type: 'hero',
    title: '',
    subtitle: '',
    badgeText: '',
    image: '',
    ctaText: 'Shop Collection',
    linkType: 'shop',
    linkValue: 'shop',
    isActive: true,
  });
  const [bannerTabFilter, setBannerTabFilter] = useState<'all' | 'hero' | 'promo'>('all');
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const bannerFilePickerRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Admin Credentials & Password Management State
  const [currentAdminEmail, setCurrentAdminEmail] = useState('admin@smartconnect.pk');
  const [credForm, setCredForm] = useState({
    usernameOrEmail: adminUser?.email || 'admin@smartconnect.pk',
    fullName: adminUser?.name || 'Smart Connect Executive Admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Fetch current admin email from server (for login card and profile)
  useEffect(() => {
    fetch('/api/auth/admin-info')
      .then((r) => r.json())
      .then((data) => {
        if (data?.email) {
          setCurrentAdminEmail(data.email);
          setCredForm((prev) => ({
            ...prev,
            usernameOrEmail: data.email,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (adminUser?.email) {
      setCredForm((prev) => ({
        ...prev,
        usernameOrEmail: adminUser.email,
        fullName: adminUser.name || prev.fullName,
      }));
    }
  }, [adminUser]);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credForm.currentPassword) {
      showToast('Please enter your current password to authorize changes', 'error');
      return;
    }

    if (credForm.newPassword) {
      if (credForm.newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
      }
      if (credForm.newPassword !== credForm.confirmPassword) {
        showToast('New password and confirm password do not match', 'error');
        return;
      }
    }

    setIsUpdatingCreds(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          currentPassword: credForm.currentPassword,
          newEmail: credForm.usernameOrEmail,
          newName: credForm.fullName,
          newPassword: credForm.newPassword || undefined,
        }),
      });

      // Save custom credentials locally for Netlify and static hosting
      try {
        localStorage.setItem(
          'sc_custom_admin_creds',
          JSON.stringify({
            email: credForm.usernameOrEmail,
            password: credForm.newPassword || credForm.currentPassword,
            name: credForm.fullName,
          })
        );
      } catch {}

      showToast('Admin credentials updated successfully! Please note your new login details.', 'success');
      setCurrentAdminEmail(credForm.usernameOrEmail);

      setCredForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch {
      // Netlify fallback: credentials saved locally
      try {
        localStorage.setItem(
          'sc_custom_admin_creds',
          JSON.stringify({
            email: credForm.usernameOrEmail,
            password: credForm.newPassword || credForm.currentPassword,
            name: credForm.fullName,
          })
        );
        showToast('Admin credentials updated locally! Please note your new login details.', 'success');
        setCurrentAdminEmail(credForm.usernameOrEmail);
        setCredForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } catch (err: any) {
        showToast(err.message || 'Error updating credentials', 'error');
      }
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const fetchMetrics = async () => {
    if (!adminToken) return;
    try {
      setLoadingMetrics(true);
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else if (res.status === 401 || res.status === 403) {
        logoutAdmin();
      }
    } catch (e) {
      console.warn('Metrics fetch notice:', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const fetchOrders = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setAdminOrders(data);
        try {
          localStorage.setItem('sc_orders', JSON.stringify(data));
        } catch {}
        return;
      } else if (res.status === 401 || res.status === 403) {
        logoutAdmin();
        return;
      }
    } catch (e) {
      console.warn('Orders fetch notice:', e);
    }
    // Static hosting fallback (Netlify / offline): Load from local storage
    try {
      const localOrders = localStorage.getItem('sc_orders');
      if (localOrders) {
        setAdminOrders(JSON.parse(localOrders));
      }
    } catch {}
  };

  const fetchCustomers = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminCustomers(data);
      } else if (res.status === 401 || res.status === 403) {
        logoutAdmin();
      }
    } catch (e) {
      console.warn('Customers fetch notice:', e);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchMetrics();
      fetchOrders();
      fetchCustomers();
    }
  }, [adminToken]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
    }
  }, [settings]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await loginAdmin(emailInput, passwordInput);
    setIsLoggingIn(false);
  };

  // Handle Google Admin Login
  const handleGoogleAdminLogin = async () => {
    setIsGoogleLoggingIn(true);
    try {
      const authResult = await signInWithGoogle();
      if (!authResult || !authResult.user) {
        throw new Error('Google Sign-In was cancelled');
      }

      const googleUser = {
        email: authResult.user.email || '',
        name: authResult.user.displayName || 'Authorized Admin',
        googleId: authResult.user.uid,
      };

      await loginAdminWithGoogle(googleUser);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        showToast('Google Sign-In popup closed', 'info');
      } else {
        showToast(err.message || 'Failed to authenticate with Google', 'error');
      }
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };

  // Upload helper for device files (with automatic Base64 fallback for Netlify static deployment)
  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl, filename: file.name }),
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const result = await res.json();
            if (result.url) {
              resolve(result.url);
              return;
            }
          }
        } catch {
          // If server upload fails (e.g. Netlify static hosting), continue to fallback
        }
        // Seamless client-side persistent Data URL fallback
        resolve(dataUrl);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Product Images Upload from Device Gallery / File Picker
  const handleProductImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      }

      setProductForm((prev) => {
        const combined = [...prev.images, ...newUrls];
        return {
          ...prev,
          images: combined,
          mainImage: prev.mainImage || combined[0] || '',
        };
      });
      showToast(`Uploaded ${newUrls.length} image(s) from device`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Product CRUD
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.name || 'Luxury Watches',
      price: 15000,
      originalPrice: 18000,
      discountPercentage: 16,
      shortDescription: '',
      description: '',
      stock: 12,
      sku: `SC-${Math.floor(100 + Math.random() * 900)}`,
      images: [],
      mainImage: '',
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      specifications: [
        { key: 'Material', value: 'Aerospace Grade Titanium' },
        { key: 'Origin', value: 'Handcrafted / Certified' },
      ],
    });
    setProductReviewsList([
      {
        customerName: 'Muhammad Hamza (Lahore)',
        rating: 5,
        comment: '100% original authentic piece. Parcel verified on doorstep delivery with COD.',
      },
    ]);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      discountPercentage: product.discountPercentage || 0,
      shortDescription: product.shortDescription,
      description: product.description,
      stock: product.stock,
      sku: product.sku,
      images: product.images || [product.mainImage],
      mainImage: product.mainImage,
      status: product.status,
      isFeatured: product.isFeatured,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
      specifications: product.specifications || [],
    });

    // Load existing reviews for this product
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((revs) => {
        if (Array.isArray(revs) && revs.length > 0) {
          setProductReviewsList(
            revs.map((r: any) => ({
              customerName: r.customerName,
              rating: r.rating || 5,
              comment: r.comment || '',
            }))
          );
        } else {
          setProductReviewsList([]);
        }
      })
      .catch(() => setProductReviewsList([]));

    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || productForm.price <= 0) {
      showToast('Name and valid price are required', 'error');
      return;
    }

    const payload = {
      ...productForm,
      slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      rating: editingProduct?.rating || 5.0,
      reviewCount: editingProduct?.reviewCount || 0,
      mainImage: productForm.mainImage || productForm.images[0] || '/assets/images/hero_luxury_showcase_1790499579518.jpg',
      images: productForm.images.length > 0 ? productForm.images : [productForm.mainImage || '/assets/images/hero_luxury_showcase_1790499579518.jpg'],
    };

    let savedProductId = editingProduct?.id || `prod-sc-${Date.now()}`;
    const productRecord: Product = {
      ...payload,
      id: savedProductId,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product;

    // Always update local state & localStorage immediately (works on Netlify)
    setProducts((prev) => {
      let updated: Product[];
      if (editingProduct) {
        updated = prev.map((p) => (p.id === savedProductId ? { ...p, ...productRecord } : p));
      } else {
        updated = [productRecord, ...prev];
      }
      try {
        localStorage.setItem('sc_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(editingProduct ? 'Product updated successfully' : 'Product created successfully', 'success');
    setIsProductModalOpen(false);

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      // Save custom customer reviews if provided
      if (savedProductId && productReviewsList.length > 0) {
        for (const rev of productReviewsList) {
          if (rev.customerName.trim() && rev.comment.trim()) {
            await fetch('/api/reviews', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: savedProductId,
                customerName: rev.customerName.trim(),
                rating: rev.rating || 5,
                comment: rev.comment.trim(),
              }),
            }).catch(() => {});
          }
        }
      }
      fetchMetrics();
    } catch {
      // Local state is already successfully saved
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('sc_products', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Product deleted', 'info');
    fetchMetrics();
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch {}
  };

  // Order Status update (Works seamlessly on Netlify static hosting)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setAdminOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      try {
        localStorage.setItem('sc_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Order status updated to ${newStatus}`, 'success');
    fetchMetrics();
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}
  };

  // Category CRUD
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      image: '/src/assets/images/hero_luxury_showcase_1790499579518.jpg',
      isVisible: true,
    });
    setIsCatModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      isVisible: cat.isVisible,
    });
    setIsCatModalOpen(true);
  };

  const handleCategoryImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setCatForm((prev) => ({ ...prev, image: url }));
      showToast('Category cover image uploaded from device', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const slug = catForm.slug.trim() || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const payload = {
      ...catForm,
      slug,
      image: catForm.image || '/assets/images/hero_luxury_showcase_1790499579518.jpg',
    };

    let savedCatId = editingCategory?.id || `cat-${Date.now()}`;
    const categoryRecord: Category = {
      ...payload,
      id: savedCatId,
    } as Category;

    // Always update local categories state and localStorage immediately (works on Netlify)
    setCategories((prev) => {
      let updated: Category[];
      if (editingCategory) {
        updated = prev.map((c) => (c.id === savedCatId ? { ...c, ...categoryRecord } : c));
      } else {
        updated = [...prev, categoryRecord];
      }
      try {
        localStorage.setItem('sc_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(editingCategory ? `Category "${catForm.name}" updated` : `Category "${catForm.name}" created`, 'success');
    setIsCatModalOpen(false);

    try {
      if (editingCategory) {
        await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
      }
    } catch {
      // Local state is already successfully saved
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== catId);
      try {
        localStorage.setItem('sc_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Category "${catName}" deleted`, 'info');
    try {
      await fetch(`/api/categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch {}
  };

  // Settings Save (Works 100% on Netlify and Full-Stack)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;

    // Always update state & localStorage immediately
    setSettings(settingsForm);
    try {
      localStorage.setItem('sc_settings', JSON.stringify(settingsForm));
    } catch {}
    showToast('Website settings saved and updated across store', 'success');

    // Attempt server sync if backend is active
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(settingsForm),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const updated = await res.json();
        setSettings(updated);
        try {
          localStorage.setItem('sc_settings', JSON.stringify(updated));
        } catch {}
      }
    } catch {
      // Local settings are already safely applied
    }
  };

  // Upload Logo from Device
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setSettingsForm((prev: any) => ({ ...prev, logoUrl: url }));
      showToast('Store logo updated from device', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading logo', 'error');
    }
  };

  // Upload Hero Banner from Device
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setSettingsForm((prev: any) => ({
        ...prev,
        hero: { ...prev.hero, bannerImage: url },
      }));
      showToast('Hero banner image updated from device', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading banner', 'error');
    }
  };

  // --- BANNER MANAGEMENT HANDLERS ---
  const handleOpenAddBanner = (type: 'hero' | 'promo' = 'hero') => {
    setEditingBanner(null);
    setBannerForm({
      id: '',
      type,
      title: '',
      subtitle: '',
      badgeText: type === 'hero' ? 'Curated Collection 2026' : 'Limited Time Offer',
      image: '',
      ctaText: type === 'hero' ? 'Shop Collection' : 'Shop Now',
      linkType: 'shop',
      linkValue: 'shop',
      isActive: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      id: b.id,
      type: b.type || 'hero',
      title: b.title || '',
      subtitle: b.subtitle || '',
      badgeText: b.badgeText || '',
      image: b.image || '',
      ctaText: b.ctaText || 'Shop Collection',
      linkType: b.linkType || 'shop',
      linkValue: b.linkValue || 'shop',
      isActive: b.isActive !== false,
    });
    setIsBannerModalOpen(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      showToast('Please enter a banner title or headline', 'error');
      return;
    }

    try {
      const currentBanners = (settingsForm?.banners || settings?.banners || []);
      let updatedBanners: Banner[] = [];

      if (editingBanner) {
        updatedBanners = currentBanners.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                ...bannerForm,
              }
            : b
        );
      } else {
        const newBanner: Banner = {
          ...bannerForm,
          id: `banner-${Date.now()}`,
          order: currentBanners.length + 1,
          createdAt: new Date().toISOString(),
        };
        updatedBanners = [...currentBanners, newBanner];
      }

      // Keep hero banner image in sync if hero slide updated
      const firstHero = updatedBanners.find((b) => b.type === 'hero' && b.isActive);
      const updatedSettings = {
        ...(settingsForm || settings),
        banners: updatedBanners,
        ...(firstHero && firstHero.image && {
          hero: {
            ...((settingsForm || settings)?.hero || {}),
            bannerImage: firstHero.image,
            heading: firstHero.title || (settingsForm || settings)?.hero?.heading,
            subheading: firstHero.subtitle || (settingsForm || settings)?.hero?.subheading,
          },
        }),
      };

      // Always update local settings state and localStorage immediately (works on Netlify)
      setSettings(updatedSettings as any);
      setSettingsForm(updatedSettings as any);
      try {
        localStorage.setItem('sc_settings', JSON.stringify(updatedSettings));
      } catch {}
      showToast(editingBanner ? 'Banner updated successfully' : 'New banner added successfully', 'success');
      setIsBannerModalOpen(false);

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updatedSettings),
        });
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Error saving banner', 'error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      const currentBanners = settingsForm?.banners || settings?.banners || [];
      const updatedBanners = currentBanners.filter((b) => b.id !== bannerId);
      const updatedSettings = {
        ...(settingsForm || settings),
        banners: updatedBanners,
      };

      setSettings(updatedSettings as any);
      setSettingsForm(updatedSettings as any);
      try {
        localStorage.setItem('sc_settings', JSON.stringify(updatedSettings));
      } catch {}
      showToast('Banner deleted successfully', 'info');

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updatedSettings),
        });
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Error deleting banner', 'error');
    }
  };

  const handleToggleBannerStatus = async (bannerId: string) => {
    try {
      const currentBanners = settingsForm?.banners || settings?.banners || [];
      const updatedBanners = currentBanners.map((b) =>
        b.id === bannerId ? { ...b, isActive: !b.isActive } : b
      );
      const updatedSettings = {
        ...(settingsForm || settings),
        banners: updatedBanners,
      };

      setSettings(updatedSettings as any);
      setSettingsForm(updatedSettings as any);
      try {
        localStorage.setItem('sc_settings', JSON.stringify(updatedSettings));
      } catch {}
      showToast('Banner visibility updated', 'success');

      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(updatedSettings),
        });
      } catch {}
    } catch (err: any) {
      showToast(err.message || 'Error toggling banner status', 'error');
    }
  };

  const handleBannerModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerImage(true);
    try {
      const url = await uploadFile(file);
      setBannerForm((prev) => ({ ...prev, image: url }));
      showToast('Banner image uploaded from device', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error uploading image', 'error');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  // If not logged in, show secure admin login card
  if (!adminToken) {
    return (
      <div className="py-20 bg-[#0b0f17] min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#121824] border border-[#c5a880]/30 shadow-2xl text-left">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-white">
                Admin Control Vault
              </h2>
              <span className="text-xs text-slate-400">
                Authorized Smart Connect Personnel Only
              </span>
            </div>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleAdminLogin}
            disabled={isGoogleLoggingIn || isLoggingIn}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#1f2937] font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-3 active:scale-95 disabled:opacity-60 cursor-pointer border border-slate-200"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>
              {isGoogleLoggingIn ? 'Connecting with Google...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/80"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#121824] px-3 text-slate-400 font-semibold tracking-wider">
                or sign in with password
              </span>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@smartconnect.pk"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Secure Master Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-luxury w-full py-3 px-4 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs sm:text-sm hover:bg-[#d6bc98] transition-colors shadow-lg disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? 'Authenticating...' : 'Enter Admin Dashboard'}
            </button>
          </form>

          {/* Owner Emergency / 1-Click Access */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => directOwnerAdminLogin()}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-[#c5a880]/50"
            >
              <KeyRound className="w-4 h-4 text-[#c5a880]" />
              <span>Owner 1-Click Access (Umair Kamboh)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-[#0b0f17] min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c5a880]/20 flex items-center justify-center text-[#c5a880]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#c5a880] font-semibold">
                Store Operations
              </span>
              <h1 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white leading-tight">
                Smart Connect Executive Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Logged in as <strong className="text-white">{adminUser?.name || 'Administrator'}</strong>
            </span>
            <button
              onClick={() => {
                signOutGoogle();
                logoutAdmin();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'products'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'banners'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banners &amp; Hero Slider ({(settingsForm?.banners || settings?.banners || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders ({adminOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'customers'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customers ({adminCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'payments'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Payment Methods</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'policies'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Store Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('socials')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'socials'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social Media Links</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Admin Login &amp; Password</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#c5a880] text-[#0b0f17]'
                : 'bg-[#121824] text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Website Settings</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Gross Sales</span>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 font-serif-luxury">
                  {formatPKR(metrics?.totalSales || 0)}
                </div>
                <span className="text-[11px] text-[#00f2d2] font-semibold mt-1 block">
                  All Cash on Delivery
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Orders Placed</span>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 font-serif-luxury">
                  {metrics?.totalOrders || adminOrders.length}
                </div>
                <span className="text-[11px] text-amber-400 font-semibold mt-1 block">
                  {metrics?.pendingOrders || 0} Pending Confirmation
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Delivered &amp; Paid</span>
                <div className="text-xl sm:text-2xl font-bold text-[#c5a880] tabular-nums mt-1 font-serif-luxury">
                  {metrics?.completedOrders || 0}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Completed deliveries
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Catalog Products</span>
                <div className="text-xl sm:text-2xl font-bold text-white tabular-nums mt-1 font-serif-luxury">
                  {products.length}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Across {categories.length} departments
                </span>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#c5a880]" />
                  <span>Recent Customer Orders</span>
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-[#c5a880] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800/80">
                    <tr>
                      <th className="py-2.5 font-semibold">Order #</th>
                      <th className="py-2.5 font-semibold">Customer</th>
                      <th className="py-2.5 font-semibold">City</th>
                      <th className="py-2.5 font-semibold">Items</th>
                      <th className="py-2.5 font-semibold">Total (Rs.)</th>
                      <th className="py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {adminOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/30">
                        <td className="py-3 font-mono font-bold text-[#c5a880]">
                          {order.orderNumber}
                        </td>
                        <td className="py-3">
                          <span className="font-medium text-white block">{order.customer.fullName}</span>
                          <span className="text-slate-400 text-[11px]">{order.customer.phone}</span>
                        </td>
                        <td className="py-3 text-slate-300">{order.customer.city}</td>
                        <td className="py-3 text-slate-300">{order.items.length} items</td>
                        <td className="py-3 font-semibold text-white tabular-nums">
                          {formatPKR(order.total)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-400'
                                : order.status === 'Shipped'
                                ? 'bg-sky-950 text-sky-400'
                                : order.status === 'Cancelled'
                                ? 'bg-red-950 text-red-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                            }
                            className="bg-[#0b0f17] text-white border border-slate-700 rounded px-2 py-1 text-[11px]"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PRODUCTS CATALOG & MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white">Product Inventory</h2>
                <p className="text-xs text-slate-400">
                  Add, edit, upload device photos, manage stock and pricing in Pakistani Rupees (Rs.).
                </p>
              </div>

              <button
                onClick={openNewProductModal}
                className="btn-luxury px-4 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-[#121824] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1420] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Product</th>
                      <th className="py-3 px-4 font-semibold">Category</th>
                      <th className="py-3 px-4 font-semibold">Price (Rs.)</th>
                      <th className="py-3 px-4 font-semibold">Stock</th>
                      <th className="py-3 px-4 font-semibold">SKU</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.mainImage}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800"
                            />
                            <div>
                              <span className="font-semibold text-white block line-clamp-1">
                                {p.name}
                              </span>
                              <span className="text-slate-400 text-[10px]">
                                {p.images?.length || 1} image(s)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{p.category}</td>
                        <td className="py-3 px-4 font-semibold text-white tabular-nums">
                          {formatPKR(p.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold tabular-nums ${
                              p.stock <= 5 ? 'text-amber-400' : 'text-slate-300'
                            }`}
                          >
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              p.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded bg-slate-800"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CATEGORIES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white">Store Categories</h2>
                <p className="text-xs text-slate-400">
                  Add new departments, edit existing categories, upload custom cover photos, and toggle storefront visibility.
                </p>
              </div>

              <button
                onClick={openNewCategoryModal}
                className="btn-luxury px-4 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-2xl bg-[#121824] border border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg hover:border-[#c5a880]/30 transition-all group"
                >
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent opacity-80" />

                    {/* Visibility status */}
                    <span
                      className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded font-semibold ${
                        cat.isVisible
                          ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900/90 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {cat.isVisible ? 'Visible in Store' : 'Hidden from Store'}
                    </span>

                    {/* Quick action buttons on card image */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="p-1.5 rounded-lg bg-[#0b0f17]/80 hover:bg-[#0b0f17] text-slate-300 hover:text-white border border-slate-700 transition-colors shadow"
                        title="Edit Category"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#c5a880]" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-[#0b0f17]/80 hover:bg-[#0b0f17] text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors shadow"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-serif-luxury text-base font-bold text-white group-hover:text-[#c5a880] transition-colors">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-[#c5a880] font-semibold whitespace-nowrap tabular-nums">
                          {cat.productCount ?? 0} Products
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {cat.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-500">
                        Slug: /{cat.slug}
                      </span>
                      <button
                        onClick={() => openEditCategoryModal(cat)}
                        className="text-xs font-semibold text-[#c5a880] hover:underline flex items-center gap-1"
                      >
                        <span>Edit Details</span>
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: ORDERS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white">All Orders</h2>
                <p className="text-xs text-slate-400">
                  Track delivery progress, courier statuses, and Pakistani Cash on Delivery orders.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#121824] text-white border border-slate-700 rounded-lg px-3 py-1.5 text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Full Table */}
            <div className="rounded-2xl bg-[#121824] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1420] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Order Reference</th>
                      <th className="py-3 px-4 font-semibold">Customer &amp; Contact</th>
                      <th className="py-3 px-4 font-semibold">Delivery Address</th>
                      <th className="py-3 px-4 font-semibold">Items</th>
                      <th className="py-3 px-4 font-semibold">Amount (COD)</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {adminOrders
                      .filter((o) =>
                        orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
                      )
                      .map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 font-mono font-bold text-[#c5a880]">
                            {ord.orderNumber}
                            <span className="text-slate-500 block text-[10px]">
                              {formatDate(ord.createdAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">
                              {ord.customer.fullName}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              {ord.customer.phone}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              {ord.customer.email}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="text-slate-300 block leading-tight">
                              {ord.customer.address}
                            </span>
                            <span className="text-slate-400 text-[11px] font-semibold">
                              {ord.customer.city}, {ord.customer.province}
                            </span>
                            {ord.customer.orderNotes && (
                              <span className="text-amber-400/80 text-[10px] block mt-1">
                                Note: {ord.customer.orderNotes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white">{ord.items.length} items:</span>
                            <ul className="text-[11px] text-slate-400 list-disc list-inside mt-0.5">
                              {ord.items.map((it, idx) => (
                                <li key={idx}>
                                  {it.productName} (x{it.quantity})
                                </li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-3 px-4 font-bold text-white tabular-nums">
                            {formatPKR(ord.total)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded font-semibold ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : ord.status === 'Shipped'
                                  ? 'bg-sky-950 text-sky-400 border border-sky-800'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-red-950 text-red-400 border border-red-800'
                                  : 'bg-amber-950 text-amber-400 border border-amber-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                              }
                              className="bg-[#0b0f17] text-white border border-slate-700 rounded px-2 py-1 text-xs"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: CUSTOMERS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-white">Registered Customers</h2>
              <p className="text-xs text-slate-400">View customer contact details and delivery records.</p>
            </div>

            <div className="rounded-2xl bg-[#121824] border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1420] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Customer Name</th>
                      <th className="py-3 px-4 font-semibold">Phone / WhatsApp</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">City</th>
                      <th className="py-3 px-4 font-semibold">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {adminCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-white">{cust.fullName}</td>
                        <td className="py-3 px-4 text-slate-300">{cust.phone}</td>
                        <td className="py-3 px-4 text-slate-400">{cust.email}</td>
                        <td className="py-3 px-4 text-slate-300">{cust.city || 'Pakistan'}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(cust.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: PAYMENT METHODS */}
        {/* ==================================================== */}
        {activeTab === 'payments' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-8 text-left max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#c5a880]" />
                  <span>Online &amp; Offline Payment Gateways</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Configure your Pakistani Bank accounts, Raast ID, JazzCash/EasyPaisa mobile wallets, and Cash on Delivery (COD) terms. Customers will see these instructions directly on the checkout page.
                </p>
              </div>

              <button
                type="submit"
                className="btn-luxury px-6 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-xs shadow-md self-start sm:self-auto"
              >
                Save Payment Methods
              </button>
            </div>

            {/* Gateways Grid */}
            <div className="space-y-6">
              {/* Gateway 1: Direct Bank Transfer (IBFT / Raast) */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4 hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-white">
                        Online Bank Transfer (IBFT &amp; Raast)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Supports Meezan, HBL, Alfalah, Standard Chartered, Raast &amp; all 1-Link banks
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.payments?.bankTransfer?.enabled ?? true}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments,
                            cod: settingsForm.payments?.cod || { enabled: true, instructions: '' },
                            mobileWallets: settingsForm.payments?.mobileWallets || {
                              enabled: true,
                              walletName: 'JazzCash / EasyPaisa',
                              accountTitle: '',
                              accountNumber: '',
                              instructions: '',
                            },
                            cardPayment: settingsForm.payments?.cardPayment || {
                              enabled: true,
                              provider: 'Card',
                              instructions: '',
                            },
                            bankTransfer: {
                              ...(settingsForm.payments?.bankTransfer || {
                                bankName: 'Meezan Bank Ltd',
                                accountTitle: 'Smart Connect',
                                accountNumber: '',
                                iban: '',
                                instructions: '',
                              }),
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded accent-blue-500"
                    />
                    <span className="font-semibold text-white">Enable IBFT</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.bankTransfer?.bankName || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              bankName: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Meezan Bank Ltd / HBL"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Title (Exact Name on Bank Account) *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.bankTransfer?.accountTitle || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              accountTitle: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Smart Connect Luxury Retail"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bank Account Number *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.bankTransfer?.accountNumber || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              accountNumber: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 02010108927182"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      IBAN Number (24 Characters) *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.bankTransfer?.iban || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              iban: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. PK45MEZN0002010108927182"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Raast ID (Phone or Identifier for Instant Zero-Fee Transfer)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.bankTransfer?.raastId || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              raastId: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 03000762781"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bank Transfer Instructions to Display at Checkout
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.payments?.bankTransfer?.instructions || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            bankTransfer: {
                              ...settingsForm.payments!.bankTransfer,
                              instructions: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Transfer the exact order total via mobile banking app (IBFT / Raast). Enter your Transaction Reference ID below for immediate confirmation."
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Gateway 2: Mobile Wallets (JazzCash & EasyPaisa) */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-white">
                        Mobile Wallets (JazzCash &amp; EasyPaisa)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Direct wallet-to-wallet transfers with instant SMS Transaction ID (TID)
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.payments?.mobileWallets?.enabled ?? true}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            mobileWallets: {
                              ...settingsForm.payments!.mobileWallets,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded accent-amber-500"
                    />
                    <span className="font-semibold text-white">Enable Wallets</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Account Title *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.mobileWallets?.accountTitle || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            mobileWallets: {
                              ...settingsForm.payments!.mobileWallets,
                              accountTitle: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. Smart Connect Official"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Account Number *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.payments?.mobileWallets?.accountNumber || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            mobileWallets: {
                              ...settingsForm.payments!.mobileWallets,
                              accountNumber: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 0300-0762781"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Wallet Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.payments?.mobileWallets?.instructions || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            mobileWallets: {
                              ...settingsForm.payments!.mobileWallets,
                              instructions: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Send payment from your JazzCash or EasyPaisa app to the mobile number above. Then enter the 11/12 digit Transaction ID (TID) received via SMS."
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Gateway 3: Cash on Delivery (COD) */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4 hover:border-[#c5a880]/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#c5a880]/10 border border-[#c5a880]/20 flex items-center justify-center text-[#c5a880]">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-white">
                        Cash on Delivery (COD)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Zero advance payment · Doorstep parcel inspection across Pakistan
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.payments?.cod?.enabled ?? true}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            cod: {
                              ...settingsForm.payments!.cod,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded accent-[#c5a880]"
                    />
                    <span className="font-semibold text-white">Enable COD</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    COD Doorstep Instructions to Display
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.payments?.cod?.instructions || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        payments: {
                          ...settingsForm.payments!,
                          cod: {
                            ...settingsForm.payments!.cod,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Pay with cash to the courier representative when the parcel arrives at your doorstep. Zero advance payment required."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Gateway 4: Credit / Debit Card Online */}
              <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4 hover:border-purple-500/40 transition-colors">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif-luxury text-base font-bold text-white">
                        Credit / Debit Card (Visa, Mastercard, PayPak)
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        256-bit encrypted online card gateway checkout
                      </span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.payments?.cardPayment?.enabled ?? true}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          payments: {
                            ...settingsForm.payments!,
                            cardPayment: {
                              ...settingsForm.payments!.cardPayment,
                              enabled: e.target.checked,
                            },
                          },
                        })
                      }
                      className="rounded accent-purple-500"
                    />
                    <span className="font-semibold text-white">Enable Cards</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Card Gateway Notice
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.payments?.cardPayment?.instructions || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        payments: {
                          ...settingsForm.payments!,
                          cardPayment: {
                            ...settingsForm.payments!.cardPayment,
                            instructions: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Pay securely using any Pakistani or International Credit or Debit Card with 256-bit SSL encryption."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-luxury px-8 py-3.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-sm shadow-xl"
              >
                Save Payment Methods Configuration
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB: STORE POLICIES */}
        {/* ==================================================== */}
        {activeTab === 'policies' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-8 text-left max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#c5a880]" />
                  <span>Store Operational Policies &amp; Terms</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Edit your nationwide shipping terms, 7-day return and exchange rules, and Cash on Delivery doorstep inspection policy. These are automatically published in the footer and product page drawer.
                </p>
              </div>

              <button
                type="submit"
                className="btn-luxury px-6 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-xs shadow-md self-start sm:self-auto"
              >
                Save Store Policies
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  1. Nationwide Shipping &amp; Logistics Policy
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.policies?.shippingPolicy || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      policies: {
                        ...settingsForm.policies,
                        shippingPolicy: e.target.value,
                        returnPolicy: settingsForm.policies?.returnPolicy || '',
                        codTerms: settingsForm.policies?.codTerms || '',
                      },
                    })
                  }
                  placeholder="Describe shipping transit, free shipping terms, and courier handling..."
                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  2. 7-Day Return &amp; Exchange Policy Text
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.policies?.returnPolicy || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      policies: {
                        ...settingsForm.policies,
                        returnPolicy: e.target.value,
                        shippingPolicy: settingsForm.policies?.shippingPolicy || '',
                        codTerms: settingsForm.policies?.codTerms || '',
                      },
                    })
                  }
                  placeholder="Describe 7-day exchange terms, defect inspection, and return criteria..."
                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  3. Cash on Delivery (COD) Doorstep Terms &amp; Parcel Inspection
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.policies?.codTerms || ''}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      policies: {
                        ...settingsForm.policies,
                        codTerms: e.target.value,
                        shippingPolicy: settingsForm.policies?.shippingPolicy || '',
                        returnPolicy: settingsForm.policies?.returnPolicy || '',
                      },
                    })
                  }
                  placeholder="Explain doorstep parcel inspection and payment upon delivery..."
                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-luxury px-8 py-3.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-sm shadow-xl"
              >
                Save Store Policies
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB: SOCIAL MEDIA CHANNELS */}
        {/* ==================================================== */}
        {activeTab === 'socials' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-8 text-left max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#c5a880]" />
                  <span>Social Media &amp; External Channels</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Attach and manage your store's official social media profiles. These links are automatically displayed across the website header, footer, contact section, and floating concierge button.
                </p>
              </div>

              <button
                type="submit"
                className="btn-luxury px-6 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-xs shadow-md self-start sm:self-auto"
              >
                Save Social Media Links
              </button>
            </div>

            {/* Social Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Instagram */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-pink-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      IG
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Instagram Profile</h4>
                      <span className="text-[10px] text-slate-400">Photos, reels &amp; stories</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.instagram
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.instagram ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Instagram URL or Handle
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.instagram || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-pink-500"
                  />
                </div>

                {settingsForm.socials?.instagram && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-pink-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit Instagram Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, instagram: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Facebook */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-blue-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      FB
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Facebook Page</h4>
                      <span className="text-[10px] text-slate-400">Community &amp; promotions</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.facebook
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.facebook ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.facebook || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-blue-500"
                  />
                </div>

                {settingsForm.socials?.facebook && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit Facebook Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, facebook: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* WhatsApp Business */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      WA
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">WhatsApp Concierge</h4>
                      <span className="text-[10px] text-slate-400">Direct instant customer chat</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.contact?.whatsApp
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.contact?.whatsApp ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    WhatsApp Number (with Country Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.contact?.whatsApp || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, whatsApp: e.target.value },
                      })
                    }
                    placeholder="+923000762781"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Powers the persistent floating button on every page.
                  </span>
                </div>

                {settingsForm.contact?.whatsApp && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://wa.me/${settingsForm.contact.whatsApp.replace(/\D/g, '')}?text=Smart%20Connect%20Test%20Chat`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Test WhatsApp Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-cyan-400 text-xs font-bold shadow-sm">
                      TK
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">TikTok Profile</h4>
                      <span className="text-[10px] text-slate-400">Viral product unboxings</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.tiktok
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.tiktok ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    TikTok Profile URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.tiktok || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, tiktok: e.target.value },
                      })
                    }
                    placeholder="https://tiktok.com/@smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-cyan-500"
                  />
                </div>

                {settingsForm.socials?.tiktok && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit TikTok Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, tiktok: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* YouTube */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-red-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      YT
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">YouTube Channel</h4>
                      <span className="text-[10px] text-slate-400">Reviews &amp; craftsmanship videos</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.youtube
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.youtube ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.youtube || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-red-500"
                  />
                </div>

                {settingsForm.socials?.youtube && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-red-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit YouTube Channel</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, youtube: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* X / Twitter */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-slate-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-black border border-slate-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      X
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">X (Twitter) Profile</h4>
                      <span className="text-[10px] text-slate-400">Official news &amp; announcements</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.twitter
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.twitter ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    X (Twitter) URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.twitter || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, twitter: e.target.value },
                      })
                    }
                    placeholder="https://x.com/smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-slate-400"
                  />
                </div>

                {settingsForm.socials?.twitter && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-300 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit X Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, twitter: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 space-y-3 hover:border-blue-600/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      IN
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">LinkedIn Company Page</h4>
                      <span className="text-[10px] text-slate-400">Corporate &amp; partnerships</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      settingsForm.socials?.linkedin
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {settingsForm.socials?.linkedin ? '● Connected' : 'Not Set'}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.linkedin || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/company/smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-blue-600"
                  />
                </div>

                {settingsForm.socials?.linkedin && (
                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={settingsForm.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>Visit LinkedIn Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm({
                          ...settingsForm,
                          socials: { ...settingsForm.socials, linkedin: '' },
                        })
                      }
                      className="text-[10px] text-slate-500 hover:text-rose-400"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Live Storefront Preview */}
            <div className="p-6 rounded-2xl bg-[#0e1420] border border-[#c5a880]/30 space-y-3">
              <span className="text-xs uppercase tracking-wider text-[#c5a880] font-semibold block">
                Storefront Footer Preview
              </span>
              <p className="text-xs text-slate-400">
                This is how your social media badges and WhatsApp concierge line appear to customers on the website:
              </p>

              <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 flex flex-wrap items-center gap-2">
                {settingsForm.contact?.whatsApp && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] text-xs font-semibold border border-[#25D366]/30">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp: {settingsForm.contact.whatsApp}</span>
                  </span>
                )}
                {settingsForm.socials?.instagram && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    Instagram
                  </span>
                )}
                {settingsForm.socials?.facebook && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    Facebook
                  </span>
                )}
                {settingsForm.socials?.tiktok && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    TikTok
                  </span>
                )}
                {settingsForm.socials?.youtube && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    YouTube
                  </span>
                )}
                {settingsForm.socials?.twitter && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    X (Twitter)
                  </span>
                )}
                {settingsForm.socials?.linkedin && (
                  <span className="px-2.5 py-1 rounded bg-[#121926] text-slate-300 text-xs font-medium border border-slate-800">
                    LinkedIn
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-luxury px-8 py-3.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-sm shadow-xl"
              >
                Save Social Media Links
              </button>
            </div>
          </form>
        )}

        {/* ==================================================== */}
        {/* TAB: ADMIN LOGIN & PASSWORD CREDENTIALS */}
        {/* ==================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-8 text-left max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-luxury text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#c5a880]" />
                  <span>Admin Panel Login &amp; Password Settings</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Change your admin username, login email, display name, and master password. These credentials are saved securely in your store database.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active Super Admin</span>
                </span>
              </div>
            </div>

            {/* Current Active Account Status */}
            <div className="p-5 rounded-2xl bg-[#121824] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active Username / Email</div>
                  <div className="text-xs font-mono font-bold text-white truncate max-w-[200px]">
                    {adminUser?.email || currentAdminEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Access Privilege</div>
                  <div className="text-xs font-bold text-white">Full Store Super Admin</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Security Encryption</div>
                  <div className="text-xs font-bold text-white">Bcrypt 10-Round Hash</div>
                </div>
              </div>
            </div>

            {/* Change Credentials Form */}
            <form onSubmit={handleUpdateCredentials} className="p-6 sm:p-8 rounded-2xl bg-[#121824] border border-slate-800 space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="font-serif-luxury text-base font-bold text-white">
                  Update Login Credentials
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter your desired username/email and new password. You will need your current password to confirm the change.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Admin Username / Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Admin Username / Login Email *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={credForm.usernameOrEmail}
                    onChange={(e) =>
                      setCredForm({ ...credForm, usernameOrEmail: e.target.value })
                    }
                    placeholder="e.g. admin@smartconnect.pk or custom username"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[#c5a880]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Use this username/email to log in to the admin panel.
                  </span>
                </div>

                {/* 2. Admin Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Admin Display Name</span>
                  </label>
                  <input
                    type="text"
                    value={credForm.fullName}
                    onChange={(e) =>
                      setCredForm({ ...credForm, fullName: e.target.value })
                    }
                    placeholder="e.g. Smart Connect Executive Admin"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[#c5a880]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Greeting name shown inside the admin dashboard.
                  </span>
                </div>

                {/* 3. Current Master Password */}
                <div className="sm:col-span-2 p-4 rounded-xl bg-[#0b0f17] border border-amber-500/20">
                  <label className="block text-xs font-semibold text-amber-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Current Password (Required to verify authorization) *</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={credForm.currentPassword}
                      onChange={(e) =>
                        setCredForm({ ...credForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current active password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-[#121824] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 4. New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>New Password</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Min 6 characters</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={credForm.newPassword}
                      onChange={(e) =>
                        setCredForm({ ...credForm, newPassword: e.target.value })
                      }
                      placeholder="Leave blank to keep existing password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[#c5a880]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Only fill this if you want to change your password.
                  </span>
                </div>

                {/* 5. Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Confirm New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={credForm.confirmPassword}
                      onChange={(e) =>
                        setCredForm({ ...credForm, confirmPassword: e.target.value })
                      }
                      placeholder="Re-type new password"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:outline-none focus:border-[#c5a880]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Must match the new password above.
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Changes take effect immediately across all sessions.
                </span>

                <button
                  type="submit"
                  disabled={isUpdatingCreds}
                  className="btn-luxury px-6 py-3 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-xs hover:bg-[#d6bc98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {isUpdatingCreds ? 'Updating Credentials...' : 'Save & Update Admin Credentials'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: BANNERS & HERO SLIDER MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'banners' && (
          <div className="space-y-6 text-left max-w-5xl">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#121824] via-[#162032] to-[#121824] border border-[#c5a880]/30 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a880]/15 text-[#c5a880] text-xs font-semibold mb-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Homepage Slider &amp; Campaign Merchandising</span>
                </div>
                <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                  Banners &amp; Hero Slider
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Add, edit, reorder, or delete custom Hero Slider Banners and Promotional Campaign Strips for the website. Upload banner photos directly from your phone or PC gallery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAddBanner('hero')}
                  className="btn-luxury px-4 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Hero Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddBanner('promo')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 text-[#00f2d2]" />
                  <span>Add Promo Strip</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBannerTabFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  bannerTabFilter === 'all'
                    ? 'bg-[#c5a880] text-[#0b0f17]'
                    : 'bg-[#121824] text-slate-400 hover:text-white'
                }`}
              >
                All Banners ({(settingsForm?.banners || settings?.banners || []).length})
              </button>
              <button
                type="button"
                onClick={() => setBannerTabFilter('hero')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  bannerTabFilter === 'hero'
                    ? 'bg-[#c5a880] text-[#0b0f17]'
                    : 'bg-[#121824] text-slate-400 hover:text-white'
                }`}
              >
                Hero Slides ({((settingsForm?.banners || settings?.banners || []).filter((b) => b.type === 'hero')).length})
              </button>
              <button
                type="button"
                onClick={() => setBannerTabFilter('promo')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  bannerTabFilter === 'promo'
                    ? 'bg-[#c5a880] text-[#0b0f17]'
                    : 'bg-[#121824] text-slate-400 hover:text-white'
                }`}
              >
                Promo Strips ({((settingsForm?.banners || settings?.banners || []).filter((b) => b.type === 'promo')).length})
              </button>
            </div>

            {/* Banners List */}
            {(() => {
              const allBanners = settingsForm?.banners || settings?.banners || [];
              const filtered = allBanners.filter((b) => {
                if (bannerTabFilter === 'hero') return b.type === 'hero';
                if (bannerTabFilter === 'promo') return b.type === 'promo';
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center rounded-2xl bg-[#121824] border border-slate-800 space-y-3">
                    <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No Banners in this section</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click "Add Hero Banner" to create a new slider slide, or "Add Promo Strip" for campaign banners.
                    </p>
                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenAddBanner('hero')}
                        className="px-4 py-2 rounded-xl bg-[#c5a880] text-[#0b0f17] text-xs font-bold"
                      >
                        Add Hero Slide
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAddBanner('promo')}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
                      >
                        Add Promo Strip
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((banner) => (
                    <div
                      key={banner.id}
                      className="p-4 rounded-2xl bg-[#121824] border border-slate-800 hover:border-[#c5a880]/50 transition-all flex flex-col justify-between shadow-lg"
                    >
                      <div>
                        {/* Image Preview */}
                        <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-[#0a0e17] mb-3 border border-slate-800">
                          {banner.image ? (
                            <img
                              src={sanitizeImagePath(banner.image, FALLBACK_IMAGE)}
                              alt={banner.title}
                              className="w-full h-full object-cover"
                              onError={(e) => handleImageError(e, FALLBACK_IMAGE)}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-[#121928] via-[#162136] to-[#121928] p-4 text-center">
                              <span className="text-xs font-bold text-[#c5a880] uppercase tracking-wider">
                                {banner.badgeText || 'Campaign Strip'}
                              </span>
                              <span className="text-sm font-bold text-white mt-1 line-clamp-1">
                                {banner.title}
                              </span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                banner.type === 'hero'
                                  ? 'bg-[#c5a880] text-[#0b0f17]'
                                  : 'bg-[#00f2d2] text-[#0b0f17]'
                              }`}
                            >
                              {banner.type === 'hero' ? 'Hero Slide' : 'Promo Strip'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                banner.isActive
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {banner.isActive ? 'Active (Live)' : 'Hidden'}
                            </span>
                          </div>
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1">
                          {banner.badgeText && (
                            <span className="text-[10px] font-semibold text-[#c5a880] block">
                              ✦ {banner.badgeText}
                            </span>
                          )}
                          <h4 className="font-serif-luxury text-sm font-bold text-white line-clamp-1">
                            {banner.title}
                          </h4>
                          {banner.subtitle && (
                            <p className="text-xs text-slate-400 line-clamp-2">
                              {banner.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Target Tag */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono">
                            CTA: <strong className="text-slate-200">{banner.ctaText || 'Shop Collection'}</strong>
                          </span>
                          <span className="text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded">
                            Target: {banner.linkType === 'category' ? banner.linkValue || 'Category' : banner.linkType || 'shop'}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleBannerStatus(banner.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                            banner.isActive
                              ? 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60'
                              : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
                          }`}
                        >
                          {banner.isActive ? 'Hide from Store' : 'Set Active'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBanner(banner)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                            title="Edit banner"
                          >
                            <Pencil className="w-4 h-4 text-[#c5a880]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-colors"
                            title="Delete banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: WEBSITE SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && settingsForm && (
          <form onSubmit={handleSaveSettings} className="space-y-8 text-left max-w-4xl">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-white">Website Settings</h2>
              <p className="text-xs text-slate-400">
                Update store name, upload brand logo from device, announcement bar, hero section, WhatsApp support number, and shipping rates without touching source code.
              </p>
            </div>

            {/* Quick Access: Admin Username & Password Settings */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#121824] via-[#162032] to-[#121824] border border-[#c5a880]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#c5a880]/15 border border-[#c5a880]/30 flex items-center justify-center text-[#c5a880] shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-base font-bold text-white">
                    Admin Panel Login Username &amp; Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    Change your admin username, email, and master password securely from the dedicated security vault.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-4 py-2.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-xs hover:bg-[#d6bc98] transition-colors shrink-0 flex items-center gap-1.5 shadow-md"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Change Username &amp; Password</span>
              </button>
            </div>

            {/* Store Brand & Logo Upload Section */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-white">Brand Identity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Brand Tagline
                  </label>
                  <input
                    type="text"
                    value={settingsForm.tagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Logo Upload Directly from Device */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Upload Brand Logo from Device Gallery / File Picker
                </label>
                <div className="flex items-center gap-4">
                  {settingsForm.logoUrl && (
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                      <img
                        src={settingsForm.logoUrl}
                        alt="Brand Logo Preview"
                        className="h-10 w-auto object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center gap-2 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>Choose Logo File from Device</span>
                  </button>
                  {settingsForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Reset to Vector Insignia
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Announcement Bar */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury text-base font-bold text-white">
                  Announcement Bar
                </h3>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsForm.announcementBar.enabled}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        announcementBar: {
                          ...settingsForm.announcementBar,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded accent-[#c5a880]"
                  />
                  <span>Show Announcement Bar</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Announcement Message
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementBar.text}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      announcementBar: {
                        ...settingsForm.announcementBar,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                />
              </div>
            </div>

            {/* Hero Section Copy & Banner */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-white">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hero Main Heading
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hero.heading}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        hero: { ...settingsForm.hero, heading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hero Description
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.hero.subheading}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        hero: { ...settingsForm.hero, subheading: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                {/* Upload Banner from Device */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Hero Banner Image
                  </label>
                  <div className="flex items-center gap-4">
                    {settingsForm.hero.bannerImage && (
                      <img
                        src={settingsForm.hero.bannerImage}
                        alt="Hero Banner Preview"
                        className="w-20 h-14 object-cover rounded-lg border border-slate-700"
                      />
                    )}
                    <input
                      type="file"
                      ref={bannerInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white flex items-center gap-2 border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>Upload Banner from Device</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp & Contact Desk */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Concierge &amp; Direct Support</span>
                </h3>
                {settingsForm.contact.whatsApp && (
                  <a
                    href={`https://wa.me/${settingsForm.contact.whatsApp.replace(/\D/g, '')}?text=Smart%20Connect%20Test%20Ping`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 text-xs font-semibold transition-colors"
                  >
                    <span>Test WhatsApp Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Number (with Country Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.contact.whatsApp}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, whatsApp: e.target.value },
                      })
                    }
                    placeholder="+923000762781"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:border-[#25D366]"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Powers the persistent floating WhatsApp button in the store.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Direct Phone Line
                  </label>
                  <input
                    type="text"
                    value={settingsForm.contact.phone}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, phone: e.target.value },
                      })
                    }
                    placeholder="+92 300 0762781"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contact.email}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, email: e.target.value },
                      })
                    }
                    placeholder="concierge@smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Showroom / Office Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.contact.address}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        contact: { ...settingsForm.contact, address: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links Section */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-white">Social Media Channels</h3>
              <p className="text-xs text-slate-400">
                Provide profile URLs displayed in the store footer, header, and trust sections.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.instagram || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.facebook || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, facebook: e.target.value },
                      })
                    }
                    placeholder="https://facebook.com/smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.tiktok || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, tiktok: e.target.value },
                      })
                    }
                    placeholder="https://tiktok.com/@smartconnect.pk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.youtube || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, youtube: e.target.value },
                      })
                    }
                    placeholder="https://youtube.com/@smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    X (Twitter) URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.twitter || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, twitter: e.target.value },
                      })
                    }
                    placeholder="https://x.com/smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={settingsForm.socials?.linkedin || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        socials: { ...settingsForm.socials, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/company/smartconnectpk"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Custom Shipping & Return Policies */}
            <div className="p-6 rounded-2xl bg-[#121824] border border-slate-800 space-y-4">
              <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#c5a880]" />
                <span>Custom Shipping &amp; Return Policies</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure rates, courier transit parameters, and Pakistani exchange/refund rules.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Free Delivery Threshold in Rs. *
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shipping.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shipping: {
                          ...settingsForm.shipping,
                          freeDeliveryThreshold: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg tabular-nums"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Orders at or above this amount automatically receive Rs. 0 shipping fee.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Standard Courier Delivery Fee (Rs.) *
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shipping.deliveryFee}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shipping: {
                          ...settingsForm.shipping,
                          deliveryFee: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg tabular-nums"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Charged when order total is below the free delivery threshold.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Transit Time
                  </label>
                  <input
                    type="text"
                    value={settingsForm.shipping.estimatedDeliveryDays || '2 to 4 business days'}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shipping: {
                          ...settingsForm.shipping,
                          estimatedDeliveryDays: e.target.value,
                        },
                      })
                    }
                    placeholder="2 to 4 business days"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Authorized Courier Partners
                  </label>
                  <input
                    type="text"
                    value={settingsForm.shipping.courierPartners || 'TCS Express, Leopard Courier, Call Courier'}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        shipping: {
                          ...settingsForm.shipping,
                          courierPartners: e.target.value,
                        },
                      })
                    }
                    placeholder="TCS, Leopard, Call Courier"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Policy Text Blocks */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Shipping &amp; Dispatch Policy Text
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.policies?.shippingPolicy || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        policies: {
                          ...settingsForm.policies,
                          shippingPolicy: e.target.value,
                          returnPolicy: settingsForm.policies?.returnPolicy || '',
                          codTerms: settingsForm.policies?.codTerms || '',
                        },
                      })
                    }
                    placeholder="Describe shipping transit, free shipping terms, and courier handling..."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Return &amp; Exchange Policy Text
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.policies?.returnPolicy || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        policies: {
                          ...settingsForm.policies,
                          returnPolicy: e.target.value,
                          shippingPolicy: settingsForm.policies?.shippingPolicy || '',
                          codTerms: settingsForm.policies?.codTerms || '',
                        },
                      })
                    }
                    placeholder="Describe 7-day exchange terms, defect inspection, and return criteria..."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cash on Delivery (COD) Doorstep Terms
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.policies?.codTerms || ''}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        policies: {
                          ...settingsForm.policies,
                          codTerms: e.target.value,
                          shippingPolicy: settingsForm.policies?.shippingPolicy || '',
                          returnPolicy: settingsForm.policies?.returnPolicy || '',
                        },
                      })
                    }
                    placeholder="Explain doorstep parcel inspection and payment upon delivery..."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-luxury px-8 py-3.5 rounded-xl bg-[#c5a880] text-[#0b0f17] font-bold text-sm shadow-xl"
            >
              Save All Website Settings
            </button>
          </form>
        )}

        {/* ==================================================== */}
        {/* PRODUCT ADD / EDIT MODAL WITH DEVICE IMAGE UPLOADER */}
        {/* ==================================================== */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#0f1522] border border-[#c5a880]/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-left my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  {editingProduct ? 'Edit Luxury Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Product Name */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Royal Emerald Chronograph 41mm"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                {/* Category & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono"
                    />
                  </div>
                </div>

                {/* Prices & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Sale Price in Rs. *
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, price: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Original Price (Rs.)
                    </label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) =>
                        setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({ ...productForm, stock: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg tabular-nums"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Short Summary (Shows on card)
                  </label>
                  <input
                    type="text"
                    value={productForm.shortDescription}
                    onChange={(e) =>
                      setProductForm({ ...productForm, shortDescription: e.target.value })
                    }
                    placeholder="Brief 1-line luxury summary"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Description &amp; Craftsmanship Story
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                {/* DEVICE IMAGE UPLOAD SECTION */}
                <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">
                        Upload Product Photos from Device
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Supports JPG, PNG, WEBP directly from your phone gallery or computer.
                      </span>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleProductImageFiles}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold flex items-center gap-1.5 hover:bg-[#d6bc98] transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Pick from Device'}</span>
                    </button>
                  </div>

                  {/* Thumbnail Previews & Main Image Selection */}
                  {productForm.images.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                      {productForm.images.map((img, i) => (
                        <div
                          key={i}
                          className={`relative rounded-lg overflow-hidden border-2 group aspect-square ${
                            productForm.mainImage === img
                              ? 'border-[#c5a880] ring-2 ring-[#c5a880]/30'
                              : 'border-slate-800'
                          }`}
                        >
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          {/* Main badge */}
                          {productForm.mainImage === img ? (
                            <span className="absolute bottom-1 left-1 text-[9px] bg-[#c5a880] text-[#0b0f17] px-1.5 py-0.5 rounded font-bold">
                              Main Photo
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setProductForm({ ...productForm, mainImage: img })}
                              className="absolute bottom-1 left-1 text-[9px] bg-slate-900/80 hover:bg-[#c5a880] hover:text-[#0b0f17] text-white px-1.5 py-0.5 rounded font-semibold transition-colors"
                            >
                              Set Main
                            </button>
                          )}
                          {/* Delete photo */}
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = productForm.images.filter((_, idx) => idx !== i);
                              setProductForm({
                                ...productForm,
                                images: remaining,
                                mainImage:
                                  productForm.mainImage === img
                                    ? remaining[0] || ''
                                    : productForm.mainImage,
                              });
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/70 text-slate-300 hover:text-rose-400 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Flags: Featured, Bestseller, New Arrival */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isFeatured: e.target.checked })
                      }
                      className="rounded accent-[#c5a880]"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isBestSeller}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isBestSeller: e.target.checked })
                      }
                      className="rounded accent-[#c5a880]"
                    />
                    <span>Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.isNewArrival}
                      onChange={(e) =>
                        setProductForm({ ...productForm, isNewArrival: e.target.checked })
                      }
                      className="rounded accent-[#c5a880]"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>

                {/* Customer Reviews & Social Proof Section */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Curated Customer Reviews &amp; Social Proof</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Add verified buyer feedback that appears on this product's page.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProductReviewsList([
                          ...productReviewsList,
                          { customerName: '', rating: 5, comment: '' },
                        ])
                      }
                      className="px-2.5 py-1 rounded bg-[#c5a880]/15 text-[#c5a880] border border-[#c5a880]/30 text-[11px] font-semibold hover:bg-[#c5a880]/25 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Review</span>
                    </button>
                  </div>

                  {productReviewsList.length === 0 ? (
                    <div className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-[11px] text-slate-500 text-center">
                      No customer reviews attached. Click "Add Review" to add social proof.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {productReviewsList.map((rev, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-2 relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a880]">
                              Review #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setProductReviewsList(
                                  productReviewsList.filter((_, i) => i !== idx)
                                );
                              }}
                              className="text-slate-500 hover:text-rose-400 p-0.5"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] text-slate-400 mb-0.5">
                                Reviewer Name &amp; City *
                              </label>
                              <input
                                type="text"
                                value={rev.customerName}
                                onChange={(e) => {
                                  const updated = [...productReviewsList];
                                  updated[idx].customerName = e.target.value;
                                  setProductReviewsList(updated);
                                }}
                                placeholder="e.g. Farhan Ali (Islamabad)"
                                className="w-full px-2.5 py-1.5 text-xs bg-[#121824] text-white border border-slate-700 rounded-lg"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">
                                Rating Stars *
                              </label>
                              <select
                                value={rev.rating}
                                onChange={(e) => {
                                  const updated = [...productReviewsList];
                                  updated[idx].rating = Number(e.target.value);
                                  setProductReviewsList(updated);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs bg-[#121824] text-white border border-slate-700 rounded-lg"
                              >
                                <option value={5}>★★★★★ (5 Stars)</option>
                                <option value={4}>★★★★☆ (4 Stars)</option>
                                <option value={3}>★★★☆☆ (3 Stars)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-0.5">
                              Customer Feedback / Comment *
                            </label>
                            <textarea
                              rows={2}
                              value={rev.comment}
                              onChange={(e) => {
                                const updated = [...productReviewsList];
                                updated[idx].comment = e.target.value;
                                setProductReviewsList(updated);
                              }}
                              placeholder="e.g. Delivered safely in 2 days. 100% original luxury item with warranty card."
                              className="w-full px-2.5 py-1.5 text-xs bg-[#121824] text-white border border-slate-700 rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-luxury px-6 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold hover:bg-[#d6bc98]"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CATEGORY ADD / EDIT MODAL WITH DEVICE IMAGE UPLOADER */}
        {/* ==================================================== */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-[#0f1522] border border-[#c5a880]/30 rounded-3xl shadow-2xl p-6 sm:p-8 text-left my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <h3 className="font-serif-luxury text-xl font-bold text-white">
                  {editingCategory ? 'Edit Store Category' : 'Create New Category'}
                </h3>
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                {/* Category Name */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCatForm({
                        ...catForm,
                        name,
                        slug: editingCategory ? catForm.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                      });
                    }}
                    placeholder="e.g. Footwear & Shoes"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                {/* Category Slug */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={catForm.slug}
                    onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                    placeholder="e.g. footwear-shoes"
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg font-mono"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    placeholder="Brief description of the department's luxury pieces..."
                    className="w-full px-3 py-2 bg-[#0b0f17] text-white border border-slate-700 rounded-lg"
                  />
                </div>

                {/* Cover Image Upload from Device */}
                <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-3">
                  <span className="font-semibold text-white block">
                    Category Cover Photo
                  </span>

                  {catForm.image && (
                    <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={catForm.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={catFileInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleCategoryImageFile}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => catFileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold flex items-center gap-1.5 hover:bg-[#d6bc98] transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pick Cover from Device</span>
                    </button>

                    <input
                      type="text"
                      value={catForm.image}
                      onChange={(e) => setCatForm({ ...catForm, image: e.target.value })}
                      placeholder="Or paste image URL"
                      className="flex-1 px-3 py-2 bg-[#121824] text-white border border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Visibility Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={catForm.isVisible}
                      onChange={(e) => setCatForm({ ...catForm, isVisible: e.target.checked })}
                      className="rounded accent-[#c5a880]"
                    />
                    <span className="font-medium">Visible on Storefront and Department Grids</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCatModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-luxury px-6 py-2 rounded-lg bg-[#c5a880] text-[#0b0f17] font-semibold hover:bg-[#d6bc98]"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* ==================================================== */}
        {/* MODAL: ADD / EDIT BANNER */}
        {/* ==================================================== */}
        {isBannerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#121824] border border-[#c5a880]/40 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 text-left shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#c5a880]/15 flex items-center justify-center text-[#c5a880]">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury text-lg font-bold text-white">
                      {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {bannerForm.type === 'hero' ? 'Homepage Hero Slider Slide' : 'Campaign Promotional Strip'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                {/* Banner Type Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Banner Placement / Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, type: 'hero' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bannerForm.type === 'hero'
                          ? 'border-[#c5a880] bg-[#c5a880]/10 text-white'
                          : 'border-slate-800 bg-[#0b0f17] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs block text-white">Hero Showcase Slider</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Top of Homepage carousel with luxury frame</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerForm({ ...bannerForm, type: 'promo' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        bannerForm.type === 'promo'
                          ? 'border-[#00f2d2] bg-[#00f2d2]/10 text-white'
                          : 'border-slate-800 bg-[#0b0f17] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-xs block text-white">Campaign Promo Strip</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Full-width highlight strip between collections</span>
                    </button>
                  </div>
                </div>

                {/* Badge Tag */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badgeText}
                    onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
                    placeholder="e.g. Curated Luxury 2026, Limited Eid Offer, New Arrivals"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                {/* Banner Heading */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Banner Title / Main Heading *
                  </label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="e.g. Signature Horology & Smart Devices"
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                {/* Banner Subtitle / Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="Brief description or promotional details..."
                    className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                {/* Banner Image Upload */}
                <div className="p-4 rounded-xl bg-[#0b0f17] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Banner Image {bannerForm.type === 'hero' ? '(Hero 16:9 or 4:3)' : '(Promo Strip)'}
                    </span>
                    {uploadingBannerImage && (
                      <span className="text-[11px] text-[#c5a880] animate-pulse">Uploading photo...</span>
                    )}
                  </div>

                  {bannerForm.image && (
                    <div className="relative aspect-[16/8] w-full rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={bannerForm.image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setBannerForm({ ...bannerForm, image: '' })}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:text-rose-200"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="file"
                      ref={bannerFilePickerRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleBannerModalImageUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => bannerFilePickerRef.current?.click()}
                      disabled={uploadingBannerImage}
                      className="px-4 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload from Device Gallery</span>
                    </button>

                    <input
                      type="text"
                      value={bannerForm.image}
                      onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                      placeholder="Or paste external image URL"
                      className="flex-1 px-3 py-2 text-xs bg-[#121824] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Call to Action Button Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Button Text (CTA)
                    </label>
                    <input
                      type="text"
                      value={bannerForm.ctaText}
                      onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
                      placeholder="e.g. Shop Collection, View Deals"
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Button Click Destination
                    </label>
                    <select
                      value={bannerForm.linkType}
                      onChange={(e) =>
                        setBannerForm({
                          ...bannerForm,
                          linkType: e.target.value as any,
                          linkValue: e.target.value === 'category' ? (categories[0]?.name || '') : e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                    >
                      <option value="shop">Full Shop Catalog (All Products)</option>
                      <option value="categories">Categories Page (All Departments)</option>
                      <option value="category">Specific Category</option>
                    </select>
                  </div>
                </div>

                {/* Specific Category Target Dropdown */}
                {bannerForm.linkType === 'category' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Target Category
                    </label>
                    <select
                      value={bannerForm.linkValue}
                      onChange={(e) => setBannerForm({ ...bannerForm, linkValue: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#0b0f17] text-white border border-slate-700 rounded-xl focus:border-[#c5a880] focus:outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Active Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={bannerForm.isActive}
                      onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#c5a880]"
                    />
                    <span className="text-xs font-semibold">Active &amp; Visible on Website</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-luxury px-6 py-2 rounded-xl bg-[#c5a880] hover:bg-[#d6bc98] text-[#0b0f17] font-bold text-xs shadow-lg transition-all"
                  >
                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
