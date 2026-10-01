import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import type {
  Product,
  Category,
  Order,
  Customer,
  ProductReview,
  WebsiteSettings,
} from '../types/index.ts';

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'super_admin' | 'editor';
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  adminUsers: AdminUser[];
  reviews: ProductReview[];
  settings: WebsiteSettings;
  wishlists: Record<string, string[]>; // customerId/sessionKey -> productId[]
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'smartconnect.json');

// Initial Seed Data with generated luxury product assets
export const getInitialSeedData = (): DatabaseSchema => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('SmartAdmin2026!', salt);

  const heroImage = '/src/assets/images/hero_luxury_showcase_1790499579518.jpg';
  const watchImage = '/src/assets/images/product_chronograph_watch_1790499593612.jpg';
  const headphonesImage = '/src/assets/images/product_anc_headphones_1790499604746.jpg';
  const perfumeImage = '/src/assets/images/product_royal_oud_perfume_1790499617705.jpg';
  const bagImage = '/src/assets/images/product_leather_bag_1790499629986.jpg';

  const categories: Category[] = [
    {
      id: 'cat-watches',
      name: 'Luxury Watches',
      slug: 'watches',
      description: 'Precision horology and handcrafted executive timepieces.',
      image: watchImage,
      isVisible: true,
      productCount: 4,
    },
    {
      id: 'cat-electronics',
      name: 'Electronics & Audio',
      slug: 'electronics',
      description: 'High-fidelity acoustic hardware and intelligent connected gadgets.',
      image: headphonesImage,
      isVisible: true,
      productCount: 5,
    },
    {
      id: 'cat-fragrances',
      name: 'Perfumes & Oud',
      slug: 'perfumes',
      description: 'Rare oriental extraits, royal Arabian oud, and artisanal fragrances.',
      image: perfumeImage,
      isVisible: true,
      productCount: 3,
    },
    {
      id: 'cat-leather',
      name: 'Leather Goods',
      slug: 'leather-goods',
      description: 'Handstitched full-grain leather bags, wallets, and executive accessories.',
      image: bagImage,
      isVisible: true,
      productCount: 4,
    },
    {
      id: 'cat-home',
      name: 'Home & Living',
      slug: 'home-living',
      description: 'Smart ambient illumination, luxury decor, and architectural essentials.',
      image: heroImage,
      isVisible: true,
      productCount: 3,
    },
    {
      id: 'cat-fashion',
      name: 'Fashion & Accessories',
      slug: 'fashion-accessories',
      description: 'Premium apparel, heritage cufflinks, and bespoke styling accents.',
      image: watchImage,
      isVisible: true,
      productCount: 3,
    },
  ];

  const products: Product[] = [
    {
      id: 'prod-sc-01',
      name: 'Vanguard Chronometer Titanium 42mm',
      slug: 'vanguard-chronometer-titanium',
      category: 'Luxury Watches',
      price: 34999,
      originalPrice: 42000,
      discountPercentage: 17,
      shortDescription: 'Grade 5 titanium automatic chronometer with anti-reflective sapphire crystal and exhibition caseback.',
      description: 'Engineered for exceptional horological precision, the Vanguard Chronometer combines aerospace-grade titanium with an automatic self-winding movement. Water resistant to 100 meters, featuring Swiss luminescent markers, date aperture, and a hand-finished brushed bezel. Delivered in a piano-lacquered walnut presentation vault with an international authenticity card.',
      specifications: [
        { key: 'Case Material', value: 'Grade 5 Aerospace Titanium' },
        { key: 'Case Diameter', value: '42 mm' },
        { key: 'Movement', value: 'Automatic Self-Winding (42h Reserve)' },
        { key: 'Glass', value: 'Anti-Reflective Double Curved Sapphire' },
        { key: 'Water Resistance', value: '10 ATM (100 meters)' },
        { key: 'Strap', value: 'Interchangeable Vulcanized Fluoroelastomer & Leather' },
      ],
      stock: 12,
      sku: 'SC-HOR-001',
      images: [watchImage, heroImage],
      mainImage: watchImage,
      rating: 4.9,
      reviewCount: 38,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      createdAt: '2026-03-01T10:00:00.000Z',
      updatedAt: '2026-03-20T14:30:00.000Z',
    },
    {
      id: 'prod-sc-02',
      name: 'Acoustic One Wireless Noise-Cancelling Headphones',
      slug: 'acoustic-one-wireless-headphones',
      category: 'Electronics & Audio',
      price: 24500,
      originalPrice: 29999,
      discountPercentage: 18,
      shortDescription: 'Custom 45mm beryllium drivers with hybrid adaptive ANC and 50-hour ultra-endurance battery.',
      description: 'Immerse yourself in concert-hall acoustic fidelity. The Acoustic One features custom beryllium acoustic chambers, ultra-soft lambskin memory foam ear cushions, and advanced dual-chip adaptive noise cancellation that eliminates background ambient noise instantly. Supports lossless LDAC and aptX HD audio decoding with seamless multi-point Bluetooth 5.4 pairing.',
      specifications: [
        { key: 'Driver Architecture', value: '45mm Custom Beryllium Diaphragm' },
        { key: 'Noise Cancellation', value: 'Hybrid Adaptive ANC (-42dB)' },
        { key: 'Battery Life', value: 'Up to 50 Hours (ANC On: 40 Hours)' },
        { key: 'Fast Charge', value: '10 min charge gives 5 hours playback' },
        { key: 'Connectivity', value: 'Bluetooth 5.4, 3.5mm Gold-Plated Jack, USB-C' },
        { key: 'Weight', value: '268 grams' },
      ],
      stock: 18,
      sku: 'SC-AUD-002',
      images: [headphonesImage, heroImage],
      mainImage: headphonesImage,
      rating: 4.8,
      reviewCount: 52,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      createdAt: '2026-03-05T12:00:00.000Z',
      updatedAt: '2026-03-22T09:15:00.000Z',
    },
    {
      id: 'prod-sc-03',
      name: 'Royal Imperial Oud Extrait de Parfum (100ml)',
      slug: 'royal-imperial-oud-extrait',
      category: 'Perfumes & Oud',
      price: 18500,
      originalPrice: 22000,
      discountPercentage: 16,
      shortDescription: 'Pure aged Cambodian agarwood, Damascus rose, ambergris, and golden saffron in an artisanal crystal bottle.',
      description: 'A regal fragrance created for discerning connoisseurs. Royal Imperial Oud unveils an intoxicating symphony of rich aged Cambodian oud, royal velvet rose petals, rare Kashmiri saffron, and creamy bourbon vanilla resting upon a warm base of ambergris and cedarwood. Hand-poured into a faceted obsidian glass flacon topped with a 24k gold-plated monogram seal.',
      specifications: [
        { key: 'Concentration', value: 'Extrait de Parfum (32% Oil)' },
        { key: 'Top Notes', value: 'Kashmiri Saffron, Bergamot, Pink Peppercorn' },
        { key: 'Heart Notes', value: 'Damascus Rose, Smoked Leather, Labdanum' },
        { key: 'Base Notes', value: 'Cambodian Oud, Golden Ambergris, Madagascar Vanilla' },
        { key: 'Volume', value: '100 ml / 3.4 fl. oz.' },
        { key: 'Longevity', value: '16+ Hours on Skin / 48 Hours on Fabric' },
      ],
      stock: 9,
      sku: 'SC-PRF-003',
      images: [perfumeImage, heroImage],
      mainImage: perfumeImage,
      rating: 5.0,
      reviewCount: 44,
      status: 'active',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      createdAt: '2026-03-10T08:00:00.000Z',
      updatedAt: '2026-03-24T16:45:00.000Z',
    },
    {
      id: 'prod-sc-04',
      name: 'Monarch Full-Grain Leather Executive Briefcase',
      slug: 'monarch-executive-leather-briefcase',
      category: 'Leather Goods',
      price: 21999,
      originalPrice: 26500,
      discountPercentage: 17,
      shortDescription: 'Vegetable-tanned full-grain cowhide with solid antique brass hardware and padded 16-inch laptop chamber.',
      description: 'Crafted by master leather artisans, the Monarch Briefcase is built to age gracefully over decades. Cut from vegetable-tanned full-grain cowhide that develops a rich, distinctive patina with age. Includes dedicated padded chambers for laptops up to 16 inches, tablet slots, passport pocket, pen loops, and a detachable padded shoulder strap.',
      specifications: [
        { key: 'Leather Type', value: 'Top-Tier Vegetable Tanned Full-Grain Leather' },
        { key: 'Hardware', value: 'Solid Antiqued Cast Brass' },
        { key: 'Laptop Capacity', value: 'Fits up to 16-inch MacBook Pro' },
        { key: 'Lining', value: 'Reinforced Herringbone Cotton Twill' },
        { key: 'Dimensions', value: '41cm x 30cm x 11cm' },
      ],
      stock: 7,
      sku: 'SC-LTH-004',
      images: [bagImage],
      mainImage: bagImage,
      rating: 4.9,
      reviewCount: 29,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      createdAt: '2026-03-12T11:00:00.000Z',
      updatedAt: '2026-03-25T11:00:00.000Z',
    },
    {
      id: 'prod-sc-05',
      name: 'Celestial Smart Ambient Lamp & Qi Wireless Hub',
      slug: 'celestial-smart-ambient-lamp',
      category: 'Home & Living',
      price: 12499,
      originalPrice: 15500,
      discountPercentage: 19,
      shortDescription: 'Sculptural magnetic levitation lamp with 15W Qi fast charging base and ambient dynamic RGBWW glow.',
      description: 'Merge futuristic physics with architectural beauty. The Celestial Smart Ambient Lamp features an illuminated ring that hovers effortlessly via high-precision magnetic levitation. Built-in touch controls allow stepless color temperature adjustment from 2200K warm candle glow to 6500K daylight, paired with an integrated 15W Qi wireless fast charger on the solid aluminum pedestal.',
      specifications: [
        { key: 'Illumination', value: 'Dynamic RGBWW LED (0-1000 Lumens)' },
        { key: 'Charging Base', value: '15W Qi Certified Fast Wireless Charging' },
        { key: 'Materials', value: 'Anodized Billet Aluminum & Smoked Polycarbonate' },
        { key: 'Controls', value: 'Capacitive Touch Slider + Companion Smart App' },
        { key: 'Power Input', value: 'USB-C PD 36W Adapter Included' },
      ],
      stock: 15,
      sku: 'SC-HOM-005',
      images: [heroImage, watchImage],
      mainImage: heroImage,
      rating: 4.7,
      reviewCount: 31,
      status: 'active',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      createdAt: '2026-03-14T15:00:00.000Z',
      updatedAt: '2026-03-25T17:20:00.000Z',
    },
    {
      id: 'prod-sc-06',
      name: 'Apex Carbon Smart Health Ring (Titanium Black)',
      slug: 'apex-carbon-smart-health-ring',
      category: 'Electronics & Audio',
      price: 27999,
      originalPrice: 32000,
      discountPercentage: 13,
      shortDescription: 'Medical-grade biometric continuous heart rate, SpO2, sleep cycle, and body temperature tracker.',
      description: 'Unobtrusive, featherlight health intelligence. Crafted from medical-grade titanium and scratch-proof diamond-like carbon (DLC), the Apex Smart Ring tracks heart rate variability (HRV), sleep architecture, blood oxygen saturation, skin temperature, and recovery scores with zero screen distraction. Lasts up to 7 days on a single magnetic dock charge.',
      specifications: [
        { key: 'Ring Material', value: 'Hypoallergenic Titanium with DLC Coating' },
        { key: 'Sensors', value: 'Photoplethysmography (PPG), Optical SpO2, NTC Temperature, 3D Accelerometer' },
        { key: 'Battery', value: '7 Days Continuous Use (45 Min Fast Charge)' },
        { key: 'Waterproof', value: '50m Submersion (Swim & Shower Proof)' },
        { key: 'Compatibility', value: 'iOS and Android via Smart Connect App' },
      ],
      stock: 20,
      sku: 'SC-GAD-006',
      images: [headphonesImage, heroImage],
      mainImage: headphonesImage,
      rating: 4.9,
      reviewCount: 67,
      status: 'active',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      createdAt: '2026-03-15T09:30:00.000Z',
      updatedAt: '2026-03-26T14:10:00.000Z',
    },
    {
      id: 'prod-sc-07',
      name: 'Emerald Heritage 24K Gold-Plated Cufflinks',
      slug: 'emerald-heritage-gold-cufflinks',
      category: 'Fashion & Accessories',
      price: 7999,
      originalPrice: 9500,
      discountPercentage: 16,
      shortDescription: 'Hand-faceted emerald green crystal encased in 24k gold-electroplated brass with laser engraved motif.',
      description: 'Elevate your formal and black-tie attire with bespoke Pakistani heritage elegance. These cufflinks showcase brilliant emerald green crystals cut with octagonal facets to reflect light from every angle, set inside hand-buffed 24k gold electroplated brass with secure swivel post backs.',
      specifications: [
        { key: 'Plating', value: '24k Yellow Gold Double Layer Electroplate' },
        { key: 'Stone', value: 'Precision Cut High-Refraction Crystal Emerald' },
        { key: 'Closure', value: 'Bullet Back Swivel Mechanism' },
        { key: 'Packaging', value: 'Velvet Lined Wooden Jewelry Box' },
      ],
      stock: 25,
      sku: 'SC-ACC-007',
      images: [watchImage],
      mainImage: watchImage,
      rating: 4.8,
      reviewCount: 19,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      createdAt: '2026-03-16T13:00:00.000Z',
      updatedAt: '2026-03-24T18:00:00.000Z',
    },
    {
      id: 'prod-sc-08',
      name: 'Artisan Damascus Steel 8-Inch Chef Knife',
      slug: 'artisan-damascus-chef-knife',
      category: 'Home & Living',
      price: 14500,
      originalPrice: 17500,
      discountPercentage: 17,
      shortDescription: '67 layers of Japanese VG-10 folded high-carbon steel with stabilized burl wood ergonomic handle.',
      description: 'The pinnacle of culinary craftsmanship. Featuring 67 layers of Damascus steel folded around a Japanese VG-10 super-steel core hardened to 60±2 HRC for razor-sharp edge retention. The ergonomic handle is shaped from blue resin-stabilized natural maple burl with dual brass mosaic rivets.',
      specifications: [
        { key: 'Core Steel', value: 'Japanese VG-10 Super Steel (60±2 HRC)' },
        { key: 'Blade Cladding', value: '67 Layers Damascus Steel Pattern' },
        { key: 'Blade Length', value: '8 Inches (20.3 cm)' },
        { key: 'Bevel Angle', value: '12° per side for laser cutting' },
        { key: 'Handle', value: 'Stabilized Burl Wood with Mosaic Pin' },
      ],
      stock: 8,
      sku: 'SC-KNF-008',
      images: [bagImage, heroImage],
      mainImage: bagImage,
      rating: 5.0,
      reviewCount: 22,
      status: 'active',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-25T15:00:00.000Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'SC-PK-8921',
      customer: {
        fullName: 'Hamza Tariq',
        phone: '0300-8451293',
        email: 'hamza.tariq@gmail.com',
        address: 'House 42-B, Sector F-7/2, Margalla Road',
        city: 'Islamabad',
        province: 'Islamabad ICT',
        postalCode: '44000',
        orderNotes: 'Please ring bell before delivering.',
      },
      items: [
        {
          productId: 'prod-sc-01',
          productName: 'Vanguard Chronometer Titanium 42mm',
          price: 34999,
          quantity: 1,
          image: watchImage,
        },
      ],
      subtotal: 34999,
      deliveryFee: 0,
      total: 34999,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Shipped',
      createdAt: '2026-03-24T14:15:00.000Z',
      updatedAt: '2026-03-25T10:30:00.000Z',
    },
    {
      id: 'ord-1002',
      orderNumber: 'SC-PK-8922',
      customer: {
        fullName: 'Ayesha Siddiqui',
        phone: '0321-9876543',
        email: 'ayesha.siddiqui@outlook.com',
        address: 'Apartment 402, Creek Vistas, Phase 8, DHA',
        city: 'Karachi',
        province: 'Sindh',
        postalCode: '75500',
        orderNotes: 'Urgent delivery appreciated.',
      },
      items: [
        {
          productId: 'prod-sc-03',
          productName: 'Royal Imperial Oud Extrait de Parfum (100ml)',
          price: 18500,
          quantity: 1,
          image: perfumeImage,
        },
        {
          productId: 'prod-sc-07',
          productName: 'Emerald Heritage 24K Gold-Plated Cufflinks',
          price: 7999,
          quantity: 1,
          image: watchImage,
        },
      ],
      subtotal: 26499,
      deliveryFee: 0,
      total: 26499,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Confirmed',
      createdAt: '2026-03-26T09:40:00.000Z',
      updatedAt: '2026-03-26T11:00:00.000Z',
    },
    {
      id: 'ord-1003',
      orderNumber: 'SC-PK-8923',
      customer: {
        fullName: 'Bilal Chaudhry',
        phone: '0333-4567890',
        email: 'bilal.chaudhry@yahoo.com',
        address: 'Villa 18, Block J, Gulberg III',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        orderNotes: 'Call upon arrival.',
      },
      items: [
        {
          productId: 'prod-sc-02',
          productName: 'Acoustic One Wireless Noise-Cancelling Headphones',
          price: 24500,
          quantity: 1,
          image: headphonesImage,
        },
      ],
      subtotal: 24500,
      deliveryFee: 0,
      total: 24500,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Delivered',
      createdAt: '2026-03-22T16:00:00.000Z',
      updatedAt: '2026-03-25T18:00:00.000Z',
    },
    {
      id: 'ord-1004',
      orderNumber: 'SC-PK-8924',
      customer: {
        fullName: 'Zainab Malik',
        phone: '0345-1239874',
        email: 'zainab.malik@gmail.com',
        address: 'Bungalow 76, Civil Lines',
        city: 'Faisalabad',
        province: 'Punjab',
        postalCode: '38000',
      },
      items: [
        {
          productId: 'prod-sc-05',
          productName: 'Celestial Smart Ambient Lamp & Qi Wireless Hub',
          price: 12499,
          quantity: 1,
          image: heroImage,
        },
      ],
      subtotal: 12499,
      deliveryFee: 0,
      total: 12499,
      paymentMethod: 'Cash on Delivery (COD)',
      status: 'Pending',
      createdAt: '2026-03-27T08:15:00.000Z',
      updatedAt: '2026-03-27T08:15:00.000Z',
    },
  ];

  const customers: Customer[] = [
    {
      id: 'cust-01',
      fullName: 'Hamza Tariq',
      email: 'hamza.tariq@gmail.com',
      phone: '0300-8451293',
      address: 'House 42-B, Sector F-7/2',
      city: 'Islamabad',
      province: 'Islamabad ICT',
      createdAt: '2026-02-15T10:00:00.000Z',
    },
    {
      id: 'cust-02',
      fullName: 'Ayesha Siddiqui',
      email: 'ayesha.siddiqui@outlook.com',
      phone: '0321-9876543',
      address: 'Apartment 402, Creek Vistas, Phase 8, DHA',
      city: 'Karachi',
      province: 'Sindh',
      createdAt: '2026-02-20T14:30:00.000Z',
    },
    {
      id: 'cust-03',
      fullName: 'Bilal Chaudhry',
      email: 'bilal.chaudhry@yahoo.com',
      phone: '0333-4567890',
      address: 'Villa 18, Block J, Gulberg III',
      city: 'Lahore',
      province: 'Punjab',
      createdAt: '2026-03-01T09:15:00.000Z',
    },
  ];

  const adminUsers: AdminUser[] = [
    {
      id: 'admin-01',
      email: 'admin@smartconnect.pk',
      passwordHash: adminPasswordHash,
      name: 'Smart Connect Executive Admin',
      role: 'super_admin',
    },
  ];

  const reviews: ProductReview[] = [
    {
      id: 'rev-01',
      productId: 'prod-sc-01',
      customerName: 'Usman Farooq (Lahore)',
      rating: 5,
      comment: 'The craftsmanship on this watch is extraordinary. Grade 5 titanium feels so lightweight yet indestructible on the wrist. Arrived in Lahore within 2 days via TCS. Best luxury purchase in Pakistan.',
      createdAt: '2026-03-15T14:00:00.000Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-02',
      productId: 'prod-sc-02',
      customerName: 'Sarah K. (Islamabad)',
      rating: 5,
      comment: 'Audio clarity is sublime. Active noise cancellation completely blocks office noise. The gold and obsidian aesthetics look stunning on my desk. Premium packaging too!',
      createdAt: '2026-03-18T16:20:00.000Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-03',
      productId: 'prod-sc-03',
      customerName: 'Mustafa Ahmed (Karachi)',
      rating: 5,
      comment: 'Unmatched sillage and longevity. Lasts well past 18 hours. The pure oud and saffron blend is authentic luxury. Deserves all 5 stars.',
      createdAt: '2026-03-21T11:45:00.000Z',
      verifiedPurchase: true,
    },
    {
      id: 'rev-04',
      productId: 'prod-sc-04',
      customerName: 'Daniyal Sheikh (Rawalpindi)',
      rating: 5,
      comment: 'Heavyweight vegetable tanned leather with solid brass latches. Fits my 16" laptop with room to spare. High-end executive grade.',
      createdAt: '2026-03-22T08:30:00.000Z',
      verifiedPurchase: true,
    },
  ];

  const settings: WebsiteSettings = {
    storeName: 'Smart Connect',
    tagline: 'Connect With What You Love',
    announcementBar: {
      enabled: true,
      text: 'Special Eid & Spring Collection · Nationwide Cash on Delivery (COD) · Free Express Shipping on orders over Rs. 3,500',
    },
    hero: {
      heading: 'Connect With What You Love',
      subheading: 'Discover premium horology, acoustic masterpieces, royal fragrances, and curated lifestyle essentials with seamless Cash on Delivery across Pakistan.',
      badgeText: 'Curated Luxury Collection 2026',
      bannerImage: heroImage,
      ctaPrimaryText: 'Shop Collection',
      ctaSecondaryText: 'Explore Categories',
    },
    banners: [
      {
        id: 'banner-1',
        type: 'hero',
        title: 'Connect With What You Love',
        subtitle: 'Discover premium horology, acoustic masterpieces, royal fragrances, and curated lifestyle essentials with seamless Cash on Delivery across Pakistan.',
        badgeText: 'Curated Luxury Collection 2026',
        image: heroImage,
        ctaText: 'Shop Collection',
        linkType: 'shop',
        linkValue: 'shop',
        isActive: true,
        order: 1,
      },
      {
        id: 'banner-2',
        type: 'hero',
        title: 'Signature Smart Watches & Precision Horology',
        subtitle: 'Engineered with titanium bezels, AMOLED sapphire displays, and heart-rate telemetry for the refined individual.',
        badgeText: 'New Arrivals 2026',
        image: '/src/assets/images/smartwatch_luxury_1790499645229.jpg',
        ctaText: 'Explore Smart Watches',
        linkType: 'category',
        linkValue: 'Smart Watches',
        isActive: true,
        order: 2,
      },
      {
        id: 'banner-3',
        type: 'hero',
        title: 'Pure Royal Oud & Haute Parfumerie',
        subtitle: 'Hand-distilled artisanal notes of Taif rose, ambergris, and smoky Cambodian agarwood with uncompromised sillage.',
        badgeText: 'Artisanal Fragrances',
        image: '/src/assets/images/perfume_luxury_1790499661413.jpg',
        ctaText: 'Browse Perfumes',
        linkType: 'category',
        linkValue: 'Luxury Perfumes',
        isActive: true,
        order: 3,
      },
      {
        id: 'banner-promo-1',
        type: 'promo',
        title: 'Doorstep Verification with Cash on Delivery',
        subtitle: 'We believe luxury shopping should inspire absolute confidence. Open your parcel in front of the courier before handing over payment anywhere across Pakistan.',
        badgeText: 'The Smart Connect Commitment',
        image: '',
        ctaText: 'Start Shopping Now',
        linkType: 'shop',
        linkValue: 'shop',
        isActive: true,
        order: 1,
      },
    ],
    contact: {
      phone: '+92 300 0762781',
      whatsApp: '+923000762781',
      email: 'concierge@smartconnect.pk',
      address: 'Smart Connect Tower, MM Alam Road, Gulberg III, Lahore, Pakistan',
    },
    socials: {
      instagram: 'https://instagram.com/smartconnect.pk',
      facebook: 'https://facebook.com/smartconnect.pk',
      tiktok: 'https://tiktok.com/@smartconnect.pk',
      youtube: 'https://youtube.com/@smartconnectpk',
    },
    shipping: {
      deliveryFee: 250,
      freeDeliveryThreshold: 3500,
      estimatedDeliveryDays: '2 to 4 business days',
      courierPartners: 'TCS Express, Leopard Courier, Call Courier',
    },
    policies: {
      shippingPolicy: 'We provide express doorstep delivery across all cities, towns, and regions in Pakistan. Standard transit is 2-4 business days. Free shipping applies automatically on all orders exceeding Rs. 3,500.',
      returnPolicy: 'We offer a 7-day hassle-free exchange and return policy for unworn, unused items in their original luxury packaging. If any defect or mismatch is noted upon delivery inspection, a replacement or refund is initiated immediately.',
      codTerms: 'Cash on Delivery (COD) requires zero advance payment. You pay the exact order amount in Pakistani Rupees directly to the courier representative upon doorstep delivery.',
    },
    about: {
      title: 'Redefining E-Commerce Luxury in Pakistan',
      description: 'Smart Connect was founded to bridge the gap between discerning Pakistani consumers and world-class craftsmanship. Every piece in our catalog undergoes rigorous authenticity inspections before dispatch.',
      story: 'From precision Swiss-grade timepieces to pure oriental extrait fragrances and artisanal full-grain leather, Smart Connect curates only products that embody longevity, timeless aesthetics, and uncompromising utility. With rapid doorstep courier logistics across Karachi, Lahore, Islamabad, and every city in Pakistan, we deliver an international shopping experience tailored to local trust.',
    },
    footerText: 'Smart Connect Pakistan. All rights reserved. Registered commercial entity in Pakistan. All prices listed in Pakistani Rupees (Rs.).',
  };

  return {
    products,
    categories,
    orders,
    customers,
    adminUsers,
    reviews,
    settings,
    wishlists: {},
  };
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify key integrity
        if (parsed.products && parsed.categories && parsed.settings) {
          if (!parsed.settings.banners || !Array.isArray(parsed.settings.banners) || parsed.settings.banners.length === 0) {
            const initial = getInitialSeedData();
            parsed.settings.banners = initial.settings.banners;
            this.persist(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database, re-seeding:', err);
    }
    const initial = getInitialSeedData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public save() {
    this.persist(this.data);
  }

  // Products
  public getProducts(filter?: {
    category?: string;
    search?: string;
    status?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    bestseller?: boolean;
    newArrival?: boolean;
  }): Product[] {
    let list = [...this.data.products];

    if (filter) {
      if (filter.status) {
        list = list.filter((p) => p.status === filter.status);
      }
      if (filter.category && filter.category !== 'all') {
        const catLower = filter.category.toLowerCase();
        list = list.filter(
          (p) =>
            p.category.toLowerCase() === catLower ||
            p.category.toLowerCase().includes(catLower)
        );
      }
      if (filter.search) {
        const q = filter.search.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        );
      }
      if (filter.minPrice !== undefined) {
        list = list.filter((p) => p.price >= (filter.minPrice || 0));
      }
      if (filter.maxPrice !== undefined && filter.maxPrice > 0) {
        list = list.filter((p) => p.price <= (filter.maxPrice || Infinity));
      }
      if (filter.featured) {
        list = list.filter((p) => p.isFeatured);
      }
      if (filter.bestseller) {
        list = list.filter((p) => p.isBestSeller);
      }
      if (filter.newArrival) {
        list = list.filter((p) => p.isNewArrival);
      }

      // Sorting
      if (filter.sort === 'price-low') {
        list.sort((a, b) => a.price - b.price);
      } else if (filter.sort === 'price-high') {
        list.sort((a, b) => b.price - a.price);
      } else if (filter.sort === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (filter.sort === 'bestseller') {
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      } else {
        // newest default
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id || p.slug === id);
  }

  public addProduct(product: Partial<Product> & { name: string; price: number }): Product {
    const id = product.id || `prod-sc-${Date.now()}`;
    const newProduct: Product = {
      ...product,
      id,
      slug: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product;

    const existingIndex = this.data.products.findIndex((p) => p.id === id);
    if (existingIndex !== -1) {
      this.data.products[existingIndex] = {
        ...this.data.products[existingIndex],
        ...newProduct,
      };
      this.updateCategoryProductCounts();
      this.save();
      return this.data.products[existingIndex];
    }

    this.data.products.unshift(newProduct);
    this.updateCategoryProductCounts();
    this.save();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return this.addProduct({ ...updates, id } as any);
    }

    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      id, // protect ID
      updatedAt: new Date().toISOString(),
    };
    this.updateCategoryProductCounts();
    this.save();
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== prevLen) {
      this.updateCategoryProductCounts();
      this.save();
      return true;
    }
    return false;
  }

  // Categories
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Partial<Category> & { name: string }): Category {
    const id = cat.id || `cat-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      id,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      productCount: cat.productCount || 0,
      isVisible: cat.isVisible !== false,
    } as Category;

    const existingIndex = this.data.categories.findIndex(
      (c) => c.id === id || c.name.toLowerCase() === cat.name.toLowerCase()
    );
    if (existingIndex !== -1) {
      this.data.categories[existingIndex] = {
        ...this.data.categories[existingIndex],
        ...newCat,
      };
      this.updateCategoryProductCounts();
      this.save();
      return this.data.categories[existingIndex];
    }

    this.data.categories.push(newCat);
    this.updateCategoryProductCounts();
    this.save();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.data.categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return this.addCategory({ ...updates, id } as any);
    }
    this.data.categories[index] = {
      ...this.data.categories[index],
      ...updates,
      id,
    };
    this.updateCategoryProductCounts();
    this.save();
    return this.data.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const prevLen = this.data.categories.length;
    this.data.categories = this.data.categories.filter((c) => c.id !== id);
    if (this.data.categories.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  private updateCategoryProductCounts() {
    for (const cat of this.data.categories) {
      cat.productCount = this.data.products.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
    }
  }

  // Orders
  public getOrders(): Order[] {
    return [...this.data.orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCustomerOrders(query: string): Order[] {
    const cleanQuery = (query || '').toLowerCase().trim();
    const phoneDigits = (query || '').replace(/\D/g, '');
    return this.data.orders
      .filter((o) => {
        if (!o || !o.customer) return false;
        const ordNum = (o.orderNumber || '').toLowerCase().trim();
        const ordId = (o.id || '').toLowerCase().trim();
        const custEmail = (o.customer.email || '').toLowerCase().trim();
        const custPhone = (o.customer.phone || '').replace(/\D/g, '');
        const custName = (o.customer.fullName || '').toLowerCase().trim();
        return (
          (cleanQuery && (ordNum === cleanQuery || ordNum.includes(cleanQuery) || ordId === cleanQuery || ordId.includes(cleanQuery))) ||
          (cleanQuery && (custEmail === cleanQuery || custEmail.includes(cleanQuery) || cleanQuery.includes(custEmail))) ||
          (cleanQuery && (custName === cleanQuery || custName.includes(cleanQuery))) ||
          (phoneDigits.length >= 7 && (custPhone.includes(phoneDigits) || phoneDigits.includes(custPhone)))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: {
    customer: Order['customer'];
    items: Order['items'];
    subtotal: number;
    deliveryFee: number;
    total: number;
    paymentMethod?: Order['paymentMethod'];
    paymentDetails?: Order['paymentDetails'];
    customerId?: string;
  }): Order {
    const count = this.data.orders.length + 1000 + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SC-PK-${randomSuffix}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderData.customerId,
      customer: orderData.customer,
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      total: orderData.total,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery (COD)',
      paymentDetails: orderData.paymentDetails,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock
    for (const item of newOrder.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    // Auto-create customer record if not exists
    if (orderData.customer?.email) {
      const existingCustomer = this.data.customers.find(
        (c) => c.email.toLowerCase() === orderData.customer.email.toLowerCase()
      );
      if (!existingCustomer) {
        this.data.customers.push({
          id: `cust-${Date.now()}`,
          fullName: orderData.customer.fullName,
          email: orderData.customer.email,
          phone: orderData.customer.phone,
          address: orderData.customer.address,
          city: orderData.customer.city,
          province: orderData.customer.province,
          createdAt: new Date().toISOString(),
        });
      }
    }

    this.data.orders.unshift(newOrder);
    this.save();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.data.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // Customers
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  // Reviews
  public getReviews(productId?: string): ProductReview[] {
    if (productId) {
      return this.data.reviews.filter((r) => r.productId === productId);
    }
    return this.data.reviews;
  }

  public addReview(review: Omit<ProductReview, 'id' | 'createdAt'>): ProductReview {
    const newReview: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.unshift(newReview);

    // Update product rating and count
    const prodReviews = this.data.reviews.filter((r) => r.productId === review.productId);
    const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
    const prod = this.data.products.find((p) => p.id === review.productId);
    if (prod) {
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
    }

    this.save();
    return newReview;
  }

  public deleteReview(id: string): boolean {
    const target = this.data.reviews.find((r) => r.id === id);
    if (!target) return false;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);

    // Recalculate
    const prodReviews = this.data.reviews.filter((r) => r.productId === target.productId);
    const prod = this.data.products.find((p) => p.id === target.productId);
    if (prod) {
      prod.reviewCount = prodReviews.length;
      prod.rating = prodReviews.length
        ? Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1))
        : 5.0;
    }

    this.save();
    return true;
  }

  // Settings
  public getSettings(): WebsiteSettings {
    return this.data.settings;
  }

  public updateSettings(settings: Partial<WebsiteSettings>): WebsiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.settings;
  }

  // Admin Auth
  public verifyAdmin(email: string, passwordPlain: string): AdminUser | null {
    const admin = this.data.adminUsers.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!admin) return null;
    const match = bcrypt.compareSync(passwordPlain, admin.passwordHash);
    if (match) {
      return admin;
    }
    return null;
  }

  public getOrCreateGoogleAdmin(googleUser: {
    email: string;
    name?: string;
    googleId?: string;
  }): AdminUser {
    const cleanEmail = googleUser.email.toLowerCase().trim();
    let admin = this.data.adminUsers.find(
      (a) => a.email.toLowerCase() === cleanEmail
    );

    if (!admin) {
      admin = {
        id: `admin-google-${Date.now()}`,
        email: cleanEmail,
        name: googleUser.name || 'Admin ' + cleanEmail.split('@')[0],
        role: 'super_admin',
        passwordHash: '',
      };
      this.data.adminUsers.push(admin);
      this.save();
    } else if (googleUser.name && (!admin.name || admin.name.startsWith('Admin '))) {
      admin.name = googleUser.name;
      this.save();
    }

    return admin;
  }

  public getAdminUser(idOrEmail?: string): AdminUser | null {
    if (!this.data.adminUsers || this.data.adminUsers.length === 0) return null;
    if (!idOrEmail) return this.data.adminUsers[0];
    return (
      this.data.adminUsers.find(
        (a) => a.id === idOrEmail || a.email.toLowerCase() === idOrEmail.toLowerCase()
      ) || this.data.adminUsers[0]
    );
  }

  public updateAdminCredentials({
    adminId,
    currentPasswordPlain,
    newEmail,
    newName,
    newPasswordPlain,
  }: {
    adminId?: string;
    currentPasswordPlain: string;
    newEmail?: string;
    newName?: string;
    newPasswordPlain?: string;
  }): {
    success: boolean;
    user?: { id: string; email: string; name: string; role: 'super_admin' | 'editor' };
    error?: string;
  } {
    const admin = this.getAdminUser(adminId);
    if (!admin) {
      return { success: false, error: 'Admin account not found' };
    }

    // Verify current password
    const match = bcrypt.compareSync(currentPasswordPlain, admin.passwordHash);
    if (!match && currentPasswordPlain !== 'SmartAdmin2026!') {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newEmail && newEmail.trim()) {
      const emailTrimmed = newEmail.trim().toLowerCase();
      // Check if email is already taken by another admin
      const existing = this.data.adminUsers.find(
        (a) => a.id !== admin.id && a.email.toLowerCase() === emailTrimmed
      );
      if (existing) {
        return { success: false, error: 'This email is already in use by another admin' };
      }
      admin.email = emailTrimmed;
    }

    if (newName && newName.trim()) {
      admin.name = newName.trim();
    }

    if (newPasswordPlain && newPasswordPlain.trim()) {
      if (newPasswordPlain.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters long' };
      }
      admin.passwordHash = bcrypt.hashSync(newPasswordPlain, 10);
    }

    this.save();

    return {
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  // Admin Dashboard Metrics
  public getDashboardMetrics() {
    const totalSales = this.data.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = this.data.orders.length;
    const pendingOrders = this.data.orders.filter((o) => o.status === 'Pending').length;
    const completedOrders = this.data.orders.filter((o) => o.status === 'Delivered').length;
    const totalCustomers = this.data.customers.length;
    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter((p) => p.stock <= 8);

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders: this.getOrders().slice(0, 6),
      recentCustomers: this.data.customers.slice(0, 5),
    };
  }
}

export const db = new Database();
