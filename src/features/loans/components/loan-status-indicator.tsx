import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LoanStatusIndicatorProps {
  status: string
  step?: string
  analysisNotes?: string
  className?: string
}

export function LoanStatusIndicator({
  status,
  step,
  analysisNotes,
  className = ''
}: LoanStatusIndicatorProps) {
  const getStatusInfo = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || ''

    switch (normalizedStatus) {
      case 'pending':
      case 'pendente':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Aguardando Análise',
          description: 'Empréstimo está pendente de aprovação'
        }
      case 'approved':
      case 'aprovado':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Aprovado',
          description: 'Empréstimo foi aprovado e está sendo processado'
        }
      case 'rejected':
      case 'recusado':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejeitado',
          description: 'Empréstimo foi rejeitado'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status || 'Status Desconhecido',
          description: 'Status não reconhecido'
        }
    }
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icon

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${statusInfo.color}`}>
          <StatusIcon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            {step && (
              <Badge variant="outline" className="text-xs">
                Step {step}
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {statusInfo.description}
          </p>

          {analysisNotes && analysisNotes.trim() && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 border-l-4 border-gray-300 dark:border-gray-600">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações:
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {analysisNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}