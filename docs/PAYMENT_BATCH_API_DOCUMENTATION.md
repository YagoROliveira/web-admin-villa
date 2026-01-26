# Payment Batch System - API Documentation

## Overview

Sistema de gestão de lotes de pagamento para processamento de repasses aos lojistas. Permite criar lotes de pagamento por período, carregar pedidos automaticamente, adicionar ajustes manuais (bônus, descontos, taxas), fazer upload de comprovantes e gerenciar o fluxo de aprovação e pagamento.

**Base URL:** `https://prod.villamarket.app/admin/stores/:storeId/payment-batches`

---

## Data Models

### PaymentBatch

```typescript
{
  id: number
  store_id: number
  period_type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual' | 'custom'
  start_date: string  // ISO 8601 format (YYYY-MM-DD)
  end_date: string    // ISO 8601 format (YYYY-MM-DD)
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled'
  total_amount: number  // Valor total do lote em centavos ou decimal
  notes?: string        // Observações gerais do lote
  created_at: string    // ISO 8601 timestamp
  updated_at: string    // ISO 8601 timestamp
  approved_at?: string  // ISO 8601 timestamp
  paid_at?: string      // ISO 8601 timestamp
  items: PaymentItem[]
  proofs: PaymentProof[]
  timeline: PaymentTimelineEvent[]
}
```

### PaymentItem

```typescript
{
  id: number
  payment_batch_id: number
  type: 'order' | 'adjustment' | 'bonus' | 'discount' | 'other'
  reference_id?: string  // ID do pedido se type='order', ou referência externa
  description: string    // Descrição do item
  amount: number        // Valor em centavos ou decimal (positivo ou negativo)
  notes?: string        // Observações específicas do item
  created_at: string
  updated_at: string
}
```

### PaymentProof

```typescript
{
  id: number
  payment_batch_id: number
  file_name: string       // Nome original do arquivo
  file_path: string       // Caminho/URL do arquivo no storage
  file_size: number       // Tamanho em bytes
  file_type: string       // MIME type (application/pdf, image/jpeg, etc)
  uploaded_by: number     // ID do usuário que fez upload
  uploaded_at: string     // ISO 8601 timestamp
}
```

### PaymentTimelineEvent

```typescript
{
  id: number
  payment_batch_id: number
  event_type: 'created' | 'status_changed' | 'proof_uploaded' | 'item_added' | 'item_removed' | 'approved' | 'paid' | 'cancelled'
  old_status?: string
  new_status?: string
  description: string     // Descrição legível do evento
  user_id?: number       // ID do usuário que gerou o evento
  user_name?: string     // Nome do usuário (para exibição)
  created_at: string     // ISO 8601 timestamp
  metadata?: object      // Dados adicionais do evento (JSON)
}
```

---

## API Endpoints

### 1. List Payment Batches

Retorna todos os lotes de pagamento de uma loja, com opção de filtros.

**Endpoint:** `GET /admin/stores/:storeId/payment-batches`

**Query Parameters:**
- `status` (optional): Filtrar por status (draft, pending_approval, approved, processing, paid, failed, cancelled)
- `period_type` (optional): Filtrar por tipo de período (daily, weekly, monthly, etc)
- `start_date` (optional): Data inicial para filtrar (YYYY-MM-DD)
- `end_date` (optional): Data final para filtrar (YYYY-MM-DD)
- `page` (optional): Número da página (default: 1)
- `limit` (optional): Items por página (default: 20)

**Response 200:**
```json
{
  "batches": [
    {
      "id": 1,
      "store_id": 123,
      "period_type": "weekly",
      "start_date": "2026-01-13",
      "end_date": "2026-01-19",
      "status": "paid",
      "total_amount": 245000,
      "notes": "Pagamento semanal - 3ª semana jan/2026",
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-21T15:45:00Z",
      "approved_at": "2026-01-21T11:00:00Z",
      "paid_at": "2026-01-21T15:45:00Z",
      "items_count": 8,
      "proofs_count": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "total_pages": 1
  },
  "stats": {
    "total_batches": 15,
    "paid_count": 10,
    "pending_count": 3,
    "total_amount_paid": 3250000
  }
}
```

**Response 404:**
```json
{
  "error": "Store not found"
}
```

