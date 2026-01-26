# 📧 API de Notificação Manual de Empréstimos

## Visão Geral

Este documento especifica o endpoint para envio de notificações push manuais para usuários sobre empréstimos, especialmente para casos de inadimplência e atrasos de pagamento.

---

## Endpoint

### Enviar Notificação Manual

**POST** `/wallet/v1/loan/send-notification`

Envia uma notificação push personalizada para o usuário sobre seu empréstimo.

#### Autenticação
- **Obrigatória:** Sim
- **Tipo:** Bearer Token
- **Header:** `Authorization: Bearer {token}`
- **Permissão:** Admin/Staff apenas

#### Request Body

```json
{
  "loanRequestId": "string",
  "title": "string",
  "message": "string",
  "sentBy": "string"
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `loanRequestId` | string | Sim | ID da solicitação de empréstimo |
| `title` | string | Sim | Título da notificação (3-100 caracteres) |
| `message` | string | Sim | Corpo da mensagem (10-500 caracteres) |
| `sentBy` | string | Sim | ID do usuário admin que enviou a notificação |

#### Validações

- **title:**
  - Mínimo: 3 caracteres
  - Máximo: 100 caracteres
  - Obrigatório

- **message:**
  - Mínimo: 10 caracteres
  - Máximo: 500 caracteres
  - Obrigatório

- **loanRequestId:**
  - Deve existir no banco de dados
  - Obrigatório

- **sentBy:**
  - Deve ser um usuário admin válido
  - Obtido do token JWT
  - Obrigatório

#### Response - Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Notificação enviada com sucesso",
  "data": {
    "notificationId": "string",
    "loanRequestId": "string",
    "userId": "string",
    "title": "string",
    "message": "string",
    "sentBy": "string",
    "sentAt": "2026-01-20T15:30:00.000Z",
    "deliveryStatus": "sent" // "sent" | "delivered" | "failed"
  }
}
```

#### Response - Erro (400 Bad Request)

```json
{
  "success": false,
  "error": "Título deve ter no mínimo 3 caracteres",
  "code": "VALIDATION_ERROR"
}
```

#### Response - Erro (404 Not Found)

```json
{
  "success": false,
  "error": "Empréstimo não encontrado",
  "code": "LOAN_NOT_FOUND"
}
```

#### Response - Erro (401 Unauthorized)

```json
{
  "success": false,
  "error": "Usuário não autenticado",
  "code": "UNAUTHORIZED"
}
```

#### Response - Erro (403 Forbidden)

```json
{
  "success": false,
  "error": "Usuário não tem permissão para enviar notificações",
  "code": "FORBIDDEN"
}
```

