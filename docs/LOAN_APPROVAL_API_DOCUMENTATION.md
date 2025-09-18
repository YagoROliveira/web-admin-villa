# 📋 API de Aprovação/Negativa de Empréstimos - Documentação Frontend

## 🎯 **Visão Geral**

Este documento apresenta os novos endpoints para **aprovação** e **negativa** de empréstimos, implementados com controle de histórico do valor aprovado.

### ✨ **Funcionalidades Implementadas**

1. **Aprovação de Empréstimo** - Define parâmetros de aprovação
2. **Negativa de Empréstimo** - Rejeita com motivo documentado
3. **Histórico de Valor Aprovado** - Preserva valor original mesmo após alterações

---

## 🔧 **Novos Endpoints**

### **1. Aprovar Empréstimo**

```http
PUT /wallet/v1/loan/approve
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "userId": "123",
  "loanRequestId": "loan-uuid-456", 
  "maxInstallments": 12,
  "interestRate": 2.5,
  "valueApproved": 5000.00
}
```

#### **Response (Sucesso - 200):**
```json
{
  "message": "Empréstimo aprovado com sucesso.",
  "loan": {
    "id": "loan-uuid-456",
    "userId": 123,
    "approvalStatus": "APPROVED",
    "maxInstallments": 12,
    "interestRate": 2.5,
    "valueApproved": 5000.00,
    "valueApprovedHistory": 4500.00,
    "step": "2",
    "updatedAt": "2025-09-17T10:30:00Z"
  }
}
```

#### **Validações:**
- ✅ `maxInstallments` deve ser > 0
- ✅ `interestRate` deve ser >= 0  
- ✅ `valueApproved` deve ser > 0
- ✅ Empréstimo deve existir

#### **Regras de Negócio:**
1. **Histórico Preservado**: Se `valueApproved` já existia, salva em `valueApprovedHistory`
2. **Status Atualizado**: `approvalStatus` = "APPROVED"
3. **Step Progression**: `step` = "2" (aprovado - aguardando configuração)

---

### **2. Rejeitar Empréstimo**

```http
PUT /wallet/v1/loan/reject
Content-Type: application/json
```

#### **Request Body:**
```json
{
  "userId": "123",
  "loanRequestId": "loan-uuid-456",
  "analysisNote": "Documentação incompleta e renda insuficiente para o valor solicitado"
}
```

#### **Response (Sucesso - 200):**
```json
{
  "message": "Empréstimo rejeitado com sucesso.",
  "loan": {
    "id": "loan-uuid-456",
    "userId": 123,
    "approvalStatus": "REJECTED",
    "analysisNotes": "Documentação incompleta e renda insuficiente para o valor solicitado",
    "valueApproved": 0,
    "step": "8",
    "updatedAt": "2025-09-17T10:30:00Z"
  }
}
```

#### **Validações:**
- ✅ `analysisNote` deve ter mínimo 10 caracteres
- ✅ `analysisNote` máximo 500 caracteres
- ✅ Empréstimo deve existir

#### **Regras de Negócio:**
1. **Status Final**: `approvalStatus` = "REJECTED"
2. **Motivo Documentado**: `analysisNotes` salvo para auditoria
3. **Valor Zerado**: `valueApproved` = 0
4. **Step Final**: `step` = "8" (rejeitado)

---

## 📊 **Novos Campos do Modelo Loan**

### **Campo Adicionado: `valueApprovedHistory`**

```typescript
valueApprovedHistory: number  // Preserva valor aprovado original
```

### **Comportamento:**
- **Primeira Aprovação**: `valueApprovedHistory` = 0
- **Re-aprovação**: `valueApprovedHistory` = valor anterior de `valueApproved`
- **Objetivo**: Manter histórico mesmo quando usuário altera valor na confirmação

---

## 🚨 **Códigos de Erro**

| Status | Descrição | Exemplo |
|--------|-----------|---------|
| **400** | Validação de entrada | Parâmetros obrigatórios ausentes |
| **403** | Usuário não autorizado | Token inválido |
| **404** | Empréstimo não encontrado | ID inexistente |
| **500** | Erro interno | Falha no banco de dados |

### **Exemplos de Erros:**

#### **400 - Dados Inválidos:**
```json
{
  "message": "Valores devem ser positivos e maiores que zero."
}
```

#### **400 - Motivo Muito Curto:**
```json
{
  "message": "Motivo da negativa deve ter pelo menos 10 caracteres."
}
```

#### **404 - Empréstimo Não Encontrado:**
```json
{
  "message": "Solicitação de empréstimo não encontrada."
}
```

---

## 💻 **Implementação Frontend**

### **Componente de Aprovação:**

```tsx
interface ApprovalFormData {
  maxInstallments: number;
  interestRate: number;
  valueApproved: number;
}

const approveLoan = async (loanId: string, data: ApprovalFormData) => {
  try {
    const response = await fetch('/wallet/v1/loan/approve', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: currentUser.id,
        loanRequestId: loanId,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    
    // Sucesso - atualizar UI
    showSuccessMessage(result.message);
    refreshLoanList();
    
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

### **Componente de Negativa:**

```tsx
interface RejectionFormData {
  analysisNote: string;
}

