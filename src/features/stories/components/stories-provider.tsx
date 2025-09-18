import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Story } from '../data/schema';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface StoriesProviderProps {
  children: ReactNode;
}

interface StoriesContextType {
  stories: Story[];
  modules: Module[];
  isLoading: boolean;
  error: string | null;
  refreshStories: () => void;
}

interface Module {
  module_type: string;
  module_name: string;
}

const StoriesContext = createContext<StoriesContextType | undefined>(undefined);

export function StoriesProvider({ children }: StoriesProviderProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Usar dados mock em caso de erro na API
      const mockStories: Story[] = [
        {
          id: '1',
          name: 'Story Exemplo 1',
          status: 'ACTIVE',
          viewed: true,
          module: 'Promoções',
          storeId: '1',
          userId: '1',
          startAt: '2024-01-01T00:00:00Z',
          endAt: '2024-12-31T23:59:59Z',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [],
        }
      ];

      try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.STORIES.LIST_ALL);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setStories(data);
        } else {
          console.warn('API não disponível, usando dados mock');
          setStories(mockStories);
        }
      } catch (apiError) {
        console.warn('Erro na API, usando dados mock:', apiError);
        setStories(mockStories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      // Usar dados mock para módulos
      const mockModules: Module[] = [
        { module_type: 'promotions', module_name: 'Promoções' },
        { module_type: 'news', module_name: 'Notícias' },
        { module_type: 'products', module_name: 'Produtos' },
        { module_type: 'events', module_name: 'Eventos' },
      ];

      try {
        const url = buildApiUrl(API_CONFIG.ENDPOINTS.STORIES.LIST_MODULES);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setModules(data);
        } else {
          console.warn('API de módulos não disponível, usando dados mock');
          setModules(mockModules);
        }
      } catch (apiError) {
        console.warn('Erro na API de módulos, usando dados mock:', apiError);
        setModules(mockModules);
      }
    } catch (err) {
      console.error('Erro ao buscar módulos:', err);
      // Sempre definir módulos mock em caso de erro
      setModules([
        { module_type: 'promotions', module_name: 'Promoções' },
        { module_type: 'news', module_name: 'Notícias' },
      ]);
    }
  };

  const refreshStories = () => {
    fetchStories();
  };

  useEffect(() => {
    fetchStories();
    fetchModules();
  }, []);

  return (
    <StoriesContext.Provider value={{
      stories,
      modules,
      isLoading,
      error,
      refreshStories
    }}>
      {children}
    </StoriesContext.Provider>
  );
}

export function useStories() {
  const context = useContext(StoriesContext);
  if (!context) throw new Error('useStories must be used within a StoriesProvider');
  return context;
}
