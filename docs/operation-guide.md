# AwsomeShop 部署 Operation Guide

记录到 2026-06-10 为止的部署方式：哪些走 CI/CD、哪些必须手动。
适合在新环境复刻或重置时参考。

## 当前状态（2026-06-10）

| 模块 | 状态 |
|---|---|
| EKS cluster + 3 × t3.large | ✅ Running |
| CDK 4 个 stack | ✅ 全部 ACTIVE |
| 5 个后端服务（auth/product/points/order/gateway） | ✅ 各 2 副本 Running，Flyway 已建表 |
| 内部路由（gateway → 4 后端） | ✅ HTTP 200 验证通过（`/api/products`） |
| DB schema | ✅ 4 个 schema 各自有表（auth=2 / product=4 / points=6 / order=3） |
| Ingress + ALB（外部入口） | ❌ 未 apply |
| CloudFront origin 切换到新 ALB | ❌ 仍指向占位 ALB |
| Frontend S3 部署 | ❌ 未实施 |

---

## 1. 架构概览

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  CloudFront     │     │  ALB             │     │  EKS         │
│  (CDN + S3 SPA) │ ──> │  (by Ingress)    │ ──> │  Gateway pod │ ──> 后端 4 服务
│                 │     │                  │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
        ↑                                              ↓
        │                                       ┌─────────────────┐
        │                                       │ Aurora MySQL    │
        │                                       │ Redis Serverless│
        │                                       │ SQS / S3 Images │
   静态资源 S3                                   └─────────────────┘
