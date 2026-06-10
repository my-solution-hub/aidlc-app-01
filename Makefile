# AWSomeShop · 本地全栈一键调试 Makefile
# 用法: make help

# ============ 可配置变量 ============
JAVA_HOME_21 ?= /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
ANDROID_HOME ?= $(HOME)/Library/Android/sdk
MYSQL_CONTAINER ?= mysql84
MYSQL_ROOT_PW ?= aidlc_root_pw
MYSQL_PORT ?= 3306
GATEWAY_PORT ?= 8088
FRONTEND_PORT ?= 5173
# 数据库直连覆盖（local profile 默认指向 3307/root，本机用 3306/aidlc_root_pw）
DB_PW := $(MYSQL_ROOT_PW)

JAVA := $(JAVA_HOME_21)/bin/java
LOG := /tmp/awsome
RUN := /tmp/awsome/pids

# 服务名 -> 端口 / 数据库 / jar 目录
BACKENDS := auth product points order
PORT_auth := 8001
PORT_product := 8002
PORT_points := 8003
PORT_order := 8004
DB_auth := awsome_shop_auth
DB_product := awsome_shop_product
DB_points := awsome_shop_point
DB_order := awsome_shop_order
DIR_auth := awsome-shop-auth-service
DIR_product := awsome-shop-product-service
DIR_points := awsome-shop-points-service
DIR_order := awsome-shop-order-service
JAR_auth := awsome-shop-auth-service-1.0.0-SNAPSHOT.jar
JAR_product := awsome-shop-product-service-1.0.0-SNAPSHOT.jar
JAR_points := awsome-shop-point-service-1.0.0-SNAPSHOT.jar
JAR_order := awsome-shop-order-service-1.0.0-SNAPSHOT.jar

.PHONY: help up down restart status logs \
        infra db redis \
        build build-backend build-frontend \
        start-backend start-gateway start-frontend \
        android-apk android-build clean smoke

# ============ 帮助 ============
help:
	@echo "AWSomeShop 本地调试命令："
	@echo ""
	@echo "  make up              一键启动全栈（建库 + 4后端 + 网关 + 前端）"
	@echo "  make down            停止所有服务进程"
	@echo "  make restart         down + up"
	@echo "  make status          查看各端口/服务状态"
	@echo "  make logs            tail 所有服务日志"
	@echo "  make smoke           冒烟测试（经网关：登录 + 商品列表）"
	@echo ""
	@echo "  make build           编译全部后端 + 前端（生成 fat jar / dist）"
	@echo "  make build-backend   仅打包 4 后端 + 网关 fat jar"
	@echo "  make build-frontend  仅构建前端"
	@echo ""
	@echo "  make infra           确认 MySQL/Redis 就绪并建 4 个库"
	@echo "  make android-apk     编译并打包 Android APK"
	@echo ""
	@echo "  前提：Docker(MySQL/Redis)、JDK21、Node20、Maven 已安装"
	@echo "  访问：前端 http://localhost:$(FRONTEND_PORT)  网关 http://localhost:$(GATEWAY_PORT)"
	@echo "  默认账号：admin / admin123"

# ============ 基础设施 ============
infra: redis db

redis:
	@nc -z localhost 6379 >/dev/null 2>&1 && echo "✅ Redis 6379 就绪" || \
		(echo "❌ Redis 未运行，请启动：docker start gen-redis 或 docker run -d -p 6379:6379 redis" && exit 1)

db:
	@docker exec $(MYSQL_CONTAINER) mysql -uroot -p$(MYSQL_ROOT_PW) -e "\
		CREATE DATABASE IF NOT EXISTS awsome_shop_auth CHARACTER SET utf8mb4; \
		CREATE DATABASE IF NOT EXISTS awsome_shop_product CHARACTER SET utf8mb4; \
		CREATE DATABASE IF NOT EXISTS awsome_shop_point CHARACTER SET utf8mb4; \
		CREATE DATABASE IF NOT EXISTS awsome_shop_order CHARACTER SET utf8mb4;" 2>/dev/null \
		&& echo "✅ 4 个数据库已就绪" \
		|| (echo "❌ MySQL 容器 $(MYSQL_CONTAINER) 未运行，请：docker start $(MYSQL_CONTAINER)" && exit 1)

# ============ 构建 ============
build: build-backend build-frontend

build-backend:
	@echo "==> 打包 4 后端 + 网关 fat jar（Java 21）"
	@for d in $(BACKENDS) gateway; do \
		dir=awsome-shop-$$d-service; \
		[ "$$d" = "points" ] && dir=awsome-shop-points-service; \
		[ "$$d" = "gateway" ] && dir=awsome-shop-gateway-service; \
		echo "  - $$dir"; \
		(cd $$dir && JAVA_HOME=$(JAVA_HOME_21) mvn -q package -DskipTests) || exit 1; \
	done
	@echo "✅ 后端打包完成"

build-frontend:
	@echo "==> 构建前端"
	@cd awsome-shop-frontend && npm install --silent && npm run build
	@echo "✅ 前端构建完成"

