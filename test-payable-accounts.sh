#!/bin/bash

# =====================================================
# 🧪 Script de Teste - Sistema de Contas a Pagar
# =====================================================

BASE_URL="http://localhost:5001"
API_URL="$BASE_URL/admin/payable-accounts"

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}\n"
}

# Verificar se o servidor está rodando
print_header "Verificando Servidor"
if curl -s "$BASE_URL/health" > /dev/null; then
  print_success "Servidor está rodando"
else
  print_error "Servidor não está respondendo em $BASE_URL"
  exit 1
fi

# =====================================================
# TESTE 1: Dashboard
# =====================================================
print_header "TESTE 1: Dashboard"
print_info "GET $API_URL/dashboard"

DASHBOARD=$(curl -s "$API_URL/dashboard")
echo "$DASHBOARD" | jq '.'

if echo "$DASHBOARD" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Dashboard carregado com sucesso"
else
  print_error "Falha ao carregar dashboard"
fi

# =====================================================
# TESTE 2: Criar Conta Manualmente
# =====================================================
print_header "TESTE 2: Criar Conta Manualmente"
print_info "POST $API_URL"

CREATE_RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "invoice_number": "TEST-'$(date +%s)'",
    "description": "Teste - Conta criada via script",
    "reference_month": "'$(date +%Y-%m)'",
    "gross_amount": 1000.00,
    "discounts": 50.00,
    "fees": 125.00,
    "net_amount": 825.00,
    "issue_date": "'$(date +%Y-%m-%d)'",
    "due_date": "'$(date -v+30d +%Y-%m-%d 2>/dev/null || date -d "+30 days" +%Y-%m-%d)'",
    "notes": "Conta de teste criada automaticamente"
  }')

echo "$CREATE_RESPONSE" | jq '.'

if echo "$CREATE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  ACCOUNT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.id')
  print_success "Conta criada com sucesso (ID: $ACCOUNT_ID)"
else
  print_error "Falha ao criar conta"
  ACCOUNT_ID=1 # Usar ID 1 como fallback
fi

# =====================================================
# TESTE 3: Buscar Conta por ID
# =====================================================
print_header "TESTE 3: Buscar Conta por ID"
print_info "GET $API_URL/$ACCOUNT_ID"

GET_RESPONSE=$(curl -s "$API_URL/$ACCOUNT_ID")
echo "$GET_RESPONSE" | jq '.'

if echo "$GET_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Conta encontrada"
else
  print_error "Conta não encontrada"
fi

# =====================================================
# TESTE 4: Listar Contas
# =====================================================
print_header "TESTE 4: Listar Contas"
print_info "GET $API_URL?limit=5"

LIST_RESPONSE=$(curl -s "$API_URL?limit=5&include_summary=true")
echo "$LIST_RESPONSE" | jq '.'

if echo "$LIST_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOTAL=$(echo "$LIST_RESPONSE" | jq -r '.total')
  print_success "Contas listadas com sucesso (Total: $TOTAL)"
else
  print_error "Falha ao listar contas"
fi

# =====================================================
# TESTE 5: Listar Contas Pendentes
# =====================================================
print_header "TESTE 5: Listar Contas Pendentes"
print_info "GET $API_URL?status=pending&limit=5"

PENDING_RESPONSE=$(curl -s "$API_URL?status=pending&limit=5")
echo "$PENDING_RESPONSE" | jq '.'

PENDING_COUNT=$(echo "$PENDING_RESPONSE" | jq -r '.total')
print_info "Contas pendentes encontradas: $PENDING_COUNT"

# =====================================================
# TESTE 6: Atualizar Conta
# =====================================================
print_header "TESTE 6: Atualizar Conta"
print_info "PUT $API_URL/$ACCOUNT_ID"

UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/$ACCOUNT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Conta atualizada via script de teste em '$(date)'"
  }')

echo "$UPDATE_RESPONSE" | jq '.'

if echo "$UPDATE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Conta atualizada com sucesso"
else
  print_error "Falha ao atualizar conta"
fi

# =====================================================
# TESTE 7: Aprovar Conta
# =====================================================
print_header "TESTE 7: Aprovar Conta"
print_info "POST $API_URL/$ACCOUNT_ID/approve"

APPROVE_RESPONSE=$(curl -s -X POST "$API_URL/$ACCOUNT_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{
    "approved_by": 1
  }')

echo "$APPROVE_RESPONSE" | jq '.'

if echo "$APPROVE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Conta aprovada com sucesso"
else
  print_error "Falha ao aprovar conta (pode já estar aprovada)"
fi

# =====================================================
# TESTE 8: Registrar Pagamento
# =====================================================
print_header "TESTE 8: Registrar Pagamento"
print_info "POST $API_URL/$ACCOUNT_ID/payment"

PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/$ACCOUNT_ID/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_date": "'$(date +%Y-%m-%d)'",
    "payment_method": "pix",
    "paid_by": 1,
    "notes": "Pagamento de teste via script"
  }')

echo "$PAYMENT_RESPONSE" | jq '.'

if echo "$PAYMENT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Pagamento registrado com sucesso"
else
  print_error "Falha ao registrar pagamento (pode já estar pago ou não aprovado)"
fi

