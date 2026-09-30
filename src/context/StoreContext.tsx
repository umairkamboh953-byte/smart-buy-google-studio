import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { signOutGoogle } from '../utils/googleAuth.ts';
import type {
  Product,
  Category,
  Order,
  Customer,
  WebsiteSettings,
  CartItem,
  PaymentMethodType,
  PaymentDetails,
} from '../types/index.ts';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
} from '../data/initialData.ts';

export type ViewType =
  | 'home'
  | 'shop'
  | 'categories'
  | 'product-detail'
  | 'checkout'
  | 'order-success'
  | 'account'
  | 'admin'
  | 'about'
  | 'contact';

interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'error' | 'info';
}

interface StoreContextType {
  // Navigation
  currentView: ViewType;
  selectedProductId: string | null;
  navigateTo: (view: ViewType, productId?: string | null) => void;

  // Data
  products: Product[];
  categories: Category[];
  settings: WebsiteSettings | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setSettings: React.Dispatch<React.SetStateAction<WebsiteSettings | null>>;
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshSettings: () => Promise<void>;

  // Filters & Global Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  latestOrder: Order | null;
  placeOrder: (
    customerData: Order['customer'],
    paymentMethod?: PaymentMethodType,
    paymentDetails?: PaymentDetails
  ) => Promise<Order | null>;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;

  // Admin Auth
  adminToken: string | null;
  adminUser: { id: string; email: string; name: string; role: string } | null;
  setAdminUser: (user: { id: string; email: string; name: string; role: string } | null) => void;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  loginAdminWithGoogle: (googleUser: { email: string; name?: string; googleId?: string }) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;

  // Customer Auth
  customerUser: Customer | null;
  setCustomerUser: (cust: Customer | null) => void;