---

### 2. Get Payment Batch Details

Retorna os detalhes completos de um lote de pagamento, incluindo items, comprovantes e timeline.

**Endpoint:** `GET /admin/stores/:storeId/payment-batches/:batchId`

**Response 200:**
```json
{
  "id": 1,
  "store_id": 123,
  "period_type": "weekly",
  "start_date": "2026-01-13",
  "end_date": "2026-01-19",
  "status": "paid",
  "total_amount": 245000,
  "notes": "Pagamento semanal - 3ª semana jan/2026",
  "created_at": "2026-01-20T10:30:00Z",
  "updated_at": "2026-01-21T15:45:00Z",
  "approved_at": "2026-01-21T11:00:00Z",
  "paid_at": "2026-01-21T15:45:00Z",
  "items": [
    {
      "id": 1,
      "payment_batch_id": 1,
      "type": "order",
      "reference_id": "ORD-12345",
      "description": "Pedido #12345 - João Silva",
      "amount": 45000,
      "notes": null,
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T10:30:00Z"
    },
    {
      "id": 2,
      "payment_batch_id": 1,
      "type": "bonus",
      "reference_id": null,
      "description": "Bônus por desempenho - Meta atingida",
      "amount": 10000,
      "notes": "Meta de 100 pedidos alcançada",
      "created_at": "2026-01-20T10:35:00Z",
      "updated_at": "2026-01-20T10:35:00Z"
    }
  ],
  "proofs": [
    {
      "id": 1,
      "payment_batch_id": 1,
      "file_name": "comprovante_transferencia_123.pdf",
      "file_path": "https://storage.villamarket.app/payment-proofs/123/comprovante_transferencia_123.pdf",
      "file_size": 245678,
      "file_type": "application/pdf",
      "uploaded_by": 456,
      "uploaded_at": "2026-01-21T15:30:00Z"
    }
  ],
  "timeline": [
    {
      "id": 1,
      "payment_batch_id": 1,
      "event_type": "created",
      "description": "Lote de pagamento criado",
      "user_id": 456,
      "user_name": "Admin User",
      "created_at": "2026-01-20T10:30:00Z"
    },
    {
      "id": 2,
      "payment_batch_id": 1,
      "event_type": "status_changed",
      "old_status": "draft",
      "new_status": "pending_approval",
      "description": "Status alterado para 'Aguardando Aprovação'",
      "user_id": 456,
      "user_name": "Admin User",
      "created_at": "2026-01-20T14:20:00Z"
    },
    {
      "id": 3,
      "payment_batch_id": 1,
      "event_type": "approved",
      "old_status": "pending_approval",
      "new_status": "approved",
      "description": "Lote aprovado para pagamento",
      "user_id": 789,
      "user_name": "Finance Manager",
      "created_at": "2026-01-21T11:00:00Z"
    },
    {
      "id": 4,
      "payment_batch_id": 1,
      "event_type": "proof_uploaded",
      "description": "Comprovante de pagamento enviado: comprovante_transferencia_123.pdf",
      "user_id": 789,
      "user_name": "Finance Manager",
      "created_at": "2026-01-21T15:30:00Z"
    },
    {
      "id": 5,
      "payment_batch_id": 1,
      "event_type": "paid",
      "old_status": "processing",
      "new_status": "paid",
      "description": "Pagamento confirmado e concluído",
      "user_id": 789,
      "user_name": "Finance Manager",
      "created_at": "2026-01-21T15:45:00Z"
    }
  ]
}
```

**Response 404:**
```json
{
  "error": "Payment batch not found"
}
```

---

### 3. Create Payment Batch

Cria um novo lote de pagamento. Pode ser criado vazio (para adicionar items depois) ou com items pré-carregados.

**Endpoint:** `POST /admin/stores/:storeId/payment-batches`

**Request Body:**
```json
{
  "period_type": "weekly",
  "start_date": "2026-01-20",
  "end_date": "2026-01-26",
  "notes": "Pagamento semanal - 4ª semana jan/2026",
  "items": [
    {
      "type": "order",
      "reference_id": "ORD-54321",
      "description": "Pedido #54321 - Maria Santos",
      "amount": 35000,
      "notes": null
    },
    {
      "type": "bonus",
      "reference_id": null,
      "description": "Bônus por avaliações positivas",
      "amount": 5000,
      "notes": "95% de avaliações 5 estrelas"
    }
  ]
}
```

