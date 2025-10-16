# 🐳 Docker Deploy - Villa Market Admin

Guia completo para fazer deploy do painel administrativo usando Docker e Portainer.

## 📋 Pré-requisitos

- Docker instalado (versão 20.10+)
- Docker Compose instalado (versão 1.29+)
- Portainer configurado (opcional, mas recomendado)
- Acesso ao servidor onde o Portainer está rodando

## 🚀 Deploy Local (Desenvolvimento)

### 1. Build da imagem
```bash
docker build -t villa-admin:latest .
```

### 2. Executar com Docker Compose
```bash
docker-compose up -d
```

### 3. Acessar aplicação
```
http://localhost:8080
```

### 4. Ver logs
```bash
docker-compose logs -f villa-admin
```

### 5. Parar containers
```bash
docker-compose down
```

## 🏢 Deploy no Portainer

### Opção 1: Via Portainer UI (Stack)

1. Acesse o Portainer
2. Vá em **Stacks** → **Add stack**
3. Cole o conteúdo do `docker-compose.yml`
4. Ajuste as portas se necessário
5. Click em **Deploy the stack**

### Opção 2: Via Git Repository

1. Faça commit dos arquivos Docker para o repositório
2. No Portainer, vá em **Stacks** → **Add stack**
3. Selecione **Git Repository**
4. Configure:
   - **Repository URL**: `https://github.com/YagoROliveira/web-admin-villa`
   - **Reference**: `main`
   - **Compose path**: `docker-compose.yml`
5. Click em **Deploy the stack**

### Opção 3: Via Docker Registry

1. Build e push para registry:
```bash
# Tag para seu registry
docker tag villa-admin:latest seu-registry.com/villa-admin:latest

# Push
docker push seu-registry.com/villa-admin:latest
```

2. No Portainer, crie um novo container:
   - **Image**: `seu-registry.com/villa-admin:latest`
   - **Port mapping**: `8080:80`
   - **Restart policy**: `Unless stopped`

## ⚙️ Configurações

### Variáveis de Ambiente

Adicione no `docker-compose.yml` conforme necessário:

```yaml
environment:
  - NODE_ENV=production
  - API_BASE_URL=https://pro.villamarket.app
  - VITE_APP_TITLE=Villa Market Admin
```

### Portas Customizadas

Para alterar a porta exposta, edite no `docker-compose.yml`:

```yaml
ports:
  - "3000:80"  # Usa porta 3000 ao invés de 8080
```

### Reverse Proxy (Nginx/Traefik)

Se usar reverse proxy, adicione labels ao `docker-compose.yml`:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.villa-admin.rule=Host(`admin.villamarket.app`)"
  - "traefik.http.routers.villa-admin.entrypoints=websecure"
  - "traefik.http.routers.villa-admin.tls.certresolver=letsencrypt"
```

## 🔧 Comandos Úteis

### Build apenas
```bash
docker build -t villa-admin:latest .
```

### Executar sem docker-compose
```bash
docker run -d \
  --name villa-admin \
  -p 8080:80 \
  --restart unless-stopped \
  villa-admin:latest
```

### Verificar health
```bash
docker inspect --format='{{.State.Health.Status}}' villa-admin
```

### Acessar shell do container
```bash
docker exec -it villa-admin sh
```

### Ver uso de recursos
```bash
docker stats villa-admin
```

### Atualizar container
```bash
# Parar e remover
docker-compose down

# Pull nova versão (se usar registry)
docker pull seu-registry.com/villa-admin:latest

# Subir novamente
docker-compose up -d
```

## 📊 Monitoramento

### Logs
```bash
# Últimos logs
docker-compose logs --tail=100 villa-admin

# Logs em tempo real
docker-compose logs -f villa-admin

# Logs com timestamp
docker-compose logs -t villa-admin
```

### Health Check
O container possui health check integrado que verifica a cada 30 segundos se a aplicação está respondendo.

Status pode ser visto com:
```bash
docker ps
```

## 🔒 Segurança

### Headers de Segurança
O `nginx.conf` já inclui headers de segurança:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### HTTPS
Para produção, use um reverse proxy com SSL/TLS:
- Traefik com Let's Encrypt
- Nginx Proxy Manager
- Caddy

## 🎯 Otimizações

### Multi-stage Build
O Dockerfile usa multi-stage build para:
- ✅ Imagem final menor (~25MB com Alpine)
- ✅ Apenas arquivos necessários em produção
- ✅ Build cache otimizado

### Nginx
Configurações de performance:
- ✅ Gzip compression habilitado
- ✅ Cache de assets estáticos (1 ano)
- ✅ SPA routing configurado

## 🐛 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker logs villa-admin

# Verificar configuração
docker inspect villa-admin
```

### Porta em uso
```bash
# Verificar o que está usando a porta
lsof -i :8080

# Mudar porta no docker-compose.yml
ports:
  - "8081:80"
```

### Problemas de CORS
- Verificar configuração do proxy no `nginx.conf`
- Ou configurar `BASE_URL` completa no código

### Build falha
```bash
# Limpar cache do Docker
docker builder prune -a

# Build sem cache
docker build --no-cache -t villa-admin:latest .
```

## 📝 Notas

- O container roda em modo produção
- Assets são servidos com cache agressivo
- SPA routing está configurado no Nginx
- Health check monitora disponibilidade
- Logs do Nginx vão para stdout/stderr

## 🎉 Pronto!

Após o deploy, acesse:
- **Local**: http://localhost:8080
- **Produção**: Configure seu domínio no reverse proxy

Para mais informações sobre Portainer:
https://docs.portainer.io/
