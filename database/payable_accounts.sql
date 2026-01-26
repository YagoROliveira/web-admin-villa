-- =====================================================
-- 💰 Sistema de Gestão de Contas a Pagar
-- Tabela: payable_accounts
-- =====================================================

CREATE TABLE IF NOT EXISTS `payable_accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `store_id` INT(11) NOT NULL,
  
  -- Informações da Conta
  `invoice_number` VARCHAR(100) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `reference_month` VARCHAR(7) NOT NULL COMMENT 'Formato: YYYY-MM',
  
  -- Valores
  `gross_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor bruto (vendas)',
  `discounts` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Descontos totais',
  `fees` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Taxas (plataforma + cartão)',
  `net_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Valor líquido a pagar',
  
  -- Datas
  `issue_date` DATE NOT NULL COMMENT 'Data de emissão',
  `due_date` DATE NOT NULL COMMENT 'Data de vencimento',
  `payment_date` DATE DEFAULT NULL COMMENT 'Data do pagamento efetivo',
  
  -- Status
  `status` ENUM('pending', 'approved', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT NULL COMMENT 'pix, ted, boleto, etc',
  
  -- Controle de Aprovação
  `approved_by` INT(11) DEFAULT NULL COMMENT 'ID do admin que aprovou',
  `approved_at` DATETIME DEFAULT NULL,
  
  -- Controle de Pagamento
  `paid_by` INT(11) DEFAULT NULL COMMENT 'ID do admin que confirmou pagamento',
  `paid_at` DATETIME DEFAULT NULL,
  
  -- Observações
  `notes` TEXT DEFAULT NULL,
  
  -- Timestamps
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  
  -- Índices
  KEY `idx_store_id` (`store_id`),
  KEY `idx_status` (`status`),
  KEY `idx_reference_month` (`reference_month`),
  KEY `idx_due_date` (`due_date`),
  KEY `idx_payment_date` (`payment_date`),
  KEY `idx_created_at` (`created_at`),
  
  -- Índice composto para consultas frequentes
  KEY `idx_store_status` (`store_id`, `status`),
  KEY `idx_status_due_date` (`status`, `due_date`),
  
  -- Chave estrangeira
  CONSTRAINT `fk_payable_accounts_store` 
    FOREIGN KEY (`store_id`) 
    REFERENCES `stores` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Dados de Exemplo (Opcional - para testes)
-- =====================================================

-- Exemplo 1: Conta Pendente
INSERT INTO `payable_accounts` (
  `store_id`, `invoice_number`, `description`, `reference_month`,
  `gross_amount`, `discounts`, `fees`, `net_amount`,
  `issue_date`, `due_date`, `status`, `notes`
) VALUES (
  1, 'FAT-2026-01-001', 'Repasse Mensal - Janeiro 2026', '2026-01',
  5000.00, 350.00, 625.00, 4025.00,
  '2026-01-21', '2026-02-20', 'pending', 
  'Aguardando aprovação para pagamento'
);

-- Exemplo 2: Conta Aprovada
INSERT INTO `payable_accounts` (
  `store_id`, `invoice_number`, `description`, `reference_month`,
  `gross_amount`, `discounts`, `fees`, `net_amount`,
  `issue_date`, `due_date`, `status`, `approved_by`, `approved_at`, `notes`
) VALUES (
  2, 'FAT-2026-01-002', 'Repasse Semanal - Semana 3', '2026-01',
  1200.00, 80.00, 150.00, 970.00,
  '2026-01-15', '2026-02-10', 'approved', 
  1, '2026-01-16 10:30:00', 'Aprovado para pagamento'
);

-- Exemplo 3: Conta Paga
INSERT INTO `payable_accounts` (
  `store_id`, `invoice_number`, `description`, `reference_month`,
  `gross_amount`, `discounts`, `fees`, `net_amount`,
  `issue_date`, `due_date`, `payment_date`, `status`, 
  `payment_method`, `approved_by`, `approved_at`, `paid_by`, `paid_at`, `notes`
) VALUES (
  3, 'FAT-2025-12-001', 'Repasse Mensal - Dezembro 2025', '2025-12',
  8500.00, 600.00, 1065.00, 6835.00,
  '2025-12-20', '2026-01-20', '2026-01-18', 'paid',
  'pix', 1, '2025-12-21 14:00:00', 1, '2026-01-18 09:15:00', 
  'Pago via PIX - Chave: fornecedor@example.com'
);

-- =====================================================
-- Views úteis
-- =====================================================

-- View: Contas Vencidas
CREATE OR REPLACE VIEW vw_overdue_accounts AS
SELECT 
  pa.*,
  s.name as store_name,
  s.email as store_email,
  s.phone as store_phone,
  DATEDIFF(CURDATE(), pa.due_date) as days_overdue
FROM payable_accounts pa
JOIN stores s ON pa.store_id = s.id
WHERE pa.status IN ('pending', 'approved', 'overdue')
  AND pa.due_date < CURDATE()
ORDER BY pa.due_date ASC;

-- View: Resumo por Loja
CREATE OR REPLACE VIEW vw_payable_summary_by_store AS
SELECT 
  s.id as store_id,
  s.name as store_name,
  COUNT(pa.id) as total_accounts,
  SUM(CASE WHEN pa.status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  SUM(CASE WHEN pa.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN pa.status = 'paid' THEN 1 ELSE 0 END) as paid_count,
  SUM(CASE WHEN pa.status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
  SUM(pa.net_amount) as total_net_amount,
  SUM(CASE WHEN pa.status IN ('pending', 'approved', 'overdue') THEN pa.net_amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN pa.status = 'paid' THEN pa.net_amount ELSE 0 END) as paid_amount
FROM stores s
LEFT JOIN payable_accounts pa ON s.id = pa.store_id
WHERE s.status = 1
GROUP BY s.id, s.name
ORDER BY pending_amount DESC;

-- View: Fluxo de Caixa Mensal
CREATE OR REPLACE VIEW vw_cash_flow_monthly AS
SELECT 
  reference_month,
  COUNT(*) as account_count,
  SUM(gross_amount) as total_gross,
  SUM(discounts) as total_discounts,
  SUM(fees) as total_fees,
  SUM(net_amount) as total_net,
  SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END) as paid_amount,
  SUM(CASE WHEN status IN ('pending', 'approved') THEN net_amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN status = 'overdue' THEN net_amount ELSE 0 END) as overdue_amount
FROM payable_accounts
GROUP BY reference_month
ORDER BY reference_month DESC;

-- =====================================================
-- Triggers úteis
-- =====================================================

-- Trigger: Atualizar status para 'overdue' automaticamente
DELIMITER $$

CREATE TRIGGER before_payable_account_select
BEFORE SELECT ON payable_accounts
FOR EACH ROW
BEGIN
  -- Nota: Este trigger é apenas ilustrativo
  -- Na prática, use um job agendado ou o endpoint /update-overdue
END$$

DELIMITER ;

-- =====================================================
-- Stored Procedures úteis
-- =====================================================

-- Procedure: Atualizar contas vencidas
DELIMITER $$

CREATE PROCEDURE sp_update_overdue_accounts()
BEGIN
  UPDATE payable_accounts
  SET status = 'overdue', updated_at = NOW()
  WHERE due_date < CURDATE()
    AND status IN ('pending', 'approved');
    
  SELECT ROW_COUNT() as updated_count;
END$$

DELIMITER ;

-- Procedure: Obter resumo geral
DELIMITER $$

CREATE PROCEDURE sp_get_payable_summary(
  IN p_store_id INT,
  IN p_reference_month VARCHAR(7)
)
BEGIN
  SELECT 
    COUNT(*) as total_accounts,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
    SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_count,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
    SUM(net_amount) as total_net_amount,
    SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END) as pending_amount,
    SUM(CASE WHEN status = 'approved' THEN net_amount ELSE 0 END) as approved_amount,
    SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0 END) as paid_amount,
    SUM(CASE WHEN status = 'overdue' THEN net_amount ELSE 0 END) as overdue_amount
  FROM payable_accounts
  WHERE (p_store_id IS NULL OR store_id = p_store_id)
    AND (p_reference_month IS NULL OR reference_month = p_reference_month);
END$$

DELIMITER ;

-- =====================================================
-- Exemplos de consultas úteis
-- =====================================================

-- 1. Listar contas vencidas
-- SELECT * FROM vw_overdue_accounts;

-- 2. Resumo por loja
-- SELECT * FROM vw_payable_summary_by_store;

-- 3. Fluxo de caixa mensal
-- SELECT * FROM vw_cash_flow_monthly;

-- 4. Atualizar contas vencidas
-- CALL sp_update_overdue_accounts();

-- 5. Obter resumo de uma loja específica
-- CALL sp_get_payable_summary(1, NULL);

-- 6. Obter resumo de um mês específico
-- CALL sp_get_payable_summary(NULL, '2026-01');