**Response 201:**
```json
{
  "id": 2,
  "store_id": 123,
  "period_type": "weekly",
  "start_date": "2026-01-20",
  "end_date": "2026-01-26",
  "status": "draft",
  "total_amount": 40000,
  "notes": "Pagamento semanal - 4ª semana jan/2026",
  "created_at": "2026-01-22T09:15:00Z",
  "updated_at": "2026-01-22T09:15:00Z",
  "items": [
    {
      "id": 10,
      "payment_batch_id": 2,
      "type": "order",
      "reference_id": "ORD-54321",
      "description": "Pedido #54321 - Maria Santos",
      "amount": 35000,
      "notes": null,
      "created_at": "2026-01-22T09:15:00Z",
      "updated_at": "2026-01-22T09:15:00Z"
    },
    {
      "id": 11,
      "payment_batch_id": 2,
      "type": "bonus",
      "reference_id": null,
      "description": "Bônus por avaliações positivas",
      "amount": 5000,
      "notes": "95% de avaliações 5 estrelas",
      "created_at": "2026-01-22T09:15:00Z",
      "updated_at": "2026-01-22T09:15:00Z"
    }
  ],
  "proofs": [],
  "timeline": [
    {
      "id": 20,
      "payment_batch_id": 2,
      "event_type": "created",
      "description": "Lote de pagamento criado",
      "user_id": 456,
      "user_name": "Admin User",
      "created_at": "2026-01-22T09:15:00Z"
    }
  ]
}
```

**Response 400:**
```json
{
  "error": "Invalid request data",
  "details": {
    "start_date": "Start date is required",
    "end_date": "End date must be after start date"
  }
}
```

---

### 4. Update Payment Batch

Atualiza dados gerais de um lote de pagamento (período, datas, notas). Não atualiza status nem items.

**Endpoint:** `PATCH /admin/stores/:storeId/payment-batches/:batchId`

**Request Body:**
```json
{
  "period_type": "custom",
  "start_date": "2026-01-20",
  "end_date": "2026-01-27",
  "notes": "Período estendido por um dia adicional"
}
```

**Response 200:**
```json
{
  "id": 2,
  "store_id": 123,
  "period_type": "custom",
  "start_date": "2026-01-20",
  "end_date": "2026-01-27",
  "status": "draft",
  "total_amount": 40000,
  "notes": "Período estendido por um dia adicional",
  "created_at": "2026-01-22T09:15:00Z",
  "updated_at": "2026-01-22T10:00:00Z"
}
```

**Response 400:**
```json
{
  "error": "Cannot update batch in current status",
  "message": "Only draft batches can be edited"
}
```

---

### 5. Update Batch Status

Atualiza o status do lote de pagamento (workflow de aprovação/pagamento).

**Endpoint:** `POST /admin/stores/:storeId/payment-batches/:batchId/status`

**Request Body:**
```json
{
  "status": "pending_approval",
  "notes": "Enviado para aprovação do financeiro"
}
```

**Valid Status Transitions:**
- `draft` → `pending_approval`
- `pending_approval` → `approved` | `draft` (reject)
- `approved` → `processing`
- `processing` → `paid` | `failed`
- Any status → `cancelled` (admin only)

**Response 200:**
```json
{
  "id": 2,
  "store_id": 123,
  "status": "pending_approval",
  "updated_at": "2026-01-22T11:30:00Z",
  "timeline_event": {
    "id": 21,
    "event_type": "status_changed",
    "old_status": "draft",
    "new_status": "pending_approval",
    "description": "Status alterado para 'Aguardando Aprovação'",
    "user_id": 456,
    "user_name": "Admin User",
    "created_at": "2026-01-22T11:30:00Z"
  }
}
```

**Response 400:**
```json
{
  "error": "Invalid status transition",
  "message": "Cannot change from 'paid' to 'draft'"
}
```

---

### 6. Add Item to Batch

Adiciona um item ao lote de pagamento (ajustes manuais, bônus, descontos).