```

CDK 拆分为 4 个 stack：
| Stack | 内容 |
|---|---|
| `AwsomeShop-Network` | VPC、subnets、NAT |
| `AwsomeShop-Data` | Aurora、Redis、SQS、Image S3 bucket |
| `AwsomeShop-EKS` | EKS cluster、node group、IRSA、shared-config CM、ECR repos、占位 ALB、CW 可观测 addon |
| `AwsomeShop-CDN` | CloudFront、Frontend S3 bucket |

---

## 2. 自动化矩阵

| 步骤 | 自动化 | 触发条件 |
|---|---|---|
| Infra 变更 (CDK) | ✅ CI: `deploy-cdk` job | push to `release`，`cdk/**` 改动 |
| 后端服务镜像 build + push ECR | ✅ CI: `deploy-<svc>-service` | push to `release`，`awsome-shop-<svc>-service/**` 改动 |
| 后端服务 kubectl apply | ✅ CI（同上 job 末尾） | 同上 |
| 后端服务 prod 配置（yml / logback） | ✅ CI（属于服务代码） | 同上 |
| Frontend build & deploy | ❌ 当前还在 build Docker image，应改成 `npm build → s3 sync → CF invalidation` |
| 数据库 schema 创建（A） | ❌ 一次性手动 |
| K8s Secret 创建（DB credentials，B） | ❌ 一次性手动（CDK 不可行，见 §5.B） |
| Ingress 资源（D） | ❌ 一次性手动（仓库根 `k8s/ingress.yaml` 不在任何 deploy job 路径里） |
| CloudFront origin 切换（E） | ❌ 手动 `aws cloudfront update-distribution`，或后续 CDK 化 |

---

## 3. 全新部署流程（从零到运行）

### 3.1 CI 自动完成的部分（push 触发）

```bash
git push origin main
git push origin origin/main:release   # 触发 deploy.yml
```

CI 会顺序完成：
1. CDK 4 个 stack（network → data → eks → cdn）
2. 6 个服务的 Docker 镜像 build + 推 ECR
3. 后端 5 个服务的 `kubectl apply -f <svc>/k8s/`

CDK 创建的 K8s 资源：
- `awsome-shop` namespace
- `awsome-shop-sa` ServiceAccount（IRSA → SQS/S3/Secrets 权限）
- `shared-config` ConfigMap（Redis/Aurora/SQS endpoint）
- 3 个 IAM 访问入口（yagrxu user / Admin role / GHA role 都是 cluster-admin）
- LB Controller (Helm)、CloudWatch Observability addon
- 占位 ALB（CDN 引用，但其实是空壳）

### 3.2 一次性手动步骤

执行顺序很重要：A → B → 然后 push CI（C 由 CI 做）→ D → E。
A、B 必须在所有后端服务能跑之前完成；D、E 让外网能访问。

#### Step A — 数据库 schema 初始化（手动）

```bash
SECRET=$(aws secretsmanager get-secret-value --secret-id awsomeshop/db/credentials \
  --region us-east-1 --query SecretString --output text)
DB_USER=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["username"])')
DB_PASS=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["password"])')
DB_HOST=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["host"])')

kubectl run mysql-init -n awsome-shop --rm -i --restart=Never \
  --image=mysql:8.0 \
  --env="DB_HOST=${DB_HOST}" --env="DB_USER=${DB_USER}" --env="DB_PASS=${DB_PASS}" \
  --command -- sh -c '
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" <<SQL
CREATE DATABASE IF NOT EXISTS awsome_shop_auth    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS awsome_shop_product CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS awsome_shop_point   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS awsome_shop_order   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL
'
```

表会由各服务启动时 Flyway migration 自动建（每个服务的 `db/migration/V*__*.sql`）。

#### Step B — 4 个 db-secret K8s Secret（手动）

```bash
SECRET=$(aws secretsmanager get-secret-value --secret-id awsomeshop/db/credentials \
  --region us-east-1 --query SecretString --output text)
DB_USER=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["username"])')
DB_PASS=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["password"])')
DB_HOST=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["host"])')

URL_SUFFIX="?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC&useSSL=true&allowPublicKeyRetrieval=true"

for entry in "auth:awsome_shop_auth" "product:awsome_shop_product" "points:awsome_shop_point" "order:awsome_shop_order"; do
  svc="${entry%%:*}"; schema="${entry##*:}"
  kubectl create secret generic "${svc}-db-secret" -n awsome-shop \
    --from-literal=url="jdbc:mysql://${DB_HOST}:3306/${schema}${URL_SUFFIX}" \
    --from-literal=username="$DB_USER" \
    --from-literal=password="$DB_PASS"
done
```

**为什么手动？** CFN 的 `{{resolve:secretsmanager:...}}` 动态引用不会穿透 EKS kubectl Custom Resource，CDK 内通过 `addManifest` 创建会得到 literal 字符串。已尝试，已 revert（commit `738e422`）。长期方案：External Secrets Operator。

> **重要**：手动创建的 Secret 不带 `aws.cdk.eks/prune-*` label，CDK 后续 deploy 不会 prune。但**禁止再在 CDK 里 addManifest 创建同名 Secret**——一旦 CDK 接管又移除，会触发 prune。

#### Step C — 后端服务 prod profile 适配（自动 / 已完成）

每个后端服务（auth/product/points/order）的：
- `bootstrap/src/main/resources/application-prod.yml`
- `bootstrap/src/main/resources/logback-spring.xml`
- `k8s/deployment.yaml`

需要按 EKS 化模板改造（详见 commit `30bc15f` 和 `165fc9e`）：
- `application-prod.yml`：去掉 datasource 占位（让 K8s Secret env 接管）；`${REDIS_PASSWORD:}` 默认空（Redis serverless 无密码）；JWT/encryption 提供 dev 默认值；`server.port` 对齐 deployment containerPort。
- `logback-spring.xml`：prod profile 加 CONSOLE appender，输出 stdout 到 kubectl logs。
- `k8s/deployment.yaml`：必须 `git add` 提交，否则 paths-filter 不会触发 build；按需加 `SHOP_REMOTE_*_BASE_URL` env 让跨服务调用走 cluster-internal DNS。
- `Dockerfile`：用 `-Dmaven.test.skip=true` 而非 `-DskipTests`，前者同时跳过 testCompile（避免老测试代码缺依赖时炸 build）。

完成上述改动 push 到 `release` 后，CI 自动 build 镜像 + apply manifest。

#### Step D — Ingress 资源（手动）

```bash
kubectl apply -f k8s/ingress.yaml
```

**为什么手动？** `deploy-service.yml` workflow 里 kubectl apply 步骤只看 `<svc>/k8s/`，不会扫仓库根的 `k8s/ingress.yaml`。

apply 后 AWS LB Controller 大约 1-2 分钟创建一个新 ALB（不同于 CDK 创建的占位 ALB）。拿到 ALB DNS：

```bash
kubectl get ingress awsome-shop-ingress -n awsome-shop \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

#### Step E — 切换 CloudFront origin 到新 ALB（手动）

```bash
NEW_ALB_DNS=$(kubectl get ingress awsome-shop-ingress -n awsome-shop \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

aws cloudfront get-distribution-config --id E2R7BEJGD7K6O4 > /tmp/cf.json
ETAG=$(jq -r .ETag /tmp/cf.json)

jq --arg DNS "$NEW_ALB_DNS" '.DistributionConfig.Origins.Items |= map(
  if (.DomainName | endswith(".elb.amazonaws.com")) then .DomainName = $DNS else . end
)' /tmp/cf.json | jq .DistributionConfig > /tmp/cf-config.json

aws cloudfront update-distribution \
  --id E2R7BEJGD7K6O4 \
  --if-match "$ETAG" \
  --distribution-config file:///tmp/cf-config.json
```

CloudFront 分发约 5-10 分钟生效。

#### Step F — Frontend 部署到 S3（手动）

```bash
cd awsome-shop-frontend
npm ci
npm run build  # 输出 dist/
aws s3 sync dist/ s3://awsomeshop-frontend-613477150601 --delete
aws cloudfront create-invalidation \
  --distribution-id E2R7BEJGD7K6O4 \
  --paths '/*'
```

**为什么手动？** CI workflow 当前对 frontend 还在 build Docker 推 ECR，跟 CDN 架构不符。应改 workflow 为上面的 3 行，但还没改。

---

## 4. 验证

```bash
# 节点
kubectl get nodes        # 期望 3 个 EC2 节点（无 fargate-*）

# 后端 Pod
kubectl get pods -n awsome-shop
# 期望全部 Running：gateway × 2、auth × 2、product × 2、points × 2、order × 2

# Secret + ConfigMap
kubectl get secret -n awsome-shop | grep db-secret      # 4 个
kubectl get cm shared-config -n awsome-shop             # 1 个

# DB
# 验证 schema 是否有表（首次 Pod 启动后 Flyway 应已建表）
SECRET=$(aws secretsmanager get-secret-value --secret-id awsomeshop/db/credentials \
  --region us-east-1 --query SecretString --output text)
DB_HOST=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["host"])')
DB_USER=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["username"])')
DB_PASS=$(echo "$SECRET" | python3 -c 'import sys,json;print(json.load(sys.stdin)["password"])')
kubectl run mysql-check -n awsome-shop --rm -i --restart=Never \
  --image=mysql:8.0 --env="H=${DB_HOST}" --env="U=${DB_USER}" --env="P=${DB_PASS}" \
  --command -- sh -c 'mysql -h "$H" -u "$U" -p"$P" -e "
SELECT TABLE_SCHEMA, COUNT(*) FROM information_schema.TABLES
WHERE TABLE_SCHEMA LIKE \"awsome_shop_%\" GROUP BY TABLE_SCHEMA;"'

# Ingress + ALB
kubectl get ingress -n awsome-shop
ALB_DNS=$(kubectl get ingress awsome-shop-ingress -n awsome-shop \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -sI "http://$ALB_DNS/actuator/health"   # 期望 200

# CloudFront 端到端
curl -sI "https://d2ujuxmg0mw1kh.cloudfront.net/api/products"   # 公开 GET 路径
```

---

## 5. 已踩坑 / 设计决策

### 5.A 为什么 EKS 从 Fargate 迁到 EC2？
原因：用户体验+成本+灵活性。Fargate 启动慢（~60s 调度），不能跑 daemonset，cloudwatch-agent 在 Fargate 实际跑不通（Fargate 执行角色覆盖了 IRSA 的可见性，agent 启动失败被掩盖了）。

迁移过程见 commit `107f77a`（加 node group）和 `e5a225a`（删 Fargate profile）。

### 5.B 为什么 K8s Secret 不能用 CDK 生成
CFN 的 `{{resolve:secretsmanager:arn:...:SecretString:username::}}` **只在以下属性位置**被识别和替换：
- `AWS::SecretsManager::Secret::SecretString` 等明确接受的属性
- 通过 IAM Policy 等支持的位置

EKS 的 kubectl provider 是 Custom Resource (Lambda)，CFN 把整个 manifest JSON 透传给 lambda，**字段值里的 `{{resolve:...}}` 不会被解析**。

因此 K8s Secret 只能：
1. 手动 kubectl create
2. External Secrets Operator
3. 应用直接调 Secrets Manager API（IRSA 已经给了权限）

### 5.C 为什么 logback prod profile 加了 CONSOLE appender？
原模板只写文件，pod 挂掉时 stdout 是空的，`kubectl logs` 看不到 root cause。我们今天发现 gateway 启动失败但只显示 Spring banner，就是这个原因。修复见 commit `87f4fd7`。

### 5.D 为什么 paths-filter base 改成 `github.event.before`
原本 `dorny/paths-filter@v3` 默认对比 `release` vs `main`，当 release 落后于 main 时 diff 是空的，CDK 改动不会触发 `deploy-cdk`。改成对比"上次 release push 的 commit"，符合 release branch 推什么部什么的语义。修复见 commit `6771eba`。

### 5.E `-DskipTests` vs `-Dmaven.test.skip=true`
`-DskipTests` 只跳过测试**执行**，testCompile 仍会跑。如果测试代码引用了缺失依赖（比如老的 `okhttp3:mockwebserver`），container build 一样炸。改用 `-Dmaven.test.skip=true` 跳过两阶段。修复见 commit `30bc15f`（5 个服务 Dockerfile 同步改）。

### 5.F K8s Deployment manifest 必须 commit
`<svc>/k8s/deployment.yaml` 长期 untracked 时，paths-filter 看不到改动，CI 不会触发该服务的 build/apply 流水线。Step C push 时一并 `git add` 这些文件后才触发 CI 路径。

### 5.G 集群 IAM 入口
| Principal | 用途 |
|---|---|
| `arn:aws:iam::613477150601:user/yagrxu` | 本地 kubectl |
| `arn:aws:iam::613477150601:role/Admin` | AWS 控制台访问 |
| `arn:aws:iam::613477150601:role/awsome-shop-github-actions-role` | CI 部署 |

均通过 EKS Access Entry + AmazonEKSClusterAdminPolicy 由 CDK 管理（commit `87f4fd7`、`107f77a`、`adbdc92`）。**不需要手动维护 aws-auth ConfigMap。**

### 5.H CloudWatch Observability addon SA 信任策略
addon 安装时一次性创建 4 个 SA（`amazon-cloudwatch-observability` / `cloudwatch-agent` / `dcgm-exporter-service-acct` / `neuron-monitor-service-acct`），全部用同一个 IRSA role ARN annotate。但 role 的 trust policy 默认只允许第一个 SA。Fargate 上 Fargate 执行角色覆盖 IRSA 所以看不出来；迁到 EC2 后 cloudwatch-agent crashloop。修复：trust policy 列出全部 4 个 SA。见 commit `adbdc92`。

---

## 6. 关键资源 ID

| 项 | 值 |
|---|---|
| Account / Region | `613477150601` / `us-east-1` |
| EKS cluster | `awsomeshop` |
| Aurora endpoint | `awsomeshop-data-auroracluster23d869c0-nlqphu7wecum.cluster-cqj4owsgp1do.us-east-1.rds.amazonaws.com:3306` |
| Aurora master Secret | `awsomeshop/db/credentials` (Secrets Manager) |
| Redis endpoint | `awsomeshop-redis-6rs37x.serverless.use1.cache.amazonaws.com:6379` |
| Image bucket | `awsomeshop-images-613477150601` |
| Frontend bucket | `awsomeshop-frontend-613477150601` |
| SQS order queue | `https://sqs.us-east-1.amazonaws.com/613477150601/awsomeshop-order-queue` |
| CloudFront distribution id | `E2R7BEJGD7K6O4` |
| CloudFront domain | `d2ujuxmg0mw1kh.cloudfront.net` |
| GHA deploy role | `arn:aws:iam::613477150601:role/awsome-shop-github-actions-role` |
| Workload SA IRSA role | EKS stack output `PodRoleArn` |

---

## 7. 改进路线（按优先级）

短期（让流量真正打通）：

1. **执行 Step D + E** — apply ingress、改 CloudFront origin。约 30 分钟（含 5-10 分钟 CF 分发）。
2. **Frontend 部署到 S3**（Step F）— 一次性手动验证页面，再决定是否优先自动化。

中期（消除手动）：

3. **External Secrets Operator**（1 小时）— 装 ESO，把 4 个 db-secret 改成 ExternalSecret 资源。让 Step B 自动化，未来重建集群无需手动 kubectl。
4. **Frontend workflow → S3 sync**（30 分钟）— 替代当前 build Docker push ECR 的 `deploy-frontend` job。改 `.github/workflows/deploy.yml` 单独写 frontend job：`npm build → s3 sync → CF invalidation`。
5. **Ingress 进 CDK**（30 分钟）— 把 `k8s/ingress.yaml` 搬进 `cluster.addManifest()`。让 Step D 自动化。
6. **CloudFront origin CDK 化**（中等难度）— CDN stack 用 `LoadBalancer.fromLookup` 按 tag 找 ingress 创建的 ALB；删除 EKS stack 里的占位 ALB。让 Step E 自动化。

长期（生产 hardening）：

7. **JWT_SECRET / ENCRYPTION_KEY 生产值** — 当前 4 个服务 prod yml 是 dev 默认值，便于跑通；生产应通过 K8s Secret 注入（建议跟 ESO 一起做）。
8. **应用 health 端点诊断** — `/actuator/health` 返回 DOWN（probe-用的 `/health/readiness` `/health/liveness` UP）；找出哪个 indicator 挂了，是 expected（如 `mail`）还是真实问题。
9. **`/api/categories` 500** — Step C 验证时发现的业务 bug，跟部署无关，需要应用层修。
