# 🚀 Guia Rápido - Deploy no Portainer

## Método 1: Stack via Portainer (Mais Fácil)

### Passo 1: Acesse o Portainer
```
http://seu-servidor-portainer:9000
```

### Passo 2: Criar Stack
1. Vá em **Stacks** no menu lateral
2. Clique em **+ Add stack**
3. Nome: `villa-admin`
4. Build method: **Web editor**

### Passo 3: Cole o Docker Compose
```yaml
version: '3.8'

services:
  villa-admin:
    container_name: villa-admin
    image: ghcr.io/yagoroliveira/villa-admin:latest  # OU build local
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    networks:
      - villa-network
    labels:
      - "com.villa.description=Villa Market Admin Panel"
      - "com.villa.version=2.1.0"

networks:
  villa-network:
    driver: bridge
```

### Passo 4: Deploy
1. Clique em **Deploy the stack**
2. Aguarde o download da imagem e inicialização
3. Acesse: `http://seu-servidor:8080`

---

## Método 2: Build Local + Push para Registry

### Passo 1: Build da Imagem
```bash
# No seu computador local
docker build -t villa-admin:latest .
```

### Passo 2: Tag para Registry
```bash
# Se usar Docker Hub
docker tag villa-admin:latest seu-usuario/villa-admin:latest

# Se usar GitHub Container Registry
docker tag villa-admin:latest ghcr.io/yagoroliveira/villa-admin:latest

# Se usar registry privado
docker tag villa-admin:latest registry.villamarket.app/villa-admin:latest
```

### Passo 3: Push
```bash
# Login no registry
docker login

# Push da imagem
docker push seu-usuario/villa-admin:latest
```

### Passo 4: Deploy no Portainer
1. Acesse Portainer
2. Vá em **Stacks** → **+ Add stack**
3. Cole o docker-compose.yml ajustando a imagem:
```yaml
image: seu-usuario/villa-admin:latest
```
4. Deploy!

---

## Método 3: Git Repository (Automático)

### Passo 1: Push para Git
```bash
git add Dockerfile docker-compose.yml nginx.conf .dockerignore
git commit -m "Add Docker configuration"
git push origin main
```

### Passo 2: Stack via Git no Portainer
1. Acesse Portainer → **Stacks** → **+ Add stack**
2. Build method: **Repository**
3. Configure:
   - **Repository URL**: `https://github.com/YagoROliveira/web-admin-villa`
   - **Repository reference**: `refs/heads/main`
   - **Compose path**: `docker-compose.yml`
4. (Opcional) Adicione credenciais se repo privado
5. Clique em **Deploy the stack**

### Passo 3: Webhook para Auto-Deploy (Opcional)
1. Na stack, vá em **Service webhook**
2. Copie o webhook URL
3. Configure no GitHub:
   - Settings → Webhooks → Add webhook
   - Payload URL: (cole o webhook do Portainer)
   - Content type: `application/json`
   - Events: `Just the push event`

Agora a cada push no GitHub, o Portainer atualiza automaticamente!

---

## Método 4: Upload Manual de Imagem

### Passo 1: Exportar Imagem
```bash
# Build
docker build -t villa-admin:latest .

# Salvar em arquivo
docker save villa-admin:latest -o villa-admin.tar
```

### Passo 2: Upload no Portainer
1. Acesse Portainer → **Images**
2. Clique em **Import**
3. Selecione o arquivo `villa-admin.tar`
4. Aguarde o upload

### Passo 3: Criar Container
1. Vá em **Containers** → **+ Add container**
2. Configure:
   - **Name**: `villa-admin`
   - **Image**: `villa-admin:latest`
   - **Port mapping**: `8080:80`
   - **Restart policy**: `Unless stopped`
3. Deploy!

---

## 🔧 Configurações Adicionais

### Reverse Proxy (Traefik/Nginx)

Se usar Traefik, adicione labels no docker-compose.yml:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.villa-admin.rule=Host(`admin.villamarket.app`)"
  - "traefik.http.routers.villa-admin.entrypoints=websecure"
  - "traefik.http.services.villa-admin.loadbalancer.server.port=80"
  - "traefik.http.routers.villa-admin.tls=true"
  - "traefik.http.routers.villa-admin.tls.certresolver=letsencrypt"
```

### Volumes Persistentes (se necessário)

Para logs ou dados:
```yaml
volumes:
  - villa-admin-logs:/var/log/nginx
```

### Variáveis de Ambiente

Adicione no Portainer ao criar a stack:
```yaml
environment:
  - NODE_ENV=production
  - VITE_API_BASE_URL=https://prod.villamarket.app
```

---

## 📊 Monitoramento no Portainer

### Ver Logs
1. Vá em **Containers**
2. Clique em `villa-admin`
3. Aba **Logs**

### Ver Recursos
1. Clique no container
2. Aba **Stats** para ver CPU/RAM

### Health Check
- Status aparece na lista de containers
- Verde = Healthy
- Amarelo = Starting
- Vermelho = Unhealthy

---

## 🔄 Atualizar Aplicação

### Via Stack
1. Edite a stack
2. Clique em **Update the stack**
3. Marque **Pull and redeploy**

### Via Webhook
1. Apenas faça push no GitHub
2. Webhook atualiza automaticamente

### Manual
1. Pull nova imagem: `docker pull sua-imagem:latest`
2. No Portainer: **Recreate** o container

---

## ✅ Checklist de Deploy

- [ ] Dockerfile criado
- [ ] nginx.conf configurado
- [ ] docker-compose.yml ajustado
- [ ] .dockerignore adicionado
- [ ] Build local testado
- [ ] Portas corretas configuradas
- [ ] API URL configurada
- [ ] Stack criada no Portainer
- [ ] Container rodando (healthy)
- [ ] Aplicação acessível no navegador
- [ ] Logs verificados (sem erros)

---

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs
docker logs villa-admin

# Verificar se porta está livre
netstat -tulpn | grep 8080
```

### Imagem não encontrada
- Verificar se fez push corretamente
- Verificar autenticação no registry
- Tentar pull manual: `docker pull sua-imagem`

### Erro 502 Bad Gateway
- Verificar se container está rodando
- Verificar health check
- Ver logs do nginx

---

## 📞 Recursos

- **Portainer Docs**: https://docs.portainer.io/
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/

---

## 🎉 Pronto!

Seu painel administrativo está rodando no Portainer! 🚀

Acesse: `http://seu-servidor:8080`
