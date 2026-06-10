#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DataStack } from '../lib/data-stack';
import { EksStack } from '../lib/eks-stack';
import { CdnStack } from '../lib/cdn-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'ap-southeast-1',
};

// 1. VPC & Networking
const networkStack = new NetworkStack(app, 'AwsomeShop-Network', { env });

// 2. Data Layer: Aurora Serverless v2, ElastiCache Serverless, SQS, S3
const dataStack = new DataStack(app, 'AwsomeShop-Data', {
  env,
  vpc: networkStack.vpc,
});

// 3. EKS Cluster with Fargate
const eksStack = new EksStack(app, 'AwsomeShop-EKS', {
  env,
  vpc: networkStack.vpc,
  dbCluster: dataStack.dbCluster,
  redisEndpoint: dataStack.redisEndpoint,
  queue: dataStack.queue,
  imageBucket: dataStack.imageBucket,
});

// 4. CloudFront + S3 (frontend) + ALB Origin
new CdnStack(app, 'AwsomeShop-CDN', {
  env,
  alb: eksStack.alb,
});

app.synth();
