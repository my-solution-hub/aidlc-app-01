variable "project_name" {
  type        = string
  description = "Project name used for resource naming"
  default     = "awsome-shop"
}

variable "aws_profile" {
  type        = string
  description = "AWS CLI profile to use (local execution)"
  default     = "default"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "github_org" {
  type        = string
  description = "GitHub organization or username"
}

variable "github_repo" {
  type        = string
  description = "GitHub repository name (without org prefix)"
}

variable "deploy_branch" {
  type        = string
  description = "Branch that triggers deployment via GitHub Actions"
  default     = "release"
}

variable "tags" {
  type        = map(string)
  description = "Common tags for all resources"
  default = {
    Project   = "awsome-shop"
    ManagedBy = "terraform"
    Component = "oidc-bootstrap"
  }
}