#### Response - Erro (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Erro ao enviar notificação via serviço de push",
  "code": "NOTIFICATION_SERVICE_ERROR"
}
```

---

## Fluxo de Funcionamento

### 1. Frontend Calcula Dados de Atraso

O frontend identifica automaticamente:
- **Parcelas em atraso:** Compara `dueDate < hoje` e `paymentDate === null`
- **Valor total em atraso:** Soma dos valores de todas as parcelas atrasadas
- **Dias de atraso:** Maior diferença entre hoje e a data de vencimento

### 2. Frontend Gera Mensagem Padrão

Mensagem automática gerada pelo frontend:

```
Olá {Nome}! Identificamos que seu empréstimo está em atraso há {X} dias, 
no valor de R$ {valor}. Informamos que, ao atingir 30 dias de inadimplência, 
o débito poderá ser encaminhado para Serasa e SPC, além da incidência de 
juros diários. Para evitar encargos e restrições, entre em contato 
imediatamente pelo chat do aplicativo Villa Market e regularize sua situação.
```

### 3. Admin Pode Editar Título e Mensagem

O admin pode:
- Editar o título da notificação
- Editar a mensagem completa
- Gerar novamente a mensagem padrão usando o botão "Gerar Mensagem Automática"

### 4. Backend Processa e Envia

O backend deve:
1. Validar os dados recebidos
2. Verificar se o empréstimo existe
3. Verificar se o usuário tem permissão (admin)
4. Buscar o `userId` associado ao `loanRequestId`
5. Enviar notificação push via serviço (Firebase, OneSignal, etc.)
6. Registrar log da notificação enviada
7. Retornar confirmação

---

## Casos de Uso

### Caso 1: Notificação de Inadimplência

**Cenário:** Cliente com parcela de R$ 150,00 atrasada há 5 dias

**Request:**
```json
{
  "loanRequestId": "loan_123456",
  "title": "Empréstimo em Atraso",
  "message": "Olá João! Identificamos que seu empréstimo está em atraso há 5 dias, no valor de R$ 150,00. Informamos que, ao atingir 30 dias de inadimplência, o débito poderá ser encaminhado para Serasa e SPC, além da incidência de juros diários. Para evitar encargos e restrições, entre em contato imediatamente pelo chat do aplicativo Villa Market e regularize sua situação.",
  "sentBy": "admin_789"
}
```

### Caso 2: Notificação de Vencimento Próximo

**Cenário:** Lembrete de parcela que vence em 3 dias

**Request:**
```json
{
  "loanRequestId": "loan_123456",
  "title": "Lembrete de Vencimento",
  "message": "Olá Maria! Sua parcela de R$ 200,00 vence em 3 dias (23/01/2026). Para evitar juros e multas, realize o pagamento até a data de vencimento. Use o código de barras disponível no app.",
  "sentBy": "admin_789"
}
```

### Caso 3: Notificação de Contato Urgente

**Cenário:** Admin precisa que cliente entre em contato

**Request:**
```json
{
  "loanRequestId": "loan_123456",
  "title": "Contato Urgente",
  "message": "Olá Carlos! Precisamos falar com você sobre seu empréstimo. Por favor, entre em contato conosco pelo chat do aplicativo Villa Market ou ligue para (11) 1234-5678.",
  "sentBy": "admin_789"
}
```

---

## Modelo de Dados Sugerido

### Tabela: `loan_notifications`

```sql
CREATE TABLE loan_notifications (
  id VARCHAR(36) PRIMARY KEY,
  loan_request_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  sent_by VARCHAR(36) NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivery_status ENUM('sent', 'delivered', 'failed', 'read') DEFAULT 'sent',
  delivery_error TEXT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (loan_request_id) REFERENCES loan_requests(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (sent_by) REFERENCES users(id),
  
  INDEX idx_loan_request (loan_request_id),
  INDEX idx_user (user_id),
  INDEX idx_sent_at (sent_at)
);
```

---

## Integração com Serviços de Push

### Firebase Cloud Messaging (FCM)

```javascript
const admin = require('firebase-admin');

async function sendPushNotification(userId, title, message) {
  // Buscar token FCM do usuário
  const userToken = await getUserFCMToken(userId);
  
  if (!userToken) {
    throw new Error('Token FCM não encontrado para o usuário');
  }
  
  const notification = {
    notification: {
      title: title,
      body: message,
    },
    data: {
      type: 'loan_notification',
      click_action: 'OPEN_LOANS_SCREEN'
    },
    token: userToken
  };
  
  const response = await admin.messaging().send(notification);
  return response;
}
```

### OneSignal

```javascript
const OneSignal = require('onesignal-node');

async function sendPushNotification(userId, title, message) {
  const client = new OneSignal.Client({
    userAuthKey: 'YOUR_USER_AUTH_KEY',
    app: { appAuthKey: 'YOUR_APP_AUTH_KEY', appId: 'YOUR_APP_ID' }
  });
  
  const notification = {
    contents: { en: message, pt: message },
    headings: { en: title, pt: title },
    filters: [
      { field: 'tag', key: 'user_id', relation: '=', value: userId }
    ],
    data: { type: 'loan_notification' }
  };
  
  const response = await client.createNotification(notification);
  return response;
}
```

---

## Exemplo de Implementação Backend (Node.js/Express)

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { sendPushNotification } = require('../services/push-notification');
const db = require('../database');

router.post('/wallet/v1/loan/send-notification', 
  authenticateToken, 
  requireAdmin,
  async (req, res) => {
    try {
      const { loanRequestId, title, message, sentBy } = req.body;
      
      // Validação
      if (!loanRequestId || !title || !message || !sentBy) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios não preenchidos',
          code: 'VALIDATION_ERROR'
        });
      }
      
      if (title.length < 3 || title.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Título deve ter entre 3 e 100 caracteres',
          code: 'VALIDATION_ERROR'
        });
      }
      
      if (message.length < 10 || message.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Mensagem deve ter entre 10 e 500 caracteres',
          code: 'VALIDATION_ERROR'
        });
      }
      
      // Buscar empréstimo e userId
      const loan = await db.query(
        'SELECT user_id FROM loan_requests WHERE id = ?',
        [loanRequestId]
      );
      
      if (!loan || loan.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Empréstimo não encontrado',
          code: 'LOAN_NOT_FOUND'
        });
      }
      
      const userId = loan[0].user_id;
      
      // Enviar notificação push
      let deliveryStatus = 'sent';
      let deliveryError = null;
      
      try {
        await sendPushNotification(userId, title, message);
        deliveryStatus = 'delivered';
      } catch (pushError) {
        console.error('Erro ao enviar push:', pushError);
        deliveryStatus = 'failed';
        deliveryError = pushError.message;
      }
      
      // Registrar notificação no banco
      const notificationId = generateUUID();
      await db.query(`
        INSERT INTO loan_notifications 
        (id, loan_request_id, user_id, title, message, sent_by, delivery_status, delivery_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        notificationId,
        loanRequestId,
        userId,
        title,
        message,
        sentBy,
        deliveryStatus,
        deliveryError
      ]);
      
      // Retornar sucesso
      return res.status(200).json({
        success: true,
        message: 'Notificação enviada com sucesso',
        data: {
          notificationId,
          loanRequestId,
          userId,
          title,
          message,
          sentBy,
          sentAt: new Date().toISOString(),
          deliveryStatus
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar notificação:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao processar notificação',
        code: 'INTERNAL_ERROR'
      });
    }
  }
);