**Endpoint:** `POST /admin/stores/:storeId/payment-batches/:batchId/items`

**Request Body:**
```json
{
  "type": "discount",
  "reference_id": null,
  "description": "Desconto por atraso na entrega - Pedido #12345",
  "amount": -2000,
  "notes": "Compensação ao cliente aplicada"
}
```

**Response 201:**
```json
{
  "id": 12,
  "payment_batch_id": 2,
  "type": "discount",
  "reference_id": null,
  "description": "Desconto por atraso na entrega - Pedido #12345",
  "amount": -2000,
  "notes": "Compensação ao cliente aplicada",
  "created_at": "2026-01-22T12:00:00Z",
  "updated_at": "2026-01-22T12:00:00Z"
}
```

**Response 400:**
```json
{
  "error": "Cannot add items to batch in current status",
  "message": "Only draft batches can have items added"
}
```

---

### 7. Update Item

Atualiza um item específico do lote.

**Endpoint:** `PATCH /admin/stores/:storeId/payment-batches/:batchId/items/:itemId`

**Request Body:**
```json
{
  "description": "Desconto por atraso - Pedido #12345 (corrigido)",
  "amount": -1500,
  "notes": "Valor recalculado após negociação"
}
```

**Response 200:**
```json
{
  "id": 12,
  "payment_batch_id": 2,
  "type": "discount",
  "reference_id": null,
  "description": "Desconto por atraso - Pedido #12345 (corrigido)",
  "amount": -1500,
  "notes": "Valor recalculado após negociação",
  "created_at": "2026-01-22T12:00:00Z",
  "updated_at": "2026-01-22T12:30:00Z"
}
```

---

### 8. Delete Item

Remove um item do lote de pagamento.

**Endpoint:** `DELETE /admin/stores/:storeId/payment-batches/:batchId/items/:itemId`

**Response 204:** (No content)

**Response 400:**
```json
{
  "error": "Cannot delete items from batch in current status",
  "message": "Only draft batches can have items removed"
}
```

---

### 9. Upload Payment Proof

Faz upload de comprovante de pagamento (PDF, imagem).

**Endpoint:** `POST /admin/stores/:storeId/payment-batches/:batchId/proofs`

**Request:** `multipart/form-data`
- `file`: Arquivo (PDF, JPEG, PNG, até 10MB)

**Response 201:**
```json
{
  "id": 2,
  "payment_batch_id": 2,
  "file_name": "comprovante_pix_123456.pdf",
  "file_path": "https://storage.villamarket.app/payment-proofs/123/comprovante_pix_123456.pdf",
  "file_size": 156789,
  "file_type": "application/pdf",
  "uploaded_by": 789,
  "uploaded_at": "2026-01-22T16:00:00Z"
}
```

**Response 400:**
```json
{
  "error": "Invalid file",
  "message": "File size exceeds 10MB limit"
}
```

**Response 415:**
```json
{
  "error": "Unsupported file type",
  "message": "Only PDF, JPEG, and PNG files are allowed"
}
```

---

### 10. Delete Payment Proof

Remove um comprovante de pagamento.

**Endpoint:** `DELETE /admin/stores/:storeId/payment-batches/:batchId/proofs/:proofId`

**Response 204:** (No content)

---

### 11. Delete Payment Batch

Deleta um lote de pagamento. Somente lotes em status `draft` ou `cancelled` podem ser deletados.

**Endpoint:** `DELETE /admin/stores/:storeId/payment-batches/:batchId`

**Response 204:** (No content)

**Response 400:**
```json
{
  "error": "Cannot delete batch in current status",
  "message": "Only draft or cancelled batches can be deleted"
}
```

---

### 12. Get Orders for Period (Helper Endpoint)

Retorna pedidos elegíveis para um período específico, com custos calculados. Usado para carregar automaticamente pedidos ao criar lote.

**Endpoint:** `GET /admin/stores/:storeId/orders/costs`

**Query Parameters:**
- `start_date` (required): Data início (YYYY-MM-DD)
- `end_date` (required): Data fim (YYYY-MM-DD)
- `status` (optional): Filtrar por status (default: completed, delivered)

