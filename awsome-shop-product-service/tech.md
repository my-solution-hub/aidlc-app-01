# shop-product-service 技术文档

## 本地启动方式

### 构建

```bash
mvn clean package -DskipTests
```

### 启动

使用 `java -jar` 命令启动应用，挂起到后台，日志输出到 `/tmp/awsome-shop/product/` 目录：

```bash
# 创建日志目录
mkdir -p /tmp/awsome-shop/product

# 后台启动，日志写入 /tmp/awsome-shop/product/app.log
nohup java -jar bootstrap/target/awsome-shop-product-service-1.0.0-SNAPSHOT.jar \
  --spring.profiles.active=local \
  > /tmp/awsome-shop/product/app.log 2>&1 &
```

### 查看日志

```bash
# 实时查看日志
tail -f /tmp/awsome-shop/product/app.log
```

### 停止应用

```bash
# 查找并停止进程
lsof -ti:8002 | xargs kill -9
```

### 健康检查

```bash
curl http://localhost:8002/actuator/health
```
