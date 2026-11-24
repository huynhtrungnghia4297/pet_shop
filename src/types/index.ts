/**
 * Standard ASP.NET Core Web API response envelope (camelCase JSON serialization)
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  timestamp: string;
}

export type ProductCategory =
  | 'food'
  | 'grooming'
  | 'apparel'
  | 'toys';

export type PetTarget = 'dog' | 'cat' | 'all';

export interface ProductVariantDto {
  id: string;
  label: string; // e.g., "Size M", "Hương Hoa Cúc 500ml", "Gói 2kg"
  priceAdjustment: number; // VND delta from base price
  stock: number;
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  petTarget: PetTarget;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  gallery?: string[];
  shortDescription: string;
  description: string;
  brand: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariantDto[];
  isPublished: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  sku?: string;
  category: ProductCategory;
  petTarget: PetTarget;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  shortDescription: string;
  description: string;
  brand: string;
  variants: ProductVariantDto[];
  isPublished: boolean;
  isFeatured?: boolean;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export type BookingType = 'spa' | 'hotel';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface BookingDto {
  id: string;
  bookingCode: string;
  type: BookingType;
  petName: string;
  petSpecies: 'dog' | 'cat';
  petBreed: string;
  petWeightKg: number;
  healthNotes?: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string; // YYYY-MM-DD (Check-in date for hotel)
  appointmentTime?: string; // HH:mm (for spa)
  checkOutDate?: string; // YYYY-MM-DD (for hotel)
  nights?: number;
  estimatedPrice: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingDto {
  type: BookingType;
  petName: string;
  petSpecies: 'dog' | 'cat';
  petBreed: string;
  petWeightKg: number;
  healthNotes?: string;
  serviceId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime?: string;
  checkOutDate?: string;
  nights?: number;
  estimatedPrice: number;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
}

export type OrderStatus = 'pending' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'qr_transfer';

export interface OrderItemDto {
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemDto[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: OrderItemDto[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  variantId: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface WeightPriceTier {
  label: string;
  minKg: number;
  maxKg: number | null;
  price: number;
}

export interface SpaServicePackage {
  id: string;
  petSpecies: 'dog' | 'cat';
  name: string;
  tagline: string;
  durationMinutes: number;
  imageUrl: string;
  highlights: string[];
  popular?: boolean;
  tiers: WeightPriceTier[];
}

export interface HotelRoomTier {
  id: string;
  name: string;
  subtitle: string;
  pricePerNight: number;
  dimensions: string;
  maxWeightKg: number;
  badge: string;
  imageUrl: string;
  features: string[];
  highlighted?: boolean;
}

export interface CustomerReview {
  id: string;
  author: string;
  petInfo: string;
  rating: number;
  serviceUsed: string;
  comment: string;
  date: string;
}

export type MemberTier = 'Silver' | 'Gold' | 'Diamond';

export interface PointHistoryItemDto {
  id: string;
  title: string;
  description: string;
  pointsDelta: number;
  category: 'bonus' | 'spa' | 'hotel' | 'shop';
  createdAt: string;
}

export interface MemberDto {
  id: string;
  memberCode: string;
  fullName: string;
  phone: string;
  email?: string;
  petName?: string;
  petSpecies?: 'dog' | 'cat';
  points: number;
  tier: MemberTier;
  discountPercent: number;
  joinedAt: string;
  pointHistory: PointHistoryItemDto[];
}

export interface LoginRequestDto {
  identifier: string; // Số điện thoại hoặc Email
  password: string;
}

export interface RegisterRequestDto {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
  petName?: string;
  petSpecies?: 'dog' | 'cat';
}

export interface AuthResponseDto {
  member: MemberDto;
  accessToken: string;
}

