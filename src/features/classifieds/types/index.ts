export enum ClassifiedStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  PAUSED = "PAUSED",
  EXPIRED = "EXPIRED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  REJECTED = "REJECTED"
}

export enum PriceType {
  FIXED = "FIXED",
  NEGOTIABLE = "NEGOTIABLE",
  FREE = "FREE"
}

export interface ContactInfo {
  phone?: string;
  whatsapp?: string;
  email?: string;
  showPhone: boolean;
  showWhatsapp: boolean;
  showEmail: boolean;
}

export interface Location {
  city: string;
  state: string;
  coordinates?: [number, number];
  address?: string;
  zipCode?: string;
}

export interface ClassifiedImage {
  id: number;
  imageUrl: string;
  imageName?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ClassifiedCategory {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  subcategories?: ClassifiedSubcategory[];
}

export interface CustomField {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ClassifiedSubcategory {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  customFields?: CustomField[];
  isActive: boolean;
  sortOrder: number;
  category?: ClassifiedCategory;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  document?: string;
}

export interface Classified {
  id: number;
  title: string;
  description: string;
  price?: number;
  priceType: PriceType;
  categoryId: number;
  subcategoryId: number;
  userId: number;
  customFields?: Record<string, any>;
  location: Location;
  contactInfo: ContactInfo;
  paymentMethods?: string[];
  status: ClassifiedStatus;
  featured: boolean;
  viewCount: number;
  favoriteCount: number;
  expiresAt?: string;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
  category?: ClassifiedCategory;
  subcategory?: ClassifiedSubcategory;
  user?: User;
  images?: ClassifiedImage[];
}

export interface ClassifiedFilters {
  categoryId?: number;
  subcategoryId?: number;
  status?: ClassifiedStatus;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  state?: string;
  featured?: boolean;
  userId?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'price' | 'title' | 'view_count';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ClassifiedListResponse {
  classifieds: Classified[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateClassifiedRequest {
  title: string;
  description: string;
  price?: number;
  priceType: PriceType;
  categoryId: number;
  subcategoryId: number;
  customFields?: Record<string, any>;
  location: Location;
  contactInfo: ContactInfo;
  paymentMethods?: string[];
  images?: { url: string; isPrimary?: boolean }[];
}

export interface UpdateClassifiedRequest {
  title?: string;
  description?: string;
  price?: number;
  priceType?: PriceType;
  categoryId?: number;
  subcategoryId?: number;
  customFields?: Record<string, any>;
  location?: Location;
  contactInfo?: ContactInfo;
  paymentMethods?: string[];
  status?: ClassifiedStatus;
}

// Estados da UI
export interface ClassifiedsState {
  classifieds: Classified[];
  categories: ClassifiedCategory[];
  subcategories: ClassifiedSubcategory[];
  selectedClassified: Classified | null;
  filters: ClassifiedFilters;
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  totalPages: number;
}

// Ações
export type ClassifiedAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CLASSIFIEDS'; payload: ClassifiedListResponse }
  | { type: 'SET_CATEGORIES'; payload: ClassifiedCategory[] }
  | { type: 'SET_SUBCATEGORIES'; payload: ClassifiedSubcategory[] }
  | { type: 'SET_SELECTED_CLASSIFIED'; payload: Classified | null }
  | { type: 'SET_FILTERS'; payload: Partial<ClassifiedFilters> }
  | { type: 'UPDATE_CLASSIFIED'; payload: Classified }
  | { type: 'DELETE_CLASSIFIED'; payload: number }
  | { type: 'ADD_CLASSIFIED'; payload: Classified };

// Status com labels para UI
export const ClassifiedStatusLabels: Record<ClassifiedStatus, string> = {
  [ClassifiedStatus.ACTIVE]: 'Ativo',
  [ClassifiedStatus.SOLD]: 'Vendido',
  [ClassifiedStatus.PAUSED]: 'Pausado',
  [ClassifiedStatus.EXPIRED]: 'Expirado',
  [ClassifiedStatus.PENDING_APPROVAL]: 'Aguardando Aprovação',
  [ClassifiedStatus.REJECTED]: 'Rejeitado'
};

export const PriceTypeLabels: Record<PriceType, string> = {
  [PriceType.FIXED]: 'Preço Fixo',
  [PriceType.NEGOTIABLE]: 'Negociável',
  [PriceType.FREE]: 'Gratuito'
};

// Cores para status
export const ClassifiedStatusColors: Record<ClassifiedStatus, string> = {
  [ClassifiedStatus.ACTIVE]: 'text-green-600 bg-green-50',
  [ClassifiedStatus.SOLD]: 'text-blue-600 bg-blue-50',
  [ClassifiedStatus.PAUSED]: 'text-yellow-600 bg-yellow-50',
  [ClassifiedStatus.EXPIRED]: 'text-gray-600 bg-gray-50',
  [ClassifiedStatus.PENDING_APPROVAL]: 'text-orange-600 bg-orange-50',
  [ClassifiedStatus.REJECTED]: 'text-red-600 bg-red-50'
};