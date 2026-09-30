export type ProductStatus = 'active' | 'draft' | 'archived';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  shortDescription: string;
  description: string;
  specifications: ProductSpecification[];
  stock: number;
  sku: string;
  images: string[];
  mainImage: string;
  rating: number;
  reviewCount: number;
  status: ProductStatus;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isVisible: boolean;
  productCount?: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  orderNotes?: string;
}

export type PaymentMethodType =
  | 'Cash on Delivery (COD)'
  | 'Online Bank Transfer (IBFT / Raast)'
  | 'JazzCash / EasyPaisa'
  | 'Credit / Debit Card';

export interface PaymentDetails {
  transactionId?: string;
  bankName?: string;
  senderAccountName?: string;
  senderAccountNumber?: string;
  walletNumber?: string;
  proofUrl?: string;
  cardLast4?: string;
  cardHolderName?: string;
  paidAt?: string;
  paymentStatus?: 'pending_verification' | 'verified' | 'unpaid';
}

export interface BankTransferConfig {
  enabled: boolean;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  raastId?: string;
  branchCode?: string;
  instructions: string;
}

export interface MobileWalletConfig {
  enabled: boolean;
  walletName: string;
  accountTitle: string;
  accountNumber: string;
  tillNumber?: string;
  instructions: string;
}

export interface CardPaymentConfig {
  enabled: boolean;
  provider: string;
  merchantId?: string;
  instructions: string;
}

export interface PaymentSettings {
  cod: {
    enabled: boolean;
    instructions: string;
  };
  bankTransfer: BankTransferConfig;
  mobileWallets: MobileWalletConfig;
  cardPayment: CardPaymentConfig;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer: CustomerShippingAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethodType;
  paymentDetails?: PaymentDetails;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  province?: string;
  avatarUrl?: string;
  authProvider?: 'email' | 'google';
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Banner {
  id: string;
  type: 'hero' | 'promo';
  title: string;
  subtitle?: string;
  badgeText?: string;
  image: string;
  ctaText?: string;
  linkType?: 'shop' | 'categories' | 'category' | 'external';
  linkValue?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
}

export interface WebsiteSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  announcementBar: {
    enabled: boolean;
    text: string;
  };
  hero: {
    heading: string;
    subheading: string;
    badgeText: string;
    bannerImage?: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  banners?: Banner[];
  contact: {
    phone: string;
    whatsApp: string;
    email: string;
    address: string;
  };
  socials: {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube: string;
    twitter?: string;
    linkedin?: string;
  };
  shipping: {
    deliveryFee: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryDays?: string;
    courierPartners?: string;
  };
  policies: {
    shippingPolicy: string;
    returnPolicy: string;
    codTerms: string;
  };
  payments?: PaymentSettings;
  about: {
    title: string;
    description: string;
    story: string;
  };
  footerText: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
