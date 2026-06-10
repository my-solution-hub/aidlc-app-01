# GitHub Actions OIDC Bootstrap (Terraform)

本地执行的 Terraform 项目，用于在 AWS 上创建 GitHub Actions 的 OIDC 授权，使 `release` 分支的 CI/CD 能免密钥部署到 AWS。

## 前置条件

- Terraform >= 1.7
- AWS CLI 配置好 `default` profile（或在 tfvars 中指定其他 profile）
- 足够的 IAM 权限来创建 OIDC Provider 和 IAM Role

## 使用方式

```bash
cd init/github/tf

# 1. 复制并填写变量
cp terraform.tfvars.example terraform.tfvars
# 编辑 terraform.tfvars 确认 github_org / github_repo 等

# 2. 初始化
terraform init

# 3. 预览
terraform plan

# 4. 应用
terraform apply
```

## 应用后

Terraform 会输出 `deploy_role_arn`，将其设置为 GitHub repo 的 Secret：

- Secret name: `AWS_DEPLOY_ROLE_ARN`
- Secret value: 输出的 ARN（如 `arn:aws:iam::123456789012:role/awsome-shop-github-actions-role`）

另外如果使用 EKS 部署，还需设置：

- Secret name: `EKS_CLUSTER_NAME`
- Secret value: 你的 EKS 集群名称

## 架构

```
GitHub Actions (release branch)
    │
    ▼ OIDC token
AWS STS (AssumeRoleWithWebIdentity)
    │
    ▼
IAM Role (AdministratorAccess for demo)
    │
    ├── CDK Deploy (cdk/ 目录变更)
    └── ECR Push + kubectl apply (服务目录变更)
```

## 安全说明

当前使用 `AdministratorAccess` 便于演示。生产环境应替换为最小权限策略。
