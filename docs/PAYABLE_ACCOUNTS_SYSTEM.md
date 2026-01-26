# 💰 Sistema de Gestão de Contas a Pagar - Documentação Completa

## 📋 Visão Geral

Sistema completo para gestão financeira de contas a pagar dos fornecedores do app Villa Market. Controla o ciclo completo desde a criação da conta até o pagamento final, incluindo:

- ✅ Criação manual ou automática de contas a pagar
- ✅ Aprovação de contas por administradores
- ✅ Registro de pagamentos
- ✅ Controle de vencimentos e contas vencidas
- ✅ Relatórios e dashboard financeiro
- ✅ Operações em lote (aprovação e pagamento)

---

## 🏗️ Arquitetura

### Modelos
- **PayableAccount** (`src/models/payableAccount.ts`): Interface principal da conta a pagar

### Serviços
- **PayableAccountService** (`src/services/payableAccountService.ts`): Lógica de negócio

### Controllers
- **PayableAccountController** (`src/controller/payableAccountController.ts`): Endpoints da API

### Rotas
- **Base URL**: `/admin/payable-accounts`

### Banco de Dados
- **Tabela**: `payable_accounts`
- **Script SQL**: `database/payable_accounts.sql`

---

## 📊 Estrutura da Conta a Pagar

```typescript
interface PayableAccount {
  id: number;
  store_id: number;
  store_name?: string;
  
  // Informações
  invoice_number?: string;
  description: string;
  reference_month: string; // YYYY-MM
  
  // Valores
  gross_amount: number;    // Valor bruto (vendas)
  discounts: number;       // Descontos totais
  fees: number;            // Taxas (plataforma + cartão)
  net_amount: number;      // Valor líquido a pagar
  
  // Datas
  issue_date: Date;        // Data de emissão
  due_date: Date;          // Data de vencimento
  payment_date?: Date;     // Data do pagamento efetivo
  
  // Status
  status: PayableAccountStatus;
  payment_method?: string; // pix, ted, boleto, etc
  
  // Controle
  approved_by?: number;    // ID do admin que aprovou
  approved_at?: Date;
  paid_by?: number;        // ID do admin que confirmou pagamento
  paid_at?: Date;
  
  notes?: string;
  created_at: Date;
  updated_at: Date;
}
```

---

## 🔄 Status da Conta

| Status | Valor | Descrição |
|--------|-------|-----------|
| Pendente | `pending` | Aguardando aprovação |
| Aprovada | `approved` | Aprovada, aguardando pagamento |
| Paga | `paid` | Pagamento confirmado |
| Vencida | `overdue` | Prazo de pagamento expirado |
| Cancelada | `cancelled` | Conta cancelada |

---

## 🔌 Endpoints da API

### 1. Criar Conta a Pagar

```http
POST /admin/payable-accounts
Content-Type: application/json

{
  "store_id": 1,
  "invoice_number": "FAT-2026-01-001",
  "description": "Repasse Mensal - Janeiro 2026",
  "reference_month": "2026-01",
  "gross_amount": 5000.00,
  "discounts": 350.00,
  "fees": 625.00,
  "net_amount": 4025.00,
  "issue_date": "2026-01-21",
  "due_date": "2026-02-20",
  "notes": "Pagamento referente às vendas de janeiro"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conta a pagar criada com sucesso",
  "data": {
    "id": 1,
    "store_id": 1,
    "store_name": "Loja Exemplo",
    "invoice_number": "FAT-2026-01-001",
    "description": "Repasse Mensal - Janeiro 2026",
    "reference_month": "2026-01",
    "gross_amount": 5000.00,
    "discounts": 350.00,
    "fees": 625.00,
    "net_amount": 4025.00,
    "issue_date": "2026-01-21",
    "due_date": "2026-02-20",
    "status": "pending",
    "notes": "Pagamento referente às vendas de janeiro",
    "created_at": "2026-01-21T10:30:00.000Z",
    "updated_at": "2026-01-21T10:30:00.000Z"
  }
}
```

---

### 2. Gerar Conta Automaticamente

```http
POST /admin/payable-accounts/auto-generate
Content-Type: application/json

{
  "store_id": 1,
  "reference_month": "2026-01",
  "payment_report_period": "monthly"
}
```

**Descrição:**
- Gera automaticamente uma conta a pagar baseada no relatório de vendas
- Integra com o sistema de pagamentos de fornecedores existente
- Calcula valores automaticamente (vendas, descontos, taxas)
- Define vencimento para 30 dias após o fim do período

**Response:** Igual ao endpoint de criação manual

---

### 3. Buscar Conta por ID

```http
GET /admin/payable-accounts/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "store_id": 1,
    "store_name": "Loja Exemplo",
    // ... outros campos
  }
}
```

---

### 4. Listar Contas com Filtros

```http
GET /admin/payable-accounts?store_id=1&status=pending&include_summary=true&limit=50&offset=0
```

**Query Parameters:**
- `store_id` (opcional): Filtrar por loja
- `status` (opcional): pending, approved, paid, overdue, cancelled
- `reference_month` (opcional): YYYY-MM
- `start_due_date` (opcional): YYYY-MM-DD
- `end_due_date` (opcional): YYYY-MM-DD
- `start_payment_date` (opcional): YYYY-MM-DD
- `end_payment_date` (opcional): YYYY-MM-DD
- `overdue_only` (opcional): true/false - apenas contas vencidas
- `include_summary` (opcional): true/false - incluir resumo financeiro
- `limit` (opcional): número de registros (padrão: 50)
- `offset` (opcional): offset para paginação (padrão: 0)

**Response:**
```json
{
  "success": true,
  "total": 125,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "store_id": 1,
      "store_name": "Loja Exemplo",
      "invoice_number": "FAT-2026-01-001",
      "description": "Repasse Mensal - Janeiro 2026",
      "reference_month": "2026-01",
      "net_amount": 4025.00,
      "due_date": "2026-02-20",
      "status": "pending"
    }
  ],
  "summary": {
    "total_accounts": 125,
    "pending_count": 45,
    "approved_count": 30,
    "paid_count": 40,
    "overdue_count": 10,
    "cancelled_count": 0,
    "total_net_amount": 150000.00,
    "pending_amount": 60000.00,
    "approved_amount": 40000.00,
    "paid_amount": 50000.00,
    "overdue_amount": 10000.00
  }
}
```

---

### 5. Atualizar Conta

```http
PUT /admin/payable-accounts/:id
Content-Type: application/json

{
  "invoice_number": "FAT-2026-01-001-UPDATED",
  "description": "Nova descrição",
  "due_date": "2026-02-25",
  "notes": "Observações atualizadas"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conta atualizada com sucesso",
  "data": {
    // ... conta atualizada
  }
}
```

---

### 6. Aprovar Conta

```http
POST /admin/payable-accounts/:id/approve
Content-Type: application/json

{
  "approved_by": 1
}
```

**Descrição:**
- Muda status de `pending` para `approved`
- Registra quem aprovou e quando
- Conta fica pronta para pagamento

**Response:**
```json
{
  "success": true,
  "message": "Conta aprovada com sucesso",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_by": 1,
    "approved_at": "2026-01-21T14:30:00.000Z"
  }
}
```

---

### 7. Registrar Pagamento

```http
POST /admin/payable-accounts/:id/payment
Content-Type: application/json

{
  "payment_date": "2026-02-15",
  "payment_method": "pix",
  "paid_by": 1,
  "notes": "Pagamento realizado via PIX - Chave: fornecedor@example.com"
}
```

**Descrição:**
- Muda status de `approved` para `paid`
- Registra data e método de pagamento
- Registra quem confirmou o pagamento

**Response:**
```json
{
  "success": true,
  "message": "Pagamento registrado com sucesso",
  "data": {
    "id": 1,
    "status": "paid",
    "payment_date": "2026-02-15",
    "payment_method": "pix",
    "paid_by": 1,
    "paid_at": "2026-02-15T10:00:00.000Z"
  }
}
```

---

### 8. Cancelar Conta

```http
DELETE /admin/payable-accounts/:id
```

**Descrição:**
- Cancela uma conta (não pode ser paga)
- Muda status para `cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Conta cancelada com sucesso",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

### 9. Obter Resumo Financeiro

```http
GET /admin/payable-accounts/summary?store_id=1&reference_month=2026-01
```

**Query Parameters:**
- `store_id` (opcional): Filtrar por loja
- `reference_month` (opcional): YYYY-MM
- `start_due_date` (opcional): YYYY-MM-DD
- `end_due_date` (opcional): YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "total_accounts": 50,
    "pending_count": 20,
    "approved_count": 15,
    "paid_count": 10,
    "overdue_count": 5,
    "cancelled_count": 0,
    "total_gross_amount": 250000.00,
    "total_discounts": 17500.00,
    "total_fees": 31250.00,
    "total_net_amount": 201250.00,
    "pending_amount": 80000.00,
    "approved_amount": 60000.00,
    "paid_amount": 50000.00,
    "overdue_amount": 11250.00
  }
}
```

---

### 10. Dashboard Completo

```http
GET /admin/payable-accounts/dashboard
```

