# 🚀 Quick Start - Sistema de Gestão de Contas a Pagar

## 📋 Índice Rápido

1. [Setup Inicial](#1-setup-inicial)
2. [Exemplos Práticos](#2-exemplos-práticos)
3. [Integração Frontend](#3-integração-frontend)
4. [Fluxos Completos](#4-fluxos-completos)

---

## 1. Setup Inicial

### Passo 1: Criar Tabela no Banco

```bash
# Executar script SQL
mysql -u root -p admin < database/payable_accounts.sql
```

### Passo 2: Compilar e Rodar

```bash
# Compilar TypeScript
npm run build

# Rodar servidor
npm start
```

### Passo 3: Testar API

```bash
# Verificar se está funcionando
curl http://localhost:5001/admin/payable-accounts/dashboard | jq
```

---

## 2. Exemplos Práticos

### 📝 Criar Conta a Pagar Manualmente

```bash
curl -X POST http://localhost:5001/admin/payable-accounts \
  -H "Content-Type: application/json" \
  -d '{
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
  }' | jq
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Conta a pagar criada com sucesso",
  "data": {
    "id": 1,
    "store_id": 1,
    "store_name": "Loja Exemplo",
    "status": "pending",
    "net_amount": 4025.00,
    "due_date": "2026-02-20"
  }
}
```

---

### 🤖 Gerar Conta Automaticamente

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/auto-generate \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "reference_month": "2026-01",
    "payment_report_period": "monthly"
  }' | jq
```

**O que faz:**
- Busca relatório de vendas do período
- Calcula valores automaticamente
- Cria conta com vencimento em 30 dias
- Status inicial: `pending`

---

### 📋 Listar Todas as Contas

```bash
# Todas as contas (paginado)
curl "http://localhost:5001/admin/payable-accounts?limit=50&offset=0" | jq

# Com resumo financeiro
curl "http://localhost:5001/admin/payable-accounts?include_summary=true" | jq

# Contas de uma loja específica
curl "http://localhost:5001/admin/payable-accounts?store_id=1" | jq

# Contas pendentes
curl "http://localhost:5001/admin/payable-accounts?status=pending" | jq

# Contas aprovadas
curl "http://localhost:5001/admin/payable-accounts?status=approved" | jq

# Contas vencidas
curl "http://localhost:5001/admin/payable-accounts?overdue_only=true" | jq

# Contas do mês
curl "http://localhost:5001/admin/payable-accounts?reference_month=2026-01" | jq

# Contas com vencimento em período específico
curl "http://localhost:5001/admin/payable-accounts?start_due_date=2026-02-01&end_due_date=2026-02-28" | jq
```

**Resposta esperada:**
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
    "total_net_amount": 150000.00,
    "pending_amount": 60000.00,
    "approved_amount": 40000.00,
    "paid_amount": 50000.00,
    "overdue_amount": 10000.00
  }
}
```

---

### 🔍 Buscar Conta por ID

```bash
curl "http://localhost:5001/admin/payable-accounts/1" | jq
```

---

### ✏️ Atualizar Conta

```bash
curl -X PUT http://localhost:5001/admin/payable-accounts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "invoice_number": "FAT-2026-01-001-REV",
    "description": "Descrição atualizada",
    "due_date": "2026-02-25",
    "notes": "Prazo estendido a pedido do fornecedor"
  }' | jq
```

---

### ✅ Aprovar Conta

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/1/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approved_by": 1
  }' | jq
```

**Resposta esperada:**
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

### 💸 Registrar Pagamento

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/1/payment \
  -H "Content-Type: application/json" \
  -d '{
    "payment_date": "2026-02-15",
    "payment_method": "pix",
    "paid_by": 1,
    "notes": "Pagamento via PIX - Chave: fornecedor@example.com"
  }' | jq
```

**Resposta esperada:**
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

### ❌ Cancelar Conta

```bash
curl -X DELETE http://localhost:5001/admin/payable-accounts/1 | jq
```

---

### 📊 Resumo Financeiro

```bash
# Resumo geral
curl "http://localhost:5001/admin/payable-accounts/summary" | jq

# Resumo de uma loja
curl "http://localhost:5001/admin/payable-accounts/summary?store_id=1" | jq

# Resumo de um mês
curl "http://localhost:5001/admin/payable-accounts/summary?reference_month=2026-01" | jq

# Resumo de período específico
curl "http://localhost:5001/admin/payable-accounts/summary?start_due_date=2026-01-01&end_due_date=2026-01-31" | jq
```

**Resposta esperada:**
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

### 📈 Dashboard Completo

```bash
curl "http://localhost:5001/admin/payable-accounts/dashboard" | jq
```

**Resposta esperada:**
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
      // contas a vencer no mês
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
      }
    ]
  }
}
```

---

### 🔄 Atualizar Contas Vencidas

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/update-overdue | jq
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "15 conta(s) atualizada(s) para status vencido",
  "updated_count": 15
}
```

