'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

// Componente Progress inline
const Progress = ({ value = 0, className = '' }: { value?: number; className?: string }) => (
  <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div
      className='h-full bg-primary transition-all duration-300 ease-in-out'
      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
    />
  </div>
)

interface LoanData {
  id: string
  amountRequested: string
  valueApproved: string
  installmentAmount: string
  numberOfInstallments: string
  createdAt: string
  installments: Array<{
    id: string
    installment: string
    originAmount: string
    amount: string
    paymentDate: string | null
    dueDate: string
    daysLate: number | null
  }>
}

interface InflationData {
  date: string
  value: number
}

interface ViabilityAnalysis {
  isViable: boolean
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  totalCost: number
  totalInterest: number
  realValue: number
  monthlyInflationImpact: number
  recommendation: string
  factors: {
    inflationImpact: number
    paymentHistory: number
    loanTerm: number
    amount: number
  }
}

type LoanViabilityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanData: LoanData
}

export function LoanViabilityDialog({
  open,
  onOpenChange,
  loanData,
}: LoanViabilityDialogProps) {
  const [inflationData, setInflationData] = useState<InflationData[]>([])
  const [analysis, setAnalysis] = useState<ViabilityAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Buscar dados de inflação da API do IBGE
  const fetchInflationData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        'https://servicodados.ibge.gov.br/api/v3/agregados/1737/periodos/202401%7C202402%7C202403%7C202404%7C202405%7C202406%7C202407%7C202408%7C202409%7C202410%7C202411%7C202412/variaveis/2266?localidades=N1[all]'
      )
      const data = await response.json()

      if (data && data[0] && data[0].resultados && data[0].resultados[0]) {
        const series = data[0].resultados[0].series[0].serie
        const inflationValues = Object.entries(series).map(([date, value]) => ({
          date,
          value: parseFloat(value as string) || 0
        }))
        setInflationData(inflationValues)
        calculateViability(inflationValues)
      }
    } catch (error) {
      console.error('Erro ao buscar dados de inflação:', error)
      // Usar dados simulados em caso de erro
      const simulatedData = [
        { date: '202401', value: 0.42 },
        { date: '202402', value: 0.83 },
        { date: '202403', value: 0.16 },
        { date: '202404', value: 0.38 },
        { date: '202405', value: 0.46 },
        { date: '202406', value: 0.21 },
        { date: '202407', value: 0.38 },
        { date: '202408', value: 0.02 },
        { date: '202409', value: 0.44 },
      ]
      setInflationData(simulatedData)
      calculateViability(simulatedData)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular análise de viabilidade
  const calculateViability = (inflation: InflationData[]) => {
    const amount = parseFloat(loanData.amountRequested)
    const installmentValue = parseFloat(loanData.installmentAmount)
    const installments = parseInt(loanData.numberOfInstallments)

    // Calcular inflação média
    const avgInflation = inflation.reduce((sum, item) => sum + item.value, 0) / inflation.length

    // Calcular valores
    const totalPaid = installmentValue * installments
    const totalInterest = totalPaid - amount

    // Calcular impacto da inflação
    const monthlyInflationImpact = avgInflation / 100
    const accumulatedInflation = Math.pow(1 + monthlyInflationImpact, installments) - 1
    const realValue = amount * (1 + accumulatedInflation)

    // Calcular histórico de pagamento
    const paidInstallments = loanData.installments.filter(inst => inst.paymentDate).length
    const paymentRate = paidInstallments / loanData.installments.length

    // Calcular fatores de risco
    const factors = {
      inflationImpact: Math.min(100, Math.max(0, 100 - (accumulatedInflation * 100))),
      paymentHistory: paymentRate * 100,
      loanTerm: Math.min(100, Math.max(0, 100 - (installments / 60) * 100)),
      amount: Math.min(100, Math.max(0, 100 - (amount / 100000) * 100))
    }

    // Calcular score geral
    const score = (factors.inflationImpact + factors.paymentHistory + factors.loanTerm + factors.amount) / 4

    // Determinar nível de risco
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (score < 40) riskLevel = 'high'
    else if (score < 70) riskLevel = 'medium'

    // Gerar recomendação
    let recommendation = ''
    if (score >= 80) {
      recommendation = 'Empréstimo altamente viável. Condições favoráveis e baixo risco.'
    } else if (score >= 60) {
      recommendation = 'Empréstimo viável com algumas considerações. Monitore a inflação.'
    } else if (score >= 40) {
      recommendation = 'Empréstimo de risco médio. Avalie cuidadosamente as condições.'
    } else {
      recommendation = 'Empréstimo de alto risco. Considere renegociar os termos.'
    }

    setAnalysis({
      isViable: score >= 60,
      score,
      riskLevel,
      totalCost: totalPaid,
      totalInterest,
      realValue,
      monthlyInflationImpact: avgInflation,
      recommendation,
      factors
    })
  }

  useEffect(() => {
    if (open && loanData) {
      fetchInflationData()
    }
  }, [open, loanData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixo Risco'
      case 'medium': return 'Risco Médio'
      case 'high': return 'Alto Risco'
      default: return 'Indefinido'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='!max-w-[80vw] w-[80vw] max-h-[90vh] overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Análise de Viabilidade do Empréstimo
          </DialogTitle>
          <DialogDescription>
            Análise completa considerando inflação, histórico de pagamentos e condições do mercado
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2'></div>
              <p>Calculando análise de viabilidade...</p>
            </div>
          </div>
        ) : analysis ? (
          <div className='space-y-6'>
            {/* Resumo da Análise */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    {analysis.isViable ? (
                      <CheckCircle className='h-4 w-4 text-green-600' />
                    ) : (
                      <AlertTriangle className='h-4 w-4 text-red-600' />
                    )}
                    Status de Viabilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analysis.score.toFixed(0)}%
                  </div>
                  <Badge className={getRiskColor(analysis.riskLevel)}>
                    {getRiskLabel(analysis.riskLevel)}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <DollarSign className='h-4 w-4' />
                    Custo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(analysis.totalCost)}
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Juros: {formatCurrency(analysis.totalInterest)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4' />
                    Impacto da Inflação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {analysis.monthlyInflationImpact.toFixed(2)}%
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Valor real: {formatCurrency(analysis.realValue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fatores de Análise */}
            <Card>
              <CardHeader>
                <CardTitle>Fatores de Análise</CardTitle>
                <CardDescription>
                  Pontuação detalhada dos fatores considerados na análise
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Impacto da Inflação</span>
                    <span>{analysis.factors.inflationImpact.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysis.factors.inflationImpact} />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Histórico de Pagamentos</span>
                    <span>{analysis.factors.paymentHistory.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysis.factors.paymentHistory} />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Prazo do Empréstimo</span>
                    <span>{analysis.factors.loanTerm.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysis.factors.loanTerm} />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Valor do Empréstimo</span>
                    <span>{analysis.factors.amount.toFixed(0)}%</span>
                  </div>
                  <Progress value={analysis.factors.amount} />
                </div>
              </CardContent>
            </Card>

            {/* Dados de Inflação */}
            <Card>
              <CardHeader>
                <CardTitle>Dados de Inflação (IPCA)</CardTitle>
                <CardDescription>
                  Últimos meses disponíveis - IBGE
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mês/Ano</TableHead>
                        <TableHead>Taxa (%)</TableHead>
                        <TableHead>Tendência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inflationData.slice(-6).map((item, index) => {
                        const prevValue = index > 0 ? inflationData[inflationData.length - 6 + index - 1]?.value : item.value
                        const trend = item.value > prevValue ? 'up' : item.value < prevValue ? 'down' : 'stable'

                        return (
                          <TableRow key={item.date}>
                            <TableCell>
                              {item.date.substring(4)}/{item.date.substring(0, 4)}
                            </TableCell>
                            <TableCell>{item.value.toFixed(2)}%</TableCell>
                            <TableCell>
                              <div className='flex items-center gap-1'>
                                {trend === 'up' && <TrendingUp className='h-4 w-4 text-red-500' />}
                                {trend === 'down' && <TrendingDown className='h-4 w-4 text-green-500' />}
                                {trend === 'stable' && <span className='h-4 w-4' />}
                                <span className='capitalize'>{trend === 'stable' ? 'estável' : trend === 'up' ? 'alta' : 'baixa'}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes das Parcelas */}
            <Card>
              <CardHeader>
                <CardTitle>Análise das Parcelas</CardTitle>
                <CardDescription>
                  Status de pagamento e impacto no risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Impacto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanData.installments.map((installment) => {
                        const isPaid = !!installment.paymentDate
                        const isLate = installment.daysLate && installment.daysLate > 0

                        return (
                          <TableRow key={installment.id}>
                            <TableCell>{installment.installment}</TableCell>
                            <TableCell>{formatCurrency(parseFloat(installment.amount))}</TableCell>
                            <TableCell>{formatDate(installment.dueDate)}</TableCell>
                            <TableCell>
                              <Badge className={
                                isPaid ? 'bg-green-100 text-green-800' :
                                  isLate ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                              }>
                                {isPaid ? 'Pago' : isLate ? `Atrasado (${installment.daysLate} dias)` : 'Pendente'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-1'>
                                {isPaid ? (
                                  <CheckCircle className='h-4 w-4 text-green-500' />
                                ) : isLate ? (
                                  <AlertTriangle className='h-4 w-4 text-red-500' />
                                ) : (
                                  <Clock className='h-4 w-4 text-yellow-500' />
                                )}
                                <span className='text-sm'>
                                  {isPaid ? 'Positivo' : isLate ? 'Negativo' : 'Neutro'}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Recomendação */}
            <Card>
              <CardHeader>
                <CardTitle>Recomendação</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  {analysis.recommendation}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
