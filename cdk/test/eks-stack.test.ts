import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../lib/network-stack';
import { DataStack } from '../lib/data-stack';
import { EksStack } from '../lib/eks-stack';

describe('EksStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const env = { account: '123456789012', region: 'ap-southeast-1' };

    const networkStack = new NetworkStack(app, 'TestNetwork', { env });
    const dataStack = new DataStack(app, 'TestData', {
      env,
      vpc: networkStack.vpc,
    });
    const eksStack = new EksStack(app, 'TestEKS', {
      env,
      vpc: networkStack.vpc,
      dbCluster: dataStack.dbCluster,
      redisEndpoint: dataStack.redisEndpoint,
      queue: dataStack.queue,
      imageBucket: dataStack.imageBucket,
    });
    template = Template.fromStack(eksStack);
  });

  // EKS Cluster
  test('creates EKS cluster', () => {
    template.hasResourceProperties('Custom::AWSCDK-EKS-Cluster', {
      Config: Match.objectLike({
        name: 'awsomeshop',
        version: '1.31',
      }),
    });
  });

  // Fargate Profile
  test('creates Fargate profile', () => {
    template.hasResourceProperties('Custom::AWSCDK-EKS-FargateProfile', {
      Config: Match.objectLike({
        selectors: Match.arrayWith([
          Match.objectLike({ namespace: 'awsome-shop' }),
        ]),
      }),
    });
  });

  // ECR Repositories
  test('creates 5 ECR repositories', () => {
    template.resourceCountIs('AWS::ECR::Repository', 5);
  });

  test('ECR repos have lifecycle rules', () => {
    template.hasResourceProperties('AWS::ECR::Repository', {
      LifecyclePolicy: Match.objectLike({
        LifecyclePolicyText: Match.anyValue(),
      }),
    });
  });

  // ALB
  test('creates Application Load Balancer', () => {
    template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
      Name: 'awsomeshop-alb',
      Scheme: 'internet-facing',
      Type: 'application',
    });
  });

  // ALB Security Group - restricted to CloudFront only
  test('ALB security group restricts access to CloudFront prefix list only', () => {
    // Ingress rules are created as separate resources when using prefix lists
    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: 'tcp',
      FromPort: 80,
      ToPort: 80,
      SourcePrefixListId: Match.anyValue(),
      Description: 'Allow HTTP from CloudFront only',
    });

    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: 'tcp',
      FromPort: 443,
      ToPort: 443,
      SourcePrefixListId: Match.anyValue(),
      Description: 'Allow HTTPS from CloudFront only',
    });
  });

  test('ALB security group does NOT allow 0.0.0.0/0', () => {
    const ingressRules = template.findResources('AWS::EC2::SecurityGroupIngress');
    for (const [, rule] of Object.entries(ingressRules)) {
      const props = (rule as any).Properties;
      expect(props.CidrIp).toBeUndefined();
      expect(props.CidrIpv6).toBeUndefined();
    }
  });

  // IAM - Pod Role
  test('creates Pod IAM role for IRSA', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'awsomeshop-pod-role',
    });
  });

  // Kubernetes Namespace
  test('creates awsomeshop namespace', () => {
    template.hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
      Manifest: Match.anyValue(),
    });
  });

  // Outputs
  test('outputs cluster name', () => {
    template.hasOutput('ClusterName', {});
  });

  test('outputs ALB DNS name', () => {
    template.hasOutput('AlbDnsName', {});
  });

  test('outputs Pod role ARN', () => {
    template.hasOutput('PodRoleArn', {});
  });
});
