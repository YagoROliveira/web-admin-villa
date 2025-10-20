# Estágio 1: Build da aplicação
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
RUN pnpm build

# Estágio 2: Servir a aplicação com serve
FROM node:20-alpine

# Instalar serve globalmente
RUN npm install -g serve

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor porta 8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8000/ || exit 1

# Comando para servir a aplicação na porta 8000
# -s = single page application (todas as rotas retornam index.html)
# -l = porta
CMD ["serve", "-s", "dist", "-l", "8000"]
