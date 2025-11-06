import api from '@/lib/api';
import {
  Classified,
  ClassifiedCategory,
  ClassifiedSubcategory,
  ClassifiedFilters,
  ClassifiedListResponse,
  CreateClassifiedRequest,
  UpdateClassifiedRequest,
  ClassifiedStatus
} from '../types';

export class ClassifiedsApiService {
  private readonly baseUrl = '/classifieds';

  // Listar classificados
  async getClassifieds(filters: ClassifiedFilters): Promise<ClassifiedListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.subcategoryId) params.append('subcategoryId', filters.subcategoryId.toString());
    if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
    if (filters.city) params.append('city', filters.city);
    if (filters.state) params.append('state', filters.state);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.userId) params.append('userId', filters.userId.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  // Buscar classificado por ID
  async getClassifiedById(id: number, incrementView = false): Promise<Classified> {
    const params = incrementView ? '?view=true' : '';
    const response = await api.get(`${this.baseUrl}/${id}${params}`);
    return response.data;
  }

  // Criar classificado
  async createClassified(data: CreateClassifiedRequest): Promise<Classified> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  // Atualizar classificado
  async updateClassified(id: number, data: UpdateClassifiedRequest): Promise<Classified> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  // Deletar classificado
  async deleteClassified(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  // Aprovar classificado (admin)
  async approveClassified(id: number): Promise<Classified> {
    const response = await api.post(`${this.baseUrl}/${id}/approve`);
    return response.data;
  }

  // Rejeitar classificado (admin)
  async rejectClassified(id: number, reason: string): Promise<Classified> {
    const response = await api.post(`${this.baseUrl}/${id}/reject`, { reason });
    return response.data;
  }

  // Toggle favorito
  async toggleFavorite(id: number): Promise<{ isFavorited: boolean }> {
    const response = await api.post(`${this.baseUrl}/${id}/favorite`);
    return response.data;
  }

  // Buscar favoritos do usuário
  async getUserFavorites(page = 1, limit = 10): Promise<ClassifiedListResponse> {
    const response = await api.get(`${this.baseUrl}/favorites/me?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Buscar categorias
  async getCategories(): Promise<ClassifiedCategory[]> {
    const response = await api.get(`${this.baseUrl}/categories/list`);
    return response.data;
  }

  // Buscar subcategorias por categoria
  async getSubcategoriesByCategory(categoryId: number): Promise<ClassifiedSubcategory[]> {
    const response = await api.get(`${this.baseUrl}/categories/${categoryId}/subcategories`);
    return response.data;
  }

  // Criar categoria
  async createCategory(data: {
    name: string;
    icon?: string;
    description?: string;
    isActive: boolean;
    sortOrder?: number;
  }): Promise<ClassifiedCategory> {
    const response = await api.post(`${this.baseUrl}/categories`, data);
    return response.data;
  }

  // Atualizar categoria
  async updateCategory(id: number, data: {
    name?: string;
    icon?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ClassifiedCategory> {
    const response = await api.put(`${this.baseUrl}/categories/${id}`, data);
    return response.data;
  }

  // Deletar categoria
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/categories/${id}`);
  }

  // Criar subcategoria
  async createSubcategory(data: {
    name: string;
    categoryId: number;
    description?: string;
    isActive: boolean;
    sortOrder?: number;
    customFields?: any[];
  }): Promise<ClassifiedSubcategory> {
    const response = await api.post(`${this.baseUrl}/subcategories`, data);
    return response.data;
  }

  // Atualizar subcategoria
  async updateSubcategory(id: number, data: {
    name?: string;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
    customFields?: any[];
  }): Promise<ClassifiedSubcategory> {
    const response = await api.put(`${this.baseUrl}/subcategories/${id}`, data);
    return response.data;
  }

  // Deletar subcategoria
  async deleteSubcategory(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/subcategories/${id}`);
  }
}

// Instância singleton do serviço
export const classifiedsApiService = new ClassifiedsApiService();