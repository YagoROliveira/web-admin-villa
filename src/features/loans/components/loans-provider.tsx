import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Loan } from '../data/schema';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface LoansProviderProps {
  children: ReactNode;
}

interface LoansContextType {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
  // Adicione métodos de manipulação se necessário
}

const LoansContext = createContext<LoansContextType | undefined>(undefined);

export function LoansProvider({ children }: LoansProviderProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.LIST_ALL);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar empréstimos');
        const apiData = await res.json();
        // Mapeia o retorno da API para o schema local
        const mapped: Loan[] = apiData.map((item: any) => ({
          id: item.id,
          solicitante: item.userName,
          valor: Number(item.amountRequested),
          status: item.approvalStatus === 'APPROVED' ? 'Aprovado' : item.approvalStatus === 'PENDING' ? 'Pendente' : item.approvalStatus,
          dataSolicitacao: item.createdAt || '',
        }));
        setLoans(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erro desconhecido');
        setIsLoading(false);
      });
  }, []);

  return (
    <LoansContext.Provider value={{ loans, isLoading, error }}>
      {children}
    </LoansContext.Provider>
  );
}

export function useLoans() {
  const context = useContext(LoansContext);
  if (!context) throw new Error('useLoans must be used within a LoansProvider');
  return context;
}