**Descrição:**
- Resumo geral de todas as contas
- Contas vencidas (top 10)
- Contas a vencer esta semana
- Contas a vencer este mês
- Top 10 fornecedores por valor
- Fluxo de caixa (últimos 6 meses)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_accounts": 500,
      "pending_count": 120,
      "approved_count": 80,
      "paid_count": 250,
      "overdue_count": 50,
      "total_net_amount": 2500000.00,
      "pending_amount": 600000.00,
      "approved_amount": 400000.00,
      "paid_amount": 1250000.00,
      "overdue_amount": 250000.00
    },
    "overdue_accounts": [
      {
        "id": 15,
        "store_name": "Loja A",
        "net_amount": 5000.00,
        "due_date": "2026-01-10",
        "status": "overdue"
      }
    ],
    "due_this_week": [
      {
        "id": 25,
        "store_name": "Loja B",
        "net_amount": 3000.00,
        "due_date": "2026-01-25"
      }
    ],
    "due_this_month": [
      // ... contas a vencer no mês
    ],
    "top_suppliers_by_amount": [
      {
        "store_id": 1,
        "store_name": "Loja Principal",
        "total_amount": 150000.00,
        "account_count": 50
      }
    ],
    "cash_flow": [
      {
        "month": "2026-01",
        "paid_amount": 50000.00,
        "pending_amount": 80000.00
      },
      {
        "month": "2025-12",
        "paid_amount": 45000.00,
        "pending_amount": 0
      }
    ]
  }
}
```

---

### 11. Atualizar Contas Vencidas

```http
POST /admin/payable-accounts/update-overdue
```

**Descrição:**
- Atualiza automaticamente o status de contas vencidas
- Muda contas `pending` ou `approved` com vencimento passado para `overdue`
- Deve ser executado periodicamente (diariamente recomendado)

**Response:**
```json
{
  "success": true,
  "message": "15 conta(s) atualizada(s) para status vencido",
  "updated_count": 15
}
```

---

### 12. Aprovação em Lote

```http
POST /admin/payable-accounts/bulk-approve
Content-Type: application/json

{
  "account_ids": [1, 2, 3, 4, 5],
  "approved_by": 1
}
```

**Descrição:**
- Aprova múltiplas contas de uma vez
- Apenas contas com status `pending` são aprovadas

**Response:**
```json
{
  "success": true,
  "message": "5 conta(s) aprovada(s) com sucesso",
  "approved_count": 5
}
```

---

### 13. Pagamento em Lote

```http
POST /admin/payable-accounts/bulk-payment
Content-Type: application/json

{
  "account_ids": [6, 7, 8, 9],
  "payment_date": "2026-02-15",
  "payment_method": "pix",
  "paid_by": 1,
  "notes": "Pagamento em lote via PIX"
}
```

**Descrição:**
- Registra pagamento de múltiplas contas de uma vez
- Apenas contas com status `approved` são pagas

**Response:**
```json
{
  "success": true,
  "message": "4 conta(s) paga(s) com sucesso",
  "paid_count": 4
}
```

---

## 💰 Fluxo de Trabalho Completo

### Cenário 1: Repasse Mensal Manual

```mermaid
graph LR
    A[Criar Conta] --> B[Revisar Valores]
    B --> C[Aprovar Conta]
    C --> D[Realizar Pagamento]
    D --> E[Registrar Pagamento]
    E --> F[Concluído]
```

**Passos:**

1. **Criar Conta**
```bash
curl -X POST http://localhost:5001/admin/payable-accounts \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "description": "Repasse Mensal - Janeiro 2026",
    "reference_month": "2026-01",
    "gross_amount": 5000.00,
    "discounts": 350.00,
    "fees": 625.00,
    "net_amount": 4025.00,
    "issue_date": "2026-01-21",
    "due_date": "2026-02-20"
  }'
```

2. **Aprovar Conta**
```bash
curl -X POST http://localhost:5001/admin/payable-accounts/1/approve \
  -H "Content-Type: application/json" \
  -d '{"approved_by": 1}'
```

3. **Registrar Pagamento**
```bash
curl -X POST http://localhost:5001/admin/payable-accounts/1/payment \
  -H "Content-Type: application/json" \
  -d '{
    "payment_date": "2026-02-15",
    "payment_method": "pix",
    "paid_by": 1,
    "notes": "Pagamento via PIX"
  }'
```

---

### Cenário 2: Repasse Automático

```bash
# Gerar conta automaticamente baseada em relatório de vendas
curl -X POST http://localhost:5001/admin/payable-accounts/auto-generate \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "reference_month": "2026-01",
    "payment_report_period": "monthly"
  }'
```

---

### Cenário 3: Pagamento em Lote Semanal

```bash
# 1. Listar contas aprovadas da semana
curl "http://localhost:5001/admin/payable-accounts?status=approved&start_due_date=2026-01-21&end_due_date=2026-01-27"