module.exports = router;
```

---

## Testes Recomendados

### Teste 1: Envio Bem-Sucedido

```bash
curl -X POST http://localhost:3000/wallet/v1/loan/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "loanRequestId": "loan_123",
    "title": "Empréstimo em Atraso",
    "message": "Olá João! Seu empréstimo está em atraso há 5 dias...",
    "sentBy": "admin_789"
  }'
```

**Esperado:** Status 200, notificação enviada

### Teste 2: Validação de Título Curto

```bash
curl -X POST http://localhost:3000/wallet/v1/loan/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "loanRequestId": "loan_123",
    "title": "Oi",
    "message": "Mensagem válida com mais de 10 caracteres",
    "sentBy": "admin_789"
  }'
```

**Esperado:** Status 400, erro de validação

### Teste 3: Empréstimo Inexistente

```bash
curl -X POST http://localhost:3000/wallet/v1/loan/send-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "loanRequestId": "loan_nao_existe",
    "title": "Título Válido",
    "message": "Mensagem válida com mais de 10 caracteres",
    "sentBy": "admin_789"
  }'
```

**Esperado:** Status 404, empréstimo não encontrado

### Teste 4: Sem Autenticação

```bash
curl -X POST http://localhost:3000/wallet/v1/loan/send-notification \
  -H "Content-Type: application/json" \
  -d '{
    "loanRequestId": "loan_123",
    "title": "Título Válido",
    "message": "Mensagem válida com mais de 10 caracteres",
    "sentBy": "admin_789"
  }'
```

**Esperado:** Status 401, não autenticado

---

## Considerações de Segurança

1. **Autenticação Obrigatória:** Apenas admins podem enviar notificações
2. **Rate Limiting:** Implementar limite de notificações por minuto/hora
3. **Validação de Conteúdo:** Prevenir spam e conteúdo malicioso
4. **Auditoria:** Registrar todas as notificações enviadas com timestamp
5. **GDPR/LGPD:** Respeitar preferências de notificação do usuário
6. **Sanitização:** Limpar HTML/scripts da mensagem antes de enviar

---

## Métricas e Monitoramento

### Métricas Importantes

- Taxa de entrega de notificações (delivered/sent)
- Taxa de abertura/leitura
- Taxa de falha no envio
- Tempo médio de resposta do serviço de push
- Número de notificações por empréstimo
- Número de notificações por admin

### Logs Recomendados

```javascript
{
  "timestamp": "2026-01-20T15:30:00.000Z",
  "event": "loan_notification_sent",
  "loanRequestId": "loan_123",
  "userId": "user_456",
  "sentBy": "admin_789",
  "deliveryStatus": "delivered",
  "responseTime": "350ms"
}
```

---

## Changelog

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-01-20 | Especificação inicial do endpoint |

---

## Contato

Para dúvidas sobre esta especificação, entre em contato com a equipe de desenvolvimento frontend.