---

### 📦 Aprovação em Lote

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/bulk-approve \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": [1, 2, 3, 4, 5],
    "approved_by": 1
  }' | jq
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "5 conta(s) aprovada(s) com sucesso",
  "approved_count": 5
}
```

---

### 💰 Pagamento em Lote

```bash
curl -X POST http://localhost:5001/admin/payable-accounts/bulk-payment \
  -H "Content-Type: application/json" \
  -d '{
    "account_ids": [6, 7, 8, 9],
    "payment_date": "2026-02-15",
    "payment_method": "pix",
    "paid_by": 1,
    "notes": "Pagamento em lote via PIX"
  }' | jq
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "4 conta(s) paga(s) com sucesso",
  "paid_count": 4
}
```

---

## 3. Integração Frontend

### React/Next.js Service

```typescript
// services/payableAccountService.ts

interface PayableAccount {
  id: number;
  store_id: number;
  store_name?: string;
  invoice_number?: string;
  description: string;
  reference_month: string;
  gross_amount: number;
  discounts: number;
  fees: number;
  net_amount: number;
  issue_date: string;
  due_date: string;
  payment_date?: string;
  status: 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  payment_method?: string;
  notes?: string;
}

interface CreatePayableAccountRequest {
  store_id: number;
  invoice_number?: string;
  description: string;
  reference_month: string;
  gross_amount: number;
  discounts: number;
  fees: number;
  net_amount: number;
  issue_date: string;
  due_date: string;
  notes?: string;
}

export const payableAccountService = {
  // Criar conta
  async createAccount(data: CreatePayableAccountRequest) {
    const response = await fetch('/admin/payable-accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // Gerar conta automaticamente
  async autoGenerate(storeId: number, referenceMonth: string, period: string = 'monthly') {
    const response = await fetch('/admin/payable-accounts/auto-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({
        store_id: storeId,
        reference_month: referenceMonth,
        payment_report_period: period
      })
    });
    return await response.json();
  },

  // Listar contas
  async listAccounts(filters: {
    store_id?: number;
    status?: string;
    reference_month?: string;
    overdue_only?: boolean;
    include_summary?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });

    const response = await fetch(`/admin/payable-accounts?${params}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return await response.json();
  },

  // Buscar por ID
  async getById(id: number) {
    const response = await fetch(`/admin/payable-accounts/${id}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return await response.json();
  },

  // Atualizar conta
  async updateAccount(id: number, data: Partial<CreatePayableAccountRequest>) {
    const response = await fetch(`/admin/payable-accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // Aprovar conta
  async approve(id: number, approvedBy: number) {
    const response = await fetch(`/admin/payable-accounts/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ approved_by: approvedBy })
    });
    return await response.json();
  },

  // Registrar pagamento
  async registerPayment(id: number, data: {
    payment_date: string;
    payment_method: string;
    paid_by: number;
    notes?: string;
  }) {
    const response = await fetch(`/admin/payable-accounts/${id}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  },

  // Cancelar conta
  async cancel(id: number) {
    const response = await fetch(`/admin/payable-accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return await response.json();
  },

  // Dashboard
  async getDashboard() {
    const response = await fetch('/admin/payable-accounts/dashboard', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    return await response.json();
  },

  // Aprovação em lote
  async bulkApprove(accountIds: number[], approvedBy: number) {
    const response = await fetch('/admin/payable-accounts/bulk-approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ account_ids: accountIds, approved_by: approvedBy })
    });
    return await response.json();
  },

  // Pagamento em lote
  async bulkPayment(accountIds: number[], data: {
    payment_date: string;
    payment_method: string;
    paid_by: number;
    notes?: string;
  }) {
    const response = await fetch('/admin/payable-accounts/bulk-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify({ account_ids: accountIds, ...data })
    });
    return await response.json();
  }
};

function getAuthToken() {
  // Implementar sua lógica de autenticação
  return localStorage.getItem('authToken') || '';
}
```

---

### Componente React de Dashboard

```tsx
// components/PayableAccountsDashboard.tsx
import { useState, useEffect } from 'react';
import { payableAccountService } from '@/services/payableAccountService';

