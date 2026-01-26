/**
 * 🔧 Exemplo de Integração das Rotas de Contas a Pagar
 * 
 * Este arquivo mostra como integrar as rotas do sistema de contas a pagar
 * no seu servidor Express/Node.js
 */

import express from 'express';
import 'reflect-metadata'; // Necessário para TypeDI

// Importar rotas
import payableAccountRoutes from './routes/payableAccountRoutes';
// ... outras rotas existentes

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (se necessário)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ======================================
// ROTAS
// ======================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Suas rotas existentes
// app.use('/admin/stores', storePaymentRoutes);
// app.use('/admin/users', userRoutes);
// ... etc

// ✅ NOVA ROTA: Gestão de Contas a Pagar
app.use('/admin/payable-accounts', payableAccountRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro na aplicação:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/admin/payable-accounts/dashboard`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
