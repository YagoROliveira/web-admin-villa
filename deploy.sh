#!/bin/bash

# Script de deploy do Villa Market Admin
# Uso: ./deploy.sh [comando]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
IMAGE_NAME="villa-admin"
IMAGE_TAG="latest"
CONTAINER_NAME="villa-admin"
PORT="8080"

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Comandos disponíveis
build() {
    echo "🔨 Building Docker image..."
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    print_success "Image built successfully!"
}

start() {
    echo "🚀 Starting containers..."
    docker-compose up -d
    print_success "Containers started!"
    echo "📱 Application available at: http://localhost:${PORT}"
}

stop() {
    echo "🛑 Stopping containers..."
    docker-compose down
    print_success "Containers stopped!"
}

restart() {
    stop
    start
}

logs() {
    echo "📋 Showing logs..."
    docker-compose logs -f ${CONTAINER_NAME}
}

status() {
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "💾 Resource usage:"
    docker stats ${CONTAINER_NAME} --no-stream
}

clean() {
    echo "🧹 Cleaning up..."
    docker-compose down -v
    docker rmi ${IMAGE_NAME}:${IMAGE_TAG} 2>/dev/null || true
    print_success "Cleanup completed!"
}

rebuild() {
    echo "♻️  Rebuilding..."
    stop
    build
    start
}

deploy() {
    echo "🚀 Deploying to production..."
    
    # Build
    build
    
    # Stop old container if running
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    # Start new container
    start
    
    print_success "Deploy completed!"
}

health() {
    echo "🏥 Checking container health..."
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_NAME} 2>/dev/null || echo "not running")
    
    if [ "$HEALTH" = "healthy" ]; then
        print_success "Container is healthy!"
    elif [ "$HEALTH" = "unhealthy" ]; then
        print_error "Container is unhealthy!"
        exit 1
    elif [ "$HEALTH" = "starting" ]; then
        print_warning "Container is starting..."
    else
        print_error "Container is not running!"
        exit 1
    fi
}

shell() {
    echo "🐚 Opening shell in container..."
    docker exec -it ${CONTAINER_NAME} sh
}

# Menu de ajuda
show_help() {
    cat << EOF
🐳 Villa Market Admin - Docker Deploy Script

Usage: ./deploy.sh [command]

Commands:
    build       Build Docker image
    start       Start containers
    stop        Stop containers
    restart     Restart containers
    logs        Show container logs
    status      Show container status and resource usage
    clean       Stop containers and remove images
    rebuild     Rebuild image and restart containers
    deploy      Full deploy (build + start)
    health      Check container health
    shell       Open shell in container
    help        Show this help message

Examples:
    ./deploy.sh build       # Build the image
    ./deploy.sh start       # Start the application
    ./deploy.sh logs        # Watch logs
    ./deploy.sh deploy      # Full deploy

EOF
}

# Main
case "$1" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    clean)
        clean
        ;;
    rebuild)
        rebuild
        ;;
    deploy)
        deploy
        ;;
    health)
        health
        ;;
    shell)
        shell
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