export function PayableAccountsDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await payableAccountService.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!dashboard) return <div>Erro ao carregar dados</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Contas a Pagar</h1>

      {/* Resumo Geral */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-500">
            {dashboard.summary.pending_count}
          </p>
          <p className="text-sm text-gray-500">
            R$ {dashboard.summary.pending_amount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 text-sm">Aprovadas</p>
          <p className="text-2xl font-bold text-blue-500">
            {dashboard.summary.approved_count}
          </p>
          <p className="text-sm text-gray-500">
            R$ {dashboard.summary.approved_amount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 text-sm">Pagas</p>
          <p className="text-2xl font-bold text-green-500">
            {dashboard.summary.paid_count}
          </p>
          <p className="text-sm text-gray-500">
            R$ {dashboard.summary.paid_amount.toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-600 text-sm">Vencidas</p>
          <p className="text-2xl font-bold text-red-500">
            {dashboard.summary.overdue_count}
          </p>
          <p className="text-sm text-gray-500">
            R$ {dashboard.summary.overdue_amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Contas Vencidas */}
      {dashboard.overdue_accounts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-700 mb-3">
            ⚠️ Contas Vencidas ({dashboard.overdue_accounts.length})
          </h2>
          <div className="space-y-2">
            {dashboard.overdue_accounts.map((account: any) => (
              <div key={account.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <p className="font-medium">{account.store_name}</p>
                  <p className="text-sm text-gray-600">{account.description}</p>
                  <p className="text-xs text-red-600">Vencimento: {account.due_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    R$ {account.net_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contas a Vencer Esta Semana */}
      {dashboard.due_this_week.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <h2 className="text-lg font-semibold text-yellow-700 mb-3">
            📅 A Vencer Esta Semana ({dashboard.due_this_week.length})
          </h2>
          <div className="space-y-2">
            {dashboard.due_this_week.map((account: any) => (
              <div key={account.id} className="flex justify-between items-center bg-white p-3 rounded">
                <div>
                  <p className="font-medium">{account.store_name}</p>
                  <p className="text-sm text-gray-600">{account.description}</p>
                  <p className="text-xs text-gray-500">Vencimento: {account.due_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">R$ {account.net_amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Fornecedores */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-3">🏆 Top Fornecedores</h2>
        <div className="space-y-2">
          {dashboard.top_suppliers_by_amount.slice(0, 5).map((supplier: any) => (
            <div key={supplier.store_id} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-medium">{supplier.store_name}</p>
                <p className="text-sm text-gray-600">{supplier.account_count} contas</p>
              </div>
              <p className="font-bold">R$ {supplier.total_amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### Componente de Lista de Contas

```tsx
// components/PayableAccountsList.tsx
import { useState, useEffect } from 'react';
import { payableAccountService } from '@/services/payableAccountService';

export function PayableAccountsList() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    store_id: '',
    reference_month: '',
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [filters]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await payableAccountService.listAccounts({
        ...filters,
        include_summary: true,
        limit: 50
      });
      setAccounts(response.data);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await payableAccountService.approve(id, 1); // Replace with actual admin ID
      loadAccounts();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await payableAccountService.bulkApprove(selectedIds, 1);
      setSelectedIds([]);
      loadAccounts();
    } catch (error) {
      console.error('Erro na aprovação em lote:', error);
    }
  };

  const handlePayment = async (id: number) => {
    try {
      await payableAccountService.registerPayment(id, {
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'pix',
        paid_by: 1, // Replace with actual admin ID
        notes: 'Pagamento realizado'
      });
      loadAccounts();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contas a Pagar</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="approved">Aprovada</option>
          <option value="paid">Paga</option>
          <option value="overdue">Vencida</option>
        </select>

        <input
          type="month"
          value={filters.reference_month}
          onChange={(e) => setFilters({ ...filters, reference_month: e.target.value })}
          className="border p-2 rounded"
        />

        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkApprove}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Aprovar Selecionados ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                <input type="checkbox" />
              </th>
              <th className="p-3 text-left">Fornecedor</th>
              <th className="p-3 text-left">Descrição</th>
              <th className="p-3 text-left">Vencimento</th>
              <th className="p-3 text-left">Valor</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(account.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, account.id]);
                      } else {
                        setSelectedIds(selectedIds.filter(id => id !== account.id));
                      }
                    }}
                  />
                </td>
                <td className="p-3">{account.store_name}</td>
                <td className="p-3">{account.description}</td>
                <td className="p-3">{account.due_date}</td>
                <td className="p-3 font-bold">R$ {account.net_amount.toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    account.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    account.status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {account.status}
                  </span>
                </td>
                <td className="p-3">
                  {account.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(account.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Aprovar
                    </button>
                  )}
                  {account.status === 'approved' && (
                    <button
                      onClick={() => handlePayment(account.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 4. Fluxos Completos

### Fluxo 1: Repasse Mensal Automático

```bash
#!/bin/bash
# Script: monthly-payables.sh
# Descrição: Gera contas a pagar mensais para todos os fornecedores

REFERENCE_MONTH="2026-01"
STORES=(1 2 3 4 5)

echo "========================================"
echo "Gerando Contas a Pagar - $REFERENCE_MONTH"
echo "========================================"

for STORE_ID in "${STORES[@]}"; do
  echo "Gerando conta para loja $STORE_ID..."
  
  curl -s -X POST http://localhost:5001/admin/payable-accounts/auto-generate \
    -H "Content-Type: application/json" \
    -d "{
      \"store_id\": $STORE_ID,
      \"reference_month\": \"$REFERENCE_MONTH\",
      \"payment_report_period\": \"monthly\"
    }" | jq
  
  echo ""
done

echo "✅ Contas geradas com sucesso!"
```

---

### Fluxo 2: Aprovação Semanal

```bash
#!/bin/bash
# Script: weekly-approval.sh
# Descrição: Aprova contas pendentes em lote

echo "Buscando contas pendentes..."

# 1. Buscar IDs das contas pendentes
ACCOUNT_IDS=$(curl -s "http://localhost:5001/admin/payable-accounts?status=pending&limit=100" | \
  jq -r '.data[] | .id' | \
  jq -s '.')

echo "Contas encontradas: $ACCOUNT_IDS"

# 2. Aprovar em lote
curl -X POST http://localhost:5001/admin/payable-accounts/bulk-approve \
  -H "Content-Type: application/json" \
  -d "{
    \"account_ids\": $ACCOUNT_IDS,
    \"approved_by\": 1
  }" | jq

echo "✅ Aprovação concluída!"
```

---

### Fluxo 3: Pagamento Quinzenal

```bash
#!/bin/bash
# Script: biweekly-payment.sh
# Descrição: Processa pagamentos quinzenais

PAYMENT_DATE=$(date +%Y-%m-%d)

echo "========================================"
echo "Processando Pagamentos - $PAYMENT_DATE"
echo "========================================"

# 1. Buscar contas aprovadas com vencimento próximo
ACCOUNT_IDS=$(curl -s "http://localhost:5001/admin/payable-accounts?status=approved&limit=100" | \
  jq -r '.data[] | .id' | \
  jq -s '.')

echo "Contas a pagar: $ACCOUNT_IDS"

# 2. Processar pagamento em lote
curl -X POST http://localhost:5001/admin/payable-accounts/bulk-payment \
  -H "Content-Type: application/json" \
  -d "{
    \"account_ids\": $ACCOUNT_IDS,
    \"payment_date\": \"$PAYMENT_DATE\",
    \"payment_method\": \"pix\",
    \"paid_by\": 1,
    \"notes\": \"Repasse quinzenal automático\"
  }" | jq

echo "✅ Pagamentos processados!"
```

---

### Fluxo 4: Job Diário (Cron)

```bash
#!/bin/bash
# Script: daily-maintenance.sh
# Descrição: Manutenção diária do sistema

echo "$(date): Executando manutenção diária..."

# 1. Atualizar contas vencidas
echo "Atualizando contas vencidas..."
curl -X POST http://localhost:5001/admin/payable-accounts/update-overdue | jq

# 2. Enviar relatório de contas vencidas (futuro)
# send_overdue_report.sh

echo "$(date): Manutenção concluída!"
```

**Configurar no crontab:**
```bash
# Executar todo dia às 00:00
0 0 * * * /path/to/daily-maintenance.sh >> /var/log/payables-cron.log 2>&1
```

---

## 🔍 Debugging

### Ver logs do servidor
```bash
tail -f logs/app.log
```

### Testar conexão com banco
```bash
mysql -u root -p admin -e "SELECT * FROM payable_accounts LIMIT 5;"
```

### Validar dados
```bash
# Verificar contas vencidas no banco
mysql -u root -p admin -e "SELECT * FROM vw_overdue_accounts;"

# Verificar resumo por loja
mysql -u root -p admin -e "SELECT * FROM vw_payable_summary_by_store;"
```

---

## 📞 Suporte

Se encontrar problemas:

1. ✅ Verifique se a tabela foi criada no banco
2. ✅ Confirme que o servidor está rodando
3. ✅ Valide IDs das lojas (devem existir na tabela `stores`)
4. ✅ Consulte logs de erro
5. ✅ Revise a documentação completa em `PAYABLE_ACCOUNTS_SYSTEM.md`

---

**🚀 Pronto para usar!**

Sistema completo de gestão de contas a pagar implementado e testado.