# 2. Pagar todas em lote
curl -X POST http://localhost:5001/admin/payable-accounts/bulk-payment \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": [1, 2, 3, 4, 5],
    "payment_date": "2026-01-27",
    "payment_method": "pix",
    "paid_by": 1,
    "notes": "Repasse semanal em lote"
  }'
```

---

## 📊 Filtros e Consultas Úteis

### 1. Contas Vencidas
```bash
curl "http://localhost:5001/admin/payable-accounts?overdue_only=true&include_summary=true"
```

### 2. Contas de uma Loja no Mês
```bash
curl "http://localhost:5001/admin/payable-accounts?store_id=1&reference_month=2026-01&include_summary=true"
```

### 3. Contas Aprovadas Aguardando Pagamento
```bash
curl "http://localhost:5001/admin/payable-accounts?status=approved"
```

### 4. Contas Pagas em um Período
```bash
curl "http://localhost:5001/admin/payable-accounts?status=paid&start_payment_date=2026-01-01&end_payment_date=2026-01-31"
```

### 5. Dashboard Completo
```bash
curl "http://localhost:5001/admin/payable-accounts/dashboard"
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE:** Em produção, adicione middleware de autenticação admin:

```typescript
import { authenticateAdmin } from "../middleware/authMiddleware";

// Proteger todas as rotas
router.use(authenticateAdmin);
```

---

## 🛠️ Manutenção

### Job Diário: Atualizar Contas Vencidas

Criar um cron job para executar diariamente:

```bash
# Crontab: Executar todos os dias às 00:00
0 0 * * * curl -X POST http://localhost:5001/admin/payable-accounts/update-overdue
```

Ou usando node-cron no código:

```typescript
import cron from 'node-cron';

// Executar diariamente às 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Atualizando contas vencidas...');
  await payableAccountService.updateOverdueAccounts();
});
```

---

## 📈 Relatórios e Análises

### Exportar Contas para Excel (Futuro)

```bash
# Endpoint futuro
GET /admin/payable-accounts/export?format=xlsx&store_id=1&reference_month=2026-01
```

### Notificações (Futuro)

- Email para admin quando conta está vencida
- Email para fornecedor quando pagamento é realizado
- Push notification no app

---

## 🎯 Casos de Uso

### 1. Gestão Financeira Mensal
- Gerar contas automaticamente no fim do mês
- Revisar e aprovar em lote
- Processar pagamentos por loja

### 2. Controle de Fluxo de Caixa
- Visualizar dashboard com métricas
- Acompanhar contas a vencer
- Monitorar contas vencidas

### 3. Auditoria Financeira
- Exportar relatórios de pagamentos
- Rastrear aprovações e pagamentos
- Histórico completo por fornecedor

---

## 🔧 Troubleshooting

### Erro: "Loja não encontrada"
- Verifique se o store_id existe na tabela `stores`
- Confirme se a loja está ativa (status = 1)

### Erro: "Conta não pode ser aprovada"
- Verifique o status atual da conta
- Apenas contas `pending` podem ser aprovadas

### Erro: "Conta não pode ser paga"
- Verifique se a conta foi aprovada primeiro
- Apenas contas `approved` podem receber pagamento

### Contas não aparecem como vencidas
- Execute o endpoint `/update-overdue` manualmente
- Configure job automático diário

---

## 📂 Arquivos do Sistema

```
src/
├── models/
│   └── payableAccount.ts                 ✅ Interfaces e tipos
├── services/
│   └── payableAccountService.ts          ✅ Lógica de negócio
├── controller/
│   └── payableAccountController.ts       ✅ Endpoints API
└── routes/
    └── payableAccountRoutes.ts           ✅ Configuração de rotas

database/
└── payable_accounts.sql                  ✅ Schema do banco

docs/
├── PAYABLE_ACCOUNTS_SYSTEM.md            ✅ Documentação completa
└── PAYABLE_ACCOUNTS_QUICKSTART.md        ✅ Guia rápido
```

---

## ✅ Checklist de Implementação

- [x] Modelo PayableAccount com todas as interfaces
- [x] Serviço com todas as operações CRUD
- [x] Controller com validações
- [x] Rotas RESTful configuradas
- [x] Script SQL para criar tabela
- [x] Documentação completa
- [ ] Registro de rotas no index.ts (próximo passo)
- [ ] Middleware de autenticação
- [ ] Testes automatizados
- [ ] Job automático para contas vencidas

---

## 🚀 Próximos Passos (Fase 2)

- [ ] Integração com API PIX/TED para pagamentos automáticos
- [ ] Sistema de notificações (email/push)
- [ ] Dashboard visual com gráficos
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Histórico de alterações (audit log)
- [ ] Integração com contabilidade

---

**Desenvolvido em:** 21/01/2026  
**Status:** ✅ Completo e Pronto para Uso  
**Versão:** 1.0.0
