import { Loan } from './schema'

export const loans: Loan[] = [
  {
    id: '1',
    solicitante: 'João Silva',
    valor: 1000,
    status: 'Pendente',
    dataSolicitacao: '2025-09-01',
  },
  {
    id: '2',
    solicitante: 'Maria Souza',
    valor: 500,
    status: 'Aprovado',
    dataSolicitacao: '2025-09-02',
  },
]