**Response 200:**
```json
{
  "orders": [
    {
      "order_id": "ORD-54321",
      "customer_name": "Maria Santos",
      "order_date": "2026-01-21T14:30:00Z",
      "status": "delivered",
      "subtotal": 45000,
      "discounts": 5000,
      "platform_fee": 4000,
      "card_fee": 1000,
      "net_amount": 35000,
      "payment_method": "digital_payment"
    },
    {
      "order_id": "ORD-54322",
      "customer_name": "João Silva",
      "order_date": "2026-01-21T16:45:00Z",
      "status": "delivered",
      "subtotal": 28000,
      "discounts": 0,
      "platform_fee": 2800,
      "card_fee": 800,
      "net_amount": 24400,
      "payment_method": "digital_payment"
    }
  ],
  "summary": {
    "total_orders": 2,
    "total_gross": 73000,
    "total_discounts": 5000,
    "total_fees": 8600,
    "total_net": 59400
  }
}
```

---

## Business Rules

### Status Workflow

1. **draft**: Lote criado, pode ser editado livremente
   - Permitido: Adicionar/remover/editar items, alterar período/datas, alterar notas
   - Próximo status: `pending_approval`, `cancelled`

2. **pending_approval**: Aguardando aprovação do financeiro
   - Permitido: Apenas visualizar, aprovar ou rejeitar (volta para draft)
   - Próximo status: `approved`, `draft`, `cancelled`

3. **approved**: Aprovado, aguardando processamento
   - Permitido: Iniciar processamento, cancelar
   - Próximo status: `processing`, `cancelled`

4. **processing**: Pagamento em processamento
   - Permitido: Upload de comprovantes, finalizar ou marcar como falha
   - Próximo status: `paid`, `failed`

5. **paid**: Pagamento concluído e confirmado
   - Permitido: Apenas visualizar
   - Status final

6. **failed**: Pagamento falhou
   - Permitido: Tentar novamente (volta para approved), cancelar
   - Próximo status: `approved`, `cancelled`

7. **cancelled**: Lote cancelado
   - Permitido: Apenas visualizar, deletar
   - Status final

### Item Types

- **order**: Pedido do período (carregado automaticamente, não editável)
- **adjustment**: Ajuste manual (correção de valor)
- **bonus**: Bônus/incentivo adicional
- **discount**: Desconto/penalidade
- **other**: Outros tipos não categorizados

### File Upload Rules

- **Formatos permitidos**: PDF, JPEG, PNG
- **Tamanho máximo**: 10MB por arquivo
- **Múltiplos arquivos**: Permitido (comprovantes parciais, recibos, etc)
- **Storage**: S3 ou storage equivalente
- **Naming**: `payment-proofs/{store_id}/{batch_id}/{timestamp}_{original_name}`

### Permissions

- **Admin**: Full access (CRUD tudo)
- **Finance Manager**: Aprovar, processar, fazer upload de comprovantes, marcar como pago
- **Store Owner**: Visualizar seus próprios lotes, criar rascunhos
- **Store Manager**: Mesmo que Store Owner

### Validation Rules

1. **Datas:**
   - `end_date` deve ser maior que `start_date`
   - Não pode criar lote com período sobreposto para mesma loja (opcional, configurable)

2. **Items:**
   - `amount` pode ser negativo (descontos)
   - Items do tipo `order` não podem ser editados após criação
   - Lote deve ter pelo menos 1 item antes de enviar para aprovação

3. **Status transitions:**
   - Validar transições permitidas (ver workflow acima)
   - Não pode voltar de `paid` para outro status

4. **Comprovantes:**
   - Deve ter pelo menos 1 comprovante antes de marcar como `paid`
   - Validar tipo e tamanho do arquivo

### Notifications (opcional)

- Lote criado → Notificar financeiro
- Lote aprovado → Notificar lojista
- Pagamento concluído → Notificar lojista (email + push)
- Pagamento falhou → Notificar financeiro e lojista

---

## Database Schema Suggestions

### Table: payment_batches

```sql
CREATE TABLE payment_batches (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'annual', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'paid', 'failed', 'cancelled')),
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by BIGINT REFERENCES users(id),
  paid_at TIMESTAMP,
  paid_by BIGINT REFERENCES users(id),
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_payment_batches_store_id ON payment_batches(store_id);
CREATE INDEX idx_payment_batches_status ON payment_batches(status);
CREATE INDEX idx_payment_batches_dates ON payment_batches(start_date, end_date);
```