const rejectLoan = async (loanId: string, data: RejectionFormData) => {
  try {
    const response = await fetch('/wallet/v1/loan/reject', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: currentUser.id,
        loanRequestId: loanId,
        ...data
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    
    // Sucesso - atualizar UI
    showSuccessMessage(result.message);
    refreshLoanList();
    
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

### **Formulário de Aprovação:**

```tsx
const ApprovalForm = ({ loan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    maxInstallments: 12,
    interestRate: 2.5,
    valueApproved: loan.amountRequested
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validações frontend
    if (formData.maxInstallments <= 0) {
      alert('Número de parcelas deve ser maior que zero');
      return;
    }
    
    if (formData.valueApproved <= 0) {
      alert('Valor aprovado deve ser maior que zero');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Parcelas Máximas:</label>
        <input 
          type="number" 
          min="1" 
          max="60"
          value={formData.maxInstallments}
          onChange={(e) => setFormData({...formData, maxInstallments: +e.target.value})}
        />
      </div>
      
      <div>
        <label>Taxa de Juros (%):</label>
        <input 
          type="number" 
          step="0.1"
          min="0"
          value={formData.interestRate}
          onChange={(e) => setFormData({...formData, interestRate: +e.target.value})}
        />
      </div>
      
      <div>
        <label>Valor Aprovado:</label>
        <input 
          type="number" 
          step="0.01"
          min="0.01"
          value={formData.valueApproved}
          onChange={(e) => setFormData({...formData, valueApproved: +e.target.value})}
        />
      </div>
      
      <button type="submit">Aprovar Empréstimo</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  );
};
```

### **Formulário de Negativa:**

```tsx
const RejectionForm = ({ loan, onSubmit, onCancel }) => {
  const [analysisNote, setAnalysisNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (analysisNote.trim().length < 10) {
      alert('Motivo deve ter pelo menos 10 caracteres');
      return;
    }
    
    onSubmit({ analysisNote });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Motivo da Negativa:</label>
        <textarea 
          value={analysisNote}
          onChange={(e) => setAnalysisNote(e.target.value)}
          placeholder="Descreva o motivo da negativa (mínimo 10 caracteres)"
          maxLength="500"
          rows="4"
          required
        />
        <small>{analysisNote.length}/500 caracteres</small>
      </div>
      
      <button type="submit" disabled={analysisNote.length < 10}>
        Rejeitar Empréstimo
      </button>
      <button type="button" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
};
```

---

## 🔄 **Fluxo de Estados**

### **Estados do Empréstimo:**

```
PENDING → APPROVED → [configuração] → CONFIRMED → [assinatura] → COMPLETED
    ↓
REJECTED (estado final)
```

### **Steps Correspondentes:**

- **"1"**: Aguardando análise (PENDING)
- **"2"**: Aprovado - aguardando configuração (APPROVED)
- **"3"**: Documentos enviados
- **"7"**: Contrato confirmado
- **"8"**: Rejeitado (REJECTED)

---

## 📋 **Lista de Verificação para Implementação**

### **Backend (✅ Concluído):**
- ✅ Campo `valueApprovedHistory` adicionado ao modelo
- ✅ Migração criada
- ✅ Endpoints `/loan/approve` e `/loan/reject` implementados
- ✅ Validações de entrada
- ✅ Testes automatizados
- ✅ API specification atualizada

### **Frontend (🔧 A Implementar):**
- 🔲 Criar componente `ApprovalForm`
- 🔲 Criar componente `RejectionForm`
- 🔲 Integrar com lista de empréstimos
- 🔲 Adicionar validações frontend
- 🔲 Implementar feedback visual (sucesso/erro)
- 🔲 Testar fluxo completo
- 🔲 Adicionar permissões de acesso

---

## 🧪 **Como Testar**

### **1. Testar Endpoints (Backend):**
```bash
# Executar script de teste
./test_loan_approval.sh
```

### **2. Dados de Teste:**
```json
// Aprovação
{
  "userId": "1",
  "loanRequestId": "loan-test-123",
  "maxInstallments": 12,
  "interestRate": 2.5,
  "valueApproved": 5000.00
}

// Negativa
{
  "userId": "1", 
  "loanRequestId": "loan-test-456",
  "analysisNote": "Documentação incompleta e renda insuficiente"
}
```

### **3. Validar Comportamento:**
- ✅ Aprovação altera status para "APPROVED"
- ✅ Negativa altera status para "REJECTED"
- ✅ Histórico é preservado em `valueApprovedHistory`
- ✅ Steps são atualizados corretamente

---

## 🚀 **Próximos Passos**

1. **Implementar formulários no frontend**
2. **Adicionar permissionamento por perfil de usuário**
3. **Integrar com sistema de notificações**
4. **Criar relatórios de aprovação/negativa**
5. **Implementar logs de auditoria**

---

**📅 Data de Criação:** 17/09/2025  
**🔧 Desenvolvido por:** GitHub Copilot Assistant  
**📝 Status:** Implementação Backend Completa - Frontend Pendente