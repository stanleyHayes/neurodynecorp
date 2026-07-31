.PHONY: all dev infra stop server web client admin mobile clean

# ========================================
# Infrastructure
# ========================================

infra:
	docker compose up -d

infra-down:
	docker compose down

infra-clean:
	docker compose down -v

# ========================================
# Backend (Go API)
# ========================================

# ========================================
# Proto Generation
# ========================================

# ========================================
# Frontend Apps
# ========================================

web:
	pnpm --filter @neurodyne/web dev

web-build:
	pnpm --filter @neurodyne/web build

client:
	pnpm --filter @neurodyne/client dev

client-build:
	pnpm --filter @neurodyne/client build

admin:
	pnpm --filter @neurodyne/admin dev

admin-build:
	pnpm --filter @neurodyne/admin build

mobile:
	cd apps/mobile && npx expo start

# ========================================
# Backend (TypeScript Server)
# ========================================

server:
	pnpm --filter @neurodyne/server dev

server-build:
	pnpm --filter @neurodyne/server build

server-test:
	pnpm --filter @neurodyne/server test

# ========================================
# Full Development
# ========================================

dev: infra
	@echo "Starting all services..."
	@make -j4 server web client admin

install:
	pnpm install

build: web-build client-build admin-build server-build

lint:
	pnpm -r lint

clean:
	rm -rf apps/web/dist
	rm -rf apps/client/dist
	rm -rf apps/admin/dist
	rm -rf node_modules
	rm -rf apps/*/node_modules

# ========================================
# Help
# ========================================

help:
	@echo "NeuroDyne Corp - Development Commands"
	@echo ""
	@echo "  make infra         - Start infrastructure (MongoDB, Redis, Kafka, Prometheus, Grafana)"
	@echo "  make infra-down    - Stop infrastructure"
	@echo "  make api           - Run Go API server"
	@echo "  make web           - Run marketing website dev server"
	@echo "  make client        - Run client dashboard dev server"
	@echo "  make admin         - Run admin dashboard dev server"
	@echo "  make mobile        - Run React Native mobile app"
	@echo "  make dev           - Start everything (infra + all services)"
	@echo "  make install       - Install all dependencies"
	@echo "  make build         - Build all apps"
	@echo "  make proto         - Generate protobuf code"
	@echo "  make clean         - Clean build artifacts"