# =====================================================
# TESTE 9: Listar Contas Vencidas
# =====================================================
print_header "TESTE 9: Listar Contas Vencidas"
print_info "GET $API_URL?overdue_only=true"

OVERDUE_RESPONSE=$(curl -s "$API_URL?overdue_only=true")
echo "$OVERDUE_RESPONSE" | jq '.'

OVERDUE_COUNT=$(echo "$OVERDUE_RESPONSE" | jq -r '.total')
print_info "Contas vencidas encontradas: $OVERDUE_COUNT"

# =====================================================
# TESTE 10: Atualizar Contas Vencidas
# =====================================================
print_header "TESTE 10: Atualizar Status de Contas Vencidas"
print_info "POST $API_URL/update-overdue"

OVERDUE_UPDATE=$(curl -s -X POST "$API_URL/update-overdue")
echo "$OVERDUE_UPDATE" | jq '.'

if echo "$OVERDUE_UPDATE" | jq -e '.success' > /dev/null 2>&1; then
  UPDATED_COUNT=$(echo "$OVERDUE_UPDATE" | jq -r '.updated_count')
  print_success "Contas vencidas atualizadas: $UPDATED_COUNT"
else
  print_error "Falha ao atualizar contas vencidas"
fi

# =====================================================
# TESTE 11: Resumo Financeiro
# =====================================================
print_header "TESTE 11: Resumo Financeiro"
print_info "GET $API_URL/summary"

SUMMARY_RESPONSE=$(curl -s "$API_URL/summary")
echo "$SUMMARY_RESPONSE" | jq '.'

if echo "$SUMMARY_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TOTAL_AMOUNT=$(echo "$SUMMARY_RESPONSE" | jq -r '.data.total_net_amount')
  print_success "Resumo financeiro gerado (Total: R$ $TOTAL_AMOUNT)"
else
  print_error "Falha ao gerar resumo"
fi

# =====================================================
# TESTE 12: Gerar Conta Automaticamente
# =====================================================
print_header "TESTE 12: Gerar Conta Automaticamente"
print_info "POST $API_URL/auto-generate"

AUTO_RESPONSE=$(curl -s -X POST "$API_URL/auto-generate" \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "reference_month": "'$(date +%Y-%m)'",
    "payment_report_period": "monthly"
  }')

echo "$AUTO_RESPONSE" | jq '.'

if echo "$AUTO_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  print_success "Conta gerada automaticamente"
else
  print_error "Falha ao gerar conta automaticamente (pode não haver dados de vendas)"
fi

# =====================================================
# TESTE 13: Aprovação em Lote
# =====================================================
print_header "TESTE 13: Aprovação em Lote"
print_info "POST $API_URL/bulk-approve"

# Buscar IDs de contas pendentes
PENDING_IDS=$(curl -s "$API_URL?status=pending&limit=5" | jq -r '[.data[].id] | @json')

if [ "$PENDING_IDS" != "[]" ] && [ "$PENDING_IDS" != "null" ]; then
  BULK_APPROVE_RESPONSE=$(curl -s -X POST "$API_URL/bulk-approve" \
    -H "Content-Type: application/json" \
    -d "{
      \"account_ids\": $PENDING_IDS,
      \"approved_by\": 1
    }")

  echo "$BULK_APPROVE_RESPONSE" | jq '.'

  if echo "$BULK_APPROVE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    APPROVED=$(echo "$BULK_APPROVE_RESPONSE" | jq -r '.approved_count')
    print_success "Aprovação em lote concluída: $APPROVED contas"
  else
    print_error "Falha na aprovação em lote"
  fi
else
  print_info "Não há contas pendentes para aprovar"
fi

# =====================================================
# TESTE 14: Pagamento em Lote
# =====================================================
print_header "TESTE 14: Pagamento em Lote"
print_info "POST $API_URL/bulk-payment"

# Buscar IDs de contas aprovadas
APPROVED_IDS=$(curl -s "$API_URL?status=approved&limit=3" | jq -r '[.data[].id] | @json')

if [ "$APPROVED_IDS" != "[]" ] && [ "$APPROVED_IDS" != "null" ]; then
  BULK_PAYMENT_RESPONSE=$(curl -s -X POST "$API_URL/bulk-payment" \
    -H "Content-Type: application/json" \
    -d "{
      \"account_ids\": $APPROVED_IDS,
      \"payment_date\": \"$(date +%Y-%m-%d)\",
      \"payment_method\": \"pix\",
      \"paid_by\": 1,
      \"notes\": \"Pagamento em lote via script de teste\"
    }")

  echo "$BULK_PAYMENT_RESPONSE" | jq '.'

  if echo "$BULK_PAYMENT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
    PAID=$(echo "$BULK_PAYMENT_RESPONSE" | jq -r '.paid_count')
    print_success "Pagamento em lote concluído: $PAID contas"
  else
    print_error "Falha no pagamento em lote"
  fi
else
  print_info "Não há contas aprovadas para pagar"
fi

# =====================================================
# RESUMO FINAL
# =====================================================
print_header "RESUMO FINAL"

FINAL_DASHBOARD=$(curl -s "$API_URL/dashboard")
echo "$FINAL_DASHBOARD" | jq '.data.summary'

print_success "Todos os testes concluídos!"
print_info "Consulte a documentação completa em: docs/PAYABLE_ACCOUNTS_SYSTEM.md"

echo ""