# ============ 启动 ============
up: infra start-backend start-gateway start-frontend status
	@echo ""
	@echo "🚀 全栈已启动：前端 http://localhost:$(FRONTEND_PORT)  账号 admin/admin123"

start-backend:
	@mkdir -p $(LOG) $(RUN)
	@echo "==> 启动 4 后端服务"
	@$(MAKE) -s _run NAME=auth
	@$(MAKE) -s _run NAME=product
	@$(MAKE) -s _run NAME=points
	@$(MAKE) -s _run NAME=order
	@echo "   等待后端就绪..."; sleep 45

# 内部：启动单个后端（datasource 覆盖到本机 MySQL）
_run:
	@dir=$(DIR_$(NAME)); jar=$(JAR_$(NAME)); db=$(DB_$(NAME)); \
	nohup $(JAVA) -jar $$dir/bootstrap/target/$$jar \
		--spring.profiles.active=local \
		--spring.datasource.url="jdbc:mysql://localhost:$(MYSQL_PORT)/$$db?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&useSSL=false&allowPublicKeyRetrieval=true" \
		--spring.datasource.password=$(DB_PW) \
		> $(LOG)/$(NAME).log 2>&1 & echo $$! > $(RUN)/$(NAME).pid; \
	echo "  - $(NAME) 启动中 (PID $$(cat $(RUN)/$(NAME).pid), 端口 $(PORT_$(NAME)))"

start-gateway:
	@mkdir -p $(LOG) $(RUN)
	@echo "==> 启动网关 (端口 $(GATEWAY_PORT))"
	@nohup $(JAVA) -jar awsome-shop-gateway-service/bootstrap/target/$(JAR_gateway) \
		--spring.profiles.active=local --server.port=$(GATEWAY_PORT) \
		> $(LOG)/gateway.log 2>&1 & echo $$! > $(RUN)/gateway.pid
	@sleep 30; echo "  - gateway PID $$(cat $(RUN)/gateway.pid)"

JAR_gateway := awsome-shop-gateway-service-1.0.0-SNAPSHOT.jar

start-frontend:
	@echo "==> 启动前端 dev server (端口 $(FRONTEND_PORT)，连网关 $(GATEWAY_PORT))"
	@cd awsome-shop-frontend && \
		VITE_API_BASE_URL=http://localhost:$(GATEWAY_PORT) \
		nohup npx vite --host --port $(FRONTEND_PORT) > $(LOG)/frontend.log 2>&1 & \
		echo $$! > $(RUN)/frontend.pid
	@sleep 8; echo "  - frontend PID $$(cat $(RUN)/frontend.pid)"

# ============ 停止 / 状态 ============
down:
	@echo "==> 停止所有服务"
	@-pkill -f "awsome-shop.*SNAPSHOT.jar" 2>/dev/null || true
	@-pkill -f "vite --host --port $(FRONTEND_PORT)" 2>/dev/null || true
	@-rm -f $(RUN)/*.pid 2>/dev/null || true
	@echo "✅ 已停止"

restart: down up

status:
	@echo "==> 服务状态："
	@for p in "8001 auth" "8002 product" "8003 points" "8004 order" "$(GATEWAY_PORT) gateway" "$(FRONTEND_PORT) frontend"; do \
		port=$${p%% *}; name=$${p##* }; \
		nc -z localhost $$port >/dev/null 2>&1 && echo "  ✅ $$name (:$$port)" || echo "  ❌ $$name (:$$port) 未运行"; \
	done

logs:
	@tail -n 20 -F $(LOG)/*.log

# ============ 冒烟测试 ============
smoke:
	@echo "==> 冒烟测试（经网关 :$(GATEWAY_PORT)）"
	@echo "1) 登录："; \
	curl -s -m8 -X POST http://localhost:$(GATEWAY_PORT)/auth/api/v1/public/auth/login \
		-H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' | head -c 160; echo
	@echo "2) 商品列表："; \
	curl -s -m8 -X POST http://localhost:$(GATEWAY_PORT)/product/api/v1/public/product/list \
		-H "Content-Type: application/json" -d '{"page":1,"size":3}' | head -c 160; echo
	@echo "✅ 冒烟测试完成（详见浏览器 http://localhost:$(FRONTEND_PORT)）"

# ============ Android ============
android-apk:
	@echo "==> 编译 Android APK (绕过系统代理直连)"
	@cd awsome-shop-android && \
		[ -f local.properties ] || echo "sdk.dir=$(ANDROID_HOME)" > local.properties; \
		JAVA_HOME=$(JAVA_HOME_21) ANDROID_HOME=$(ANDROID_HOME) \
		./gradlew :app:assembleDebug \
		-Dhttp.proxyHost= -Dhttps.proxyHost= -Djava.net.useSystemProxies=false
	@echo "✅ APK: awsome-shop-android/app/build/outputs/apk/debug/app-debug.apk"

android-build: android-apk

# ============ 清理 ============
clean: down
	@rm -rf $(LOG) $(RUN)
	@echo "✅ 已清理日志与 PID"
