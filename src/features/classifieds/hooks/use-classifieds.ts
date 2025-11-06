import { useReducer, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Classified,
  ClassifiedCategory,
  ClassifiedSubcategory,
  ClassifiedFilters,
  ClassifiedListResponse,
  CreateClassifiedRequest,
  UpdateClassifiedRequest,
  ClassifiedsState,
  ClassifiedAction,
  ClassifiedStatus
} from '../types';
import { classifiedsApiService } from '../services/api';

const initialState: ClassifiedsState = {
  classifieds: [],
  categories: [],
  subcategories: [],
  selectedClassified: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  },
  loading: false,
  error: null,
  total: 0,
  currentPage: 1,
  totalPages: 0
};

function classifiedsReducer(state: ClassifiedsState, action: ClassifiedAction): ClassifiedsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_CLASSIFIEDS':
      return {
        ...state,
        classifieds: action.payload.classifieds,
        total: action.payload.total,
        currentPage: action.payload.page,
        totalPages: action.payload.totalPages,
        loading: false,
        error: null
      };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'SET_SUBCATEGORIES':
      return { ...state, subcategories: action.payload };

    case 'SET_SELECTED_CLASSIFIED':
      return { ...state, selectedClassified: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'UPDATE_CLASSIFIED':
      return {
        ...state,
        classifieds: state.classifieds.map(classified =>
          classified.id === action.payload.id ? action.payload : classified
        ),
        selectedClassified: state.selectedClassified?.id === action.payload.id
          ? action.payload
          : state.selectedClassified
      };

    case 'DELETE_CLASSIFIED':
      return {
        ...state,
        classifieds: state.classifieds.filter(classified => classified.id !== action.payload),
        selectedClassified: state.selectedClassified?.id === action.payload
          ? null
          : state.selectedClassified
      };

    case 'ADD_CLASSIFIED':
      return {
        ...state,
        classifieds: [action.payload, ...state.classifieds]
      };

    default:
      return state;
  }
}

export function useClassifieds() {
  const [state, dispatch] = useReducer(classifiedsReducer, initialState);

  const loadClassifieds = useCallback(async (filters?: Partial<ClassifiedFilters>) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const mergedFilters = { ...state.filters, ...filters };
      dispatch({ type: 'SET_FILTERS', payload: mergedFilters });

      const response = await classifiedsApiService.getClassifieds(mergedFilters);
      dispatch({ type: 'SET_CLASSIFIEDS', payload: response });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar classificados';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    }
  }, [state.filters]);

  const loadCategories = useCallback(async () => {
    try {
      const categories = await classifiedsApiService.getCategories();
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar categorias';
      toast.error(message);
    }
  }, []);

  const approveClassified = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const updated = await classifiedsApiService.approveClassified(id);
      dispatch({ type: 'UPDATE_CLASSIFIED', payload: updated });
      toast.success('Classificado aprovado com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao aprovar classificado';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const rejectClassified = useCallback(async (id: number, reason: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const updated = await classifiedsApiService.rejectClassified(id, reason);
      dispatch({ type: 'UPDATE_CLASSIFIED', payload: updated });
      toast.success('Classificado rejeitado!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao rejeitar classificado';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const deleteClassified = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await classifiedsApiService.deleteClassified(id);
      dispatch({ type: 'DELETE_CLASSIFIED', payload: id });
      toast.success('Classificado deletado com sucesso!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar classificado';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const setFilters = useCallback((filters: Partial<ClassifiedFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setSelectedClassified = useCallback((classified: Classified | null) => {
    dispatch({ type: 'SET_SELECTED_CLASSIFIED', payload: classified });
  }, []);

  const refreshClassifieds = useCallback(() => {
    loadClassifieds(state.filters);
  }, [loadClassifieds, state.filters]);

  return {
    ...state,
    loadClassifieds,
    loadCategories,
    approveClassified,
    rejectClassified,
    deleteClassified,
    setFilters,
    setSelectedClassified,
    refreshClassifieds
  };
}