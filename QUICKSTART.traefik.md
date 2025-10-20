# 🚀 Quick Start - Deploy com Traefik

## Configuração Rápida

### 1. Verificar Rede do Traefik
```bash
docker network create traefik-public  # Se não existir
```

### 2. Configurar Domínio
Edite `docker-compose.yml` linha 23 e 28:
```yaml
Host(`seu-dominio.com`)  # Altere admin.villamarket.app para seu domínio
```

### 3. Deploy
```bash
# Build
docker build -t villa-admin:latest .

# Iniciar
docker-compose up -d

# Ver logs
docker logs -f villa-admin
```

### 4. Acessar
```
https://seu-dominio.com
```

## ⚡ Configuração Atual

- **Porta Interna**: 8000
- **Rede**: traefik-public (externa)
- **SSL**: Automático via Let's Encrypt
- **HTTP → HTTPS**: Redirecionamento automático
- **Health Check**: Ativo

## 📝 Arquivos Importantes

- `docker-compose.yml` - Config principal (com Traefik labels)
- `docker-compose.env.yml` - Config com variáveis de ambiente
- `.env.docker` - Variáveis de configuração
- `Dockerfile` - Porta 8000
- `nginx.conf` - Nginx escutando porta 8000

## 🔧 Comandos Úteis

```bash
# Script de deploy
./deploy.sh deploy

# Ver status
docker ps | grep villa-admin

# Ver logs
docker logs -f villa-admin

# Reiniciar
docker-compose restart

# Parar
docker-compose down

# Rebuild
./deploy.sh rebuild
```

## ✅ Checklist

- [ ] Traefik rodando
- [ ] Rede `traefik-public` existe
- [ ] DNS configurado
- [ ] Domínio alterado no docker-compose.yml
- [ ] Build: `docker build -t villa-admin:latest .`
- [ ] Deploy: `docker-compose up -d`
- [ ] Acesso HTTPS funcionando

## 📚 Documentação Completa

Veja `README.traefik.md` para documentação completa.