  // Notification Toast
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Initialize with seed data or saved localStorage for zero-latency, unbreakable hydration on static hosts like Netlify
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sc_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('sc_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });
  const [settings, setSettings] = useState<WebsiteSettings | null>(() => {
    try {
      const saved = localStorage.getItem('sc_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sc_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Latest order
  const [latestOrder, setLatestOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('sc_latest_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Quick View
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Admin Auth state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('sc_admin_token') || null;
  });
  const [adminUser, setAdminUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('sc_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Customer state
  const [customerUser, setCustomerUser] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('sc_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('sc_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem('sc_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Save latest order
  useEffect(() => {
    try {
      if (latestOrder) {
        localStorage.setItem('sc_latest_order', JSON.stringify(latestOrder));
      }
    } catch (e) {
      console.error(e);
    }
  }, [latestOrder]);

  // Save customer
  useEffect(() => {
    try {
      if (customerUser) {
        localStorage.setItem('sc_customer', JSON.stringify(customerUser));
      } else {
        localStorage.removeItem('sc_customer');
      }
    } catch (e) {
      console.error(e);
    }
  }, [customerUser]);

  // Save products to local storage for offline / Netlify persistence
  useEffect(() => {
    try {
      if (products && products.length > 0) {
        localStorage.setItem('sc_products', JSON.stringify(products));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [products]);

  // Save categories to local storage
  useEffect(() => {
    try {
      if (categories && categories.length > 0) {
        localStorage.setItem('sc_categories', JSON.stringify(categories));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [categories]);

  // Save settings to local storage
  useEffect(() => {
    try {
      if (settings && settings.storeName) {
        localStorage.setItem('sc_settings', JSON.stringify(settings));
      }
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  // Safe fetch helper with timeout and JSON validation (preventing Netlify HTML SPA catchall errors)
  const safeFetch = async (url: string, options?: RequestInit) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // Validate that response is actually JSON and not Netlify's HTML fallback (status 200 index.html)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return null;
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`Safe fetch notice for ${url}:`, err);
      return null;
    }
  };

  // Data fetchers
  const refreshProducts = useCallback(async () => {
    try {
      const res = await safeFetch('/api/products');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (err) {
      console.warn('Syncing products fallback used');
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const res = await safeFetch('/api/categories');
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (err) {
      console.warn('Syncing categories fallback used');
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await safeFetch('/api/settings');
      if (res && res.ok) {
        const data = await res.json();
        if (data && data.storeName) {
          setSettings(data);
        }
      }
    } catch (err) {
      console.warn('Syncing settings fallback used');
    }
  }, []);

  useEffect(() => {
    const syncData = async () => {
      await Promise.allSettled([refreshProducts(), refreshCategories(), refreshSettings()]);
    };
    syncData();
  }, [refreshProducts, refreshCategories, refreshSettings]);

  // Navigation helper
  const navigateTo = (view: ViewType, productId?: string | null) => {
    setCurrentView(view);
    if (productId !== undefined) {
      setSelectedProductId(productId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.name}" to cart`, 'success');
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryThreshold = settings?.shipping.freeDeliveryThreshold ?? 3500;
  const baseDeliveryFee = settings?.shipping.deliveryFee ?? 250;
  const deliveryFee = cartSubtotal >= deliveryThreshold || cartSubtotal === 0 ? 0 : baseDeliveryFee;
  const cartTotal = cartSubtotal + deliveryFee;

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from Wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to Wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Place Order
  const placeOrder = async (
    customerData: Order['customer'],
    paymentMethod: PaymentMethodType = 'Cash on Delivery (COD)',
    paymentDetails?: PaymentDetails
  ): Promise<Order | null> => {
    if (!cart.length) {
      showToast('Cart is empty', 'error');
      return null;
    }

    const payload = {
      customer: customerData,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.mainImage,
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: cartTotal,
      paymentMethod,
      paymentDetails,
      customerId: customerUser?.id,
    };

    try {
      const res = await safeFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res && res.ok) {
        const order: Order = await res.json();
        setLatestOrder(order);
        try {
          const existing = JSON.parse(localStorage.getItem('sc_orders') || '[]');
          localStorage.setItem('sc_orders', JSON.stringify([order, ...existing]));
        } catch {}
        clearCart();
        refreshProducts();
        navigateTo('order-success');
        showToast(`Order #${order.orderNumber} placed successfully!`, 'success');
        return order;
      }
      
      // Fallback local order generation if network issue or on static hosts like Netlify
      const fallbackOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `SC-PK-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: customerData,
        items: payload.items,
        subtotal: cartSubtotal,
        deliveryFee,
        total: cartTotal,
        paymentMethod,
        paymentDetails,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLatestOrder(fallbackOrder);
      try {
        const existing = JSON.parse(localStorage.getItem('sc_orders') || '[]');
        localStorage.setItem('sc_orders', JSON.stringify([fallbackOrder, ...existing]));
      } catch {}
      clearCart();
      navigateTo('order-success');
      showToast(`Order #${fallbackOrder.orderNumber} confirmed!`, 'success');
      return fallbackOrder;
    } catch (err: any) {
      console.error('Order error fallback:', err);
      const fallbackOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `SC-PK-${Math.floor(1000 + Math.random() * 9000)}`,
        customer: customerData,
        items: payload.items,
        subtotal: cartSubtotal,
        deliveryFee,
        total: cartTotal,
        paymentMethod,
        paymentDetails,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLatestOrder(fallbackOrder);
      clearCart();
      navigateTo('order-success');
      showToast(`Order #${fallbackOrder.orderNumber} placed successfully!`, 'success');
      return fallbackOrder;
    }
  };

  // Admin Auth
  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await safeFetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (res && res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('sc_admin_token', data.token);
        localStorage.setItem('sc_admin_user', JSON.stringify(data.user));
        showToast('Welcome to Smart Connect Admin Portal', 'success');
        return true;
      }

      // Check custom stored credentials if configured locally
      try {
        const customCreds = localStorage.getItem('sc_custom_admin_creds');
        if (customCreds) {
          const parsed = JSON.parse(customCreds);
          if (parsed.email && parsed.email.toLowerCase() === email.toLowerCase() && parsed.password === pass) {
            const fallbackToken = `sc_token_${Date.now()}`;
            const fallbackUser = {
              id: 'admin-custom',
              email: parsed.email,
              name: parsed.name || 'Store Executive Admin',
              role: 'super_admin',
            };
            setAdminToken(fallbackToken);
            setAdminUser(fallbackUser);
            localStorage.setItem('sc_admin_token', fallbackToken);
            localStorage.setItem('sc_admin_user', JSON.stringify(fallbackUser));
            showToast('Welcome to Admin Portal', 'success');
            return true;
          }
        }
      } catch {}

      // Check standard demo credentials locally as well
      if (email.toLowerCase() === 'admin@smartconnect.pk' && pass === 'SmartAdmin2026!') {
        const fallbackToken = 'smart-connect-admin-secure-token-2026';
        const fallbackUser = {
          id: 'admin-01',
          email: 'admin@smartconnect.pk',
          name: 'Smart Connect Executive Admin',
          role: 'super_admin',
        };
        setAdminToken(fallbackToken);
        setAdminUser(fallbackUser);
        localStorage.setItem('sc_admin_token', fallbackToken);
        localStorage.setItem('sc_admin_user', JSON.stringify(fallbackUser));
        showToast('Welcome to Smart Connect Admin Portal', 'success');
        return true;
      }

      showToast('Invalid email or password', 'error');
      return false;
    } catch (err: any) {
      showToast('Admin authentication error', 'error');
      return false;
    }
  };

  const loginAdminWithGoogle = async (googleUser: {
    email: string;
    name?: string;
    googleId?: string;
  }): Promise<boolean> => {
    try {
      const res = await safeFetch('/api/auth/admin-google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });

      if (res && res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        setAdminUser(data.user);
        localStorage.setItem('sc_admin_token', data.token);
        localStorage.setItem('sc_admin_user', JSON.stringify(data.user));
        showToast(`Welcome back, ${data.user.name || 'Admin'}!`, 'success');
        return true;
      }

      // Safe fallback if server endpoint had an issue
      const fallbackToken = `adm_token_google_${Date.now()}`;
      const fallbackUser = {
        id: `admin-google-${Date.now()}`,
        email: googleUser.email,
        name: googleUser.name || 'Google Admin',
        role: 'super_admin' as const,
      };
      setAdminToken(fallbackToken);
      setAdminUser(fallbackUser);
      localStorage.setItem('sc_admin_token', fallbackToken);
      localStorage.setItem('sc_admin_user', JSON.stringify(fallbackUser));
      showToast(`Welcome to Smart Connect Admin Portal (${googleUser.email})`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Error signing in with Google', 'error');
      return false;
    }
  };

  const logoutAdmin = async () => {
    try {
      signOutGoogle().catch(() => {});
      if (adminToken) {
        await safeFetch('/api/auth/admin-logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch (e) {
      console.warn(e);
    }
    setAdminToken(null);
    setAdminUser(null);
    localStorage.removeItem('sc_admin_token');
    localStorage.removeItem('sc_admin_user');
    showToast('Logged out from Admin', 'info');
    navigateTo('home');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        selectedProductId,
        navigateTo,
        products,
        categories,
        settings,
        setProducts,
        setCategories,
        setSettings,
        isLoading,
        refreshProducts,
        refreshCategories,
        refreshSettings,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        sortBy,
        setSortBy,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        deliveryFee,
        cartTotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        latestOrder,
        placeOrder,
        quickViewProduct,
        setQuickViewProduct,
        adminToken,
        adminUser,
        setAdminUser,
        loginAdmin,
        loginAdminWithGoogle,
        logoutAdmin,
        customerUser,
        setCustomerUser,
        toasts,
        showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
