// ─── Product Types ────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: "COLOR" | "SIZE" | "MATERIAL" | "STYLE";
  value: string;
  additionalPrice: number;
  stock: number;
  image: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  categoryId: string;
  brand: string | null;
  material: string | null;
  dimensions: string | null;
  weight: number | null;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: string | null;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  tags: string[];
  category: {
    name: string;
    slug: string;
  };
  images: {
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }[];
  variants: {
    id: string;
    name: string;
    type: string;
    value: string;
  }[];
}

// ─── Category Types ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  icon: string | null;
  parentId: string | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

// ─── Cart Types ───────────────────────────────────────────────────────────────

export interface CartItemData {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product: {
    name: string;
    slug: string;
    price: number;
    mrp: number;
    stock: number;
    images: ProductImage[];
  };
}

// ─── Order Types ──────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: "HOME" | "WORK" | "OTHER";
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    slug: string;
    images: ProductImage[];
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  address: Address;
  items: OrderItem[];
}

// ─── Search / Filter Types ────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  materials?: string[];
  brands?: string[];
  minRating?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest" | "rating";
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ─── Chat Types ───────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  toolName?: string;
  toolResult?: unknown;
  feedback?: "THUMBS_UP" | "THUMBS_DOWN" | null;
  createdAt: string;
  products?: ProductListItem[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// ─── Generative Image Types ──────────────────────────────────────────────────

export interface GeneratedImageResult {
  id: string;
  generatedImageUrl: string;
  type: "ROOM_VISUALIZATION" | "VARIANT_PREVIEW" | "LIFESTYLE" | "SCALE_COMPARISON";
  prompt: string;
  createdAt: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Language Types ───────────────────────────────────────────────────────────

export type SupportedLanguage = "en" | "hi" | "ta" | "te" | "mr" | "bn";

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", speechCode: "en-IN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechCode: "hi-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", speechCode: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", speechCode: "te-IN" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", speechCode: "mr-IN" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", speechCode: "bn-IN" },
];