### Table: payment_items

```sql
CREATE TABLE payment_items (
  id BIGSERIAL PRIMARY KEY,
  payment_batch_id BIGINT NOT NULL REFERENCES payment_batches(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('order', 'adjustment', 'bonus', 'discount', 'other')),
  reference_id VARCHAR(100),
  description TEXT NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_items_batch_id ON payment_items(payment_batch_id);
CREATE INDEX idx_payment_items_type ON payment_items(type);
CREATE INDEX idx_payment_items_reference_id ON payment_items(reference_id);
```

### Table: payment_proofs

```sql
CREATE TABLE payment_proofs (
  id BIGSERIAL PRIMARY KEY,
  payment_batch_id BIGINT NOT NULL REFERENCES payment_batches(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_by BIGINT NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_proofs_batch_id ON payment_proofs(payment_batch_id);
```

### Table: payment_timeline_events

```sql
CREATE TABLE payment_timeline_events (
  id BIGSERIAL PRIMARY KEY,
  payment_batch_id BIGINT NOT NULL REFERENCES payment_batches(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('created', 'status_changed', 'proof_uploaded', 'item_added', 'item_removed', 'approved', 'paid', 'cancelled')),
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  description TEXT NOT NULL,
  user_id BIGINT REFERENCES users(id),
  user_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_timeline_batch_id ON payment_timeline_events(payment_batch_id);
CREATE INDEX idx_payment_timeline_created_at ON payment_timeline_events(created_at);
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid request data | Dados de request inválidos |
| 400 | Invalid status transition | Transição de status não permitida |
| 400 | Cannot add items to batch in current status | Não pode adicionar items neste status |
| 400 | Cannot delete batch in current status | Não pode deletar lote neste status |
| 400 | Invalid file | Arquivo inválido (tamanho, tipo) |
| 401 | Unauthorized | Usuário não autenticado |
| 403 | Forbidden | Usuário sem permissão para esta operação |
| 404 | Store not found | Loja não encontrada |
| 404 | Payment batch not found | Lote de pagamento não encontrado |
| 404 | Item not found | Item não encontrado |
| 404 | Proof not found | Comprovante não encontrado |
| 415 | Unsupported file type | Tipo de arquivo não suportado |
| 500 | Internal server error | Erro interno do servidor |

---

## Testing Recommendations

### Unit Tests
- Validação de transições de status
- Cálculo de total_amount baseado em items
- Validação de datas (end_date >= start_date)
- Validação de tipos de arquivos

### Integration Tests
- Criar lote → Adicionar items → Aprovar → Processar → Pagar (fluxo completo)
- Upload de arquivo e verificação de storage
- Listagem com filtros e paginação
- Timeline events gerados automaticamente

### Edge Cases
- Tentar editar lote já pago
- Tentar deletar lote com status não permitido
- Upload de arquivo muito grande
- Transição de status inválida
- Adicionar item duplicado (mesmo reference_id)

---

## Migration Path

Se já existe sistema de pagamento anterior:

1. **Criar tabelas novas** sem afetar existentes
2. **Migrar dados históricos**: Converter pagamentos antigos para PaymentBatch format
3. **Dual-write period**: Escrever em ambos sistemas durante transição
4. **Validação**: Comparar resultados entre sistemas
5. **Cutover**: Desativar sistema antigo, usar apenas novo

---

## Future Enhancements

- **Webhooks**: Notificar sistemas externos sobre mudanças de status
- **Bulk operations**: Aprovar/processar múltiplos lotes de uma vez
- **Scheduled payments**: Agendar pagamentos automáticos por período
- **Split payments**: Dividir pagamento em múltiplas transferências
- **Reconciliation**: Reconciliar pagamentos com extrato bancário
- **Audit log**: Log detalhado de todas operações para compliance
- **Export**: Exportar relatórios em PDF/Excel
- **Analytics**: Dashboard com métricas de pagamentos (tempo médio, valor médio, etc)

---

**Version:** 1.0.0  
**Last Updated:** January 22, 2026  
**Contact:** development@villamarket.app
