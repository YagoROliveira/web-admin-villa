# 🚀 Deploy com Traefik

Guia completo para fazer deploy do Villa Market Admin usando Docker e Traefik como reverse proxy.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Traefik já configurado e rodando no servidor
- Domínio apontando para o servidor (ex: `admin.villamarket.app`)
- Rede Docker do Traefik criada (padrão: `traefik-public`)

## 🔧 Configuração

### 1. Verificar Rede do Traefik

Certifique-se de que a rede do Traefik existe:

```bash
docker network ls | grep traefik
```

Se não existir, crie:

```bash
docker network create traefik-public
```

### 2. Configurar Domínio

Edite o `docker-compose.yml` e altere o domínio:

```yaml
- "traefik.http.routers.villa-admin.rule=Host(`seu-dominio.com`)"
- "traefik.http.routers.villa-admin-http.rule=Host(`seu-dominio.com`)"
```

Ou use o `.env.docker`:

```bash
cp .env.docker .env
nano .env  # Edite DOMAIN=seu-dominio.com
```

E use o `docker-compose.env.yml`:

```bash
docker-compose -f docker-compose.env.yml up -d
```

## 🚀 Deploy

### Método 1: Deploy Direto

```bash
# Build da imagem
docker build -t villa-admin:latest .

# Subir o container
docker-compose up -d

# Ver logs
docker-compose logs -f villa-admin
```

### Método 2: Usando Script de Deploy

```bash
# Dar permissão de execução
chmod +x deploy.sh

# Deploy completo
./deploy.sh deploy
```

### Método 3: Com Variáveis de Ambiente

```bash
# Configurar variáveis
cp .env.docker .env
nano .env

# Deploy
docker-compose -f docker-compose.env.yml up -d
```

## 📊 Configuração do Traefik

O `docker-compose.yml` já inclui todas as labels necessárias do Traefik:

### Labels Configuradas

```yaml
# Habilitar Traefik
traefik.enable=true

# HTTP → HTTPS redirect
traefik.http.routers.villa-admin-http.rule=Host(`admin.villamarket.app`)
traefik.http.routers.villa-admin-http.entrypoints=web
traefik.http.routers.villa-admin-http.middlewares=redirect-to-https

# HTTPS
traefik.http.routers.villa-admin.rule=Host(`admin.villamarket.app`)
traefik.http.routers.villa-admin.entrypoints=websecure
traefik.http.routers.villa-admin.tls=true
traefik.http.routers.villa-admin.tls.certresolver=letsencrypt

# Porta do container
traefik.http.services.villa-admin.loadbalancer.server.port=8000
```

### Requisitos do Traefik

Seu `traefik.yml` deve ter:

```yaml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: seu-email@example.com
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
```

## 🔍 Verificação

### 1. Verificar Container

```bash
# Status
docker ps | grep villa-admin

# Logs
docker logs villa-admin -f

# Health check
docker inspect villa-admin | grep -A 5 Health
```

### 2. Verificar Traefik Dashboard

Acesse o dashboard do Traefik e verifique:
- Router HTTP: `villa-admin-http@docker`
- Router HTTPS: `villa-admin@docker`
- Service: `villa-admin@docker`

### 3. Testar Acesso

```bash
# Teste HTTP (deve redirecionar para HTTPS)
curl -I http://admin.villamarket.app

# Teste HTTPS
curl -I https://admin.villamarket.app
```

## 🔄 Atualização

### Atualizar para Nova Versão

```bash
# Parar container
docker-compose down

# Build nova versão
docker build -t villa-admin:latest .

# Subir novamente
docker-compose up -d
```

Ou usando o script:

```bash
./deploy.sh rebuild
```

### Zero Downtime Update (usando Portainer ou Swarm)

```bash
# Build e tag nova versão
docker build -t villa-admin:2.1.1 .

# Atualizar no Portainer ou manualmente
docker service update --image villa-admin:2.1.1 villa-admin
```

## ⚙️ Configurações Avançadas

### 1. Múltiplos Domínios

```yaml
- "traefik.http.routers.villa-admin.rule=Host(`admin.villamarket.app`) || Host(`painel.villamarket.app`)"
```

### 2. Basic Auth (Proteção Adicional)

Criar senha:

```bash
htpasswd -nb admin senha123 | sed -e s/\\$/\\$\\$/g
```

Adicionar label:

```yaml
- "traefik.http.routers.villa-admin.middlewares=admin-auth"
- "traefik.http.middlewares.admin-auth.basicauth.users=admin:$$apr1$$..."
```

### 3. Rate Limiting

```yaml
- "traefik.http.middlewares.rate-limit.ratelimit.average=100"
- "traefik.http.middlewares.rate-limit.ratelimit.burst=50"
- "traefik.http.routers.villa-admin.middlewares=rate-limit"
```

### 4. Compression

```yaml
- "traefik.http.middlewares.compress.compress=true"
- "traefik.http.routers.villa-admin.middlewares=compress"
```

### 5. Custom Headers

```yaml
- "traefik.http.middlewares.security-headers.headers.customResponseHeaders.X-Custom-Header=Value"
- "traefik.http.routers.villa-admin.middlewares=security-headers"
```

## 📁 Estrutura de Arquivos

```
.
├── Dockerfile                   # Imagem Docker otimizada
├── nginx.conf                   # Configuração Nginx (porta 8000)
├── docker-compose.yml           # Compose com labels Traefik
├── docker-compose.env.yml       # Compose com variáveis
├── .env.docker                  # Variáveis de ambiente
├── deploy.sh                    # Script de deploy
├── .dockerignore               # Arquivos ignorados no build
└── README.traefik.md           # Esta documentação
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker logs villa-admin --tail 100

# Verificar configuração Nginx
docker exec villa-admin nginx -t
```

### Traefik não roteia

```bash
# Verificar labels
docker inspect villa-admin | grep traefik

# Verificar rede
docker network inspect traefik-public

# Ver logs do Traefik
docker logs traefik -f | grep villa-admin
```

### Certificado SSL não gerado

```bash
# Verificar cert resolver
docker logs traefik | grep letsencrypt

# Verificar DNS
nslookup admin.villamarket.app

# Verificar acme.json
docker exec traefik cat /letsencrypt/acme.json
```

### Porta 8000 não responde

```bash
# Testar dentro do container
docker exec villa-admin wget -O- http://localhost:8000

# Verificar se Nginx está rodando
docker exec villa-admin ps aux | grep nginx
```

## 🔒 Segurança

### 1. Certificados SSL

O Traefik gerencia automaticamente os certificados Let's Encrypt.

### 2. Headers de Segurança

Já configurados no `nginx.conf`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

### 3. Rate Limiting

Configure no Traefik para prevenir DDoS.

### 4. Firewall

```bash
# Permitir apenas 80, 443 e SSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 📊 Monitoramento

### Logs

```bash
# Logs do container
docker logs -f villa-admin

# Logs do Nginx
docker exec villa-admin tail -f /var/log/nginx/access.log

# Logs do Traefik
docker logs -f traefik
```

### Métricas

Se tiver Prometheus configurado:

```yaml
- "traefik.http.routers.villa-admin.service=villa-admin"
- "traefik.http.services.villa-admin.loadbalancer.healthcheck.path=/"
```

## 🎯 Checklist de Deploy

- [ ] Traefik configurado e rodando
- [ ] Rede `traefik-public` criada
- [ ] DNS apontando para o servidor
- [ ] Domínio configurado no docker-compose.yml
- [ ] Build da imagem: `docker build -t villa-admin:latest .`
- [ ] Deploy: `docker-compose up -d`
- [ ] Container rodando: `docker ps | grep villa-admin`
- [ ] Health check OK: `docker inspect villa-admin`
- [ ] Acesso HTTP funciona (redireciona HTTPS)
- [ ] Acesso HTTPS funciona
- [ ] Certificado SSL válido
- [ ] Aplicação carrega corretamente

## 📞 Suporte

- **Documentação Traefik**: https://doc.traefik.io/traefik/
- **Docker Compose**: https://docs.docker.com/compose/
- **Nginx**: https://nginx.org/en/docs/

## 🎉 Deploy Concluído!

Sua aplicação está rodando em: **https://admin.villamarket.app**

### Comandos Úteis

```bash
# Ver status
docker ps

# Ver logs
docker logs -f villa-admin

# Reiniciar
docker-compose restart

# Parar
docker-compose down

# Atualizar
./deploy.sh rebuild

# Ver recursos
docker stats villa-admin
```
