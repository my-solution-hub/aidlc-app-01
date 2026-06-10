import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { KubectlV31Layer } from '@aws-cdk/lambda-layer-kubectl-v31';
import { Construct } from 'constructs';

export interface EksStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  dbCluster: rds.DatabaseCluster;
  redisEndpoint: string;
  queue: sqs.Queue;
  imageBucket: s3.Bucket;
}

export class EksStack extends cdk.Stack {
  public readonly cluster: eks.Cluster;
  public readonly alb: elbv2.IApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);

    const { vpc, dbCluster, queue, imageBucket } = props;

    // ─────────────────────────────────────────────
    // EKS Cluster
    // ─────────────────────────────────────────────

    this.cluster = new eks.Cluster(this, 'EksCluster', {
      clusterName: 'awsomeshop',
      version: eks.KubernetesVersion.V1_31,
      kubectlLayer: new KubectlV31Layer(this, 'KubectlLayer'),
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      defaultCapacity: 0, // We'll use Fargate only
      endpointAccess: eks.EndpointAccess.PUBLIC_AND_PRIVATE,
    });

    // Fargate Profile — all workloads run on Fargate
    this.cluster.addFargateProfile('DefaultProfile', {
      selectors: [
        { namespace: 'default' },
        { namespace: 'awsome-shop' },
        { namespace: 'kube-system' },
      ],
      subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    // ─────────────────────────────────────────────
    // ECR Repositories
    // ─────────────────────────────────────────────

    const services = [
      'awsome-shop-gateway-service',
      'awsome-shop-auth-service',
      'awsome-shop-product-service',
      'awsome-shop-points-service',
      'awsome-shop-order-service',
      'awsome-shop-frontend',
    ];

    const repos: Record<string, ecr.Repository> = {};
    for (const svc of services) {
      repos[svc] = new ecr.Repository(this, `Ecr-${svc}`, {
        repositoryName: svc,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        emptyOnDelete: true,
        lifecycleRules: [
          { maxImageCount: 10, description: 'Keep last 10 images' },
        ],
      });
    }

    // ─────────────────────────────────────────────
    // IAM Role for Pod (IRSA)
    // ─────────────────────────────────────────────

    const conditions = new cdk.CfnJson(this, 'OidcCondition', {
      value: {
        [`${this.cluster.clusterOpenIdConnectIssuer}:aud`]: 'sts.amazonaws.com',
        [`${this.cluster.clusterOpenIdConnectIssuer}:sub`]: 'system:serviceaccount:awsome-shop:awsome-shop-sa',
      },
    });

    const podRole = new iam.Role(this, 'PodRole', {
      roleName: 'awsomeshop-pod-role',
      assumedBy: new iam.FederatedPrincipal(
        this.cluster.openIdConnectProvider.openIdConnectProviderArn,
        {
          StringEquals: conditions,
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    // Grant Pod access to AWS resources
    queue.grantSendMessages(podRole);
    queue.grantConsumeMessages(podRole);
    imageBucket.grantReadWrite(podRole);
    dbCluster.secret?.grantRead(podRole);

    // ─────────────────────────────────────────────
    // AWS Load Balancer Controller (for ALB Ingress)
    // ─────────────────────────────────────────────

    const albControllerPolicy = new iam.Policy(this, 'AlbControllerPolicy', {
      policyName: 'AWSLoadBalancerControllerPolicy',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'elasticloadbalancing:*',
            'ec2:Describe*',
            'ec2:AuthorizeSecurityGroupIngress',
            'ec2:RevokeSecurityGroupIngress',
            'ec2:CreateSecurityGroup',
            'ec2:DeleteSecurityGroup',
            'ec2:CreateTags',
            'ec2:DeleteTags',
            'iam:CreateServiceLinkedRole',
            'cognito-idp:DescribeUserPoolClient',
            'acm:ListCertificates',
            'acm:DescribeCertificate',
            'wafv2:GetWebACL',
            'wafv2:GetWebACLForResource',
            'wafv2:AssociateWebACL',
            'wafv2:DisassociateWebACL',
            'shield:GetSubscriptionState',
            'shield:DescribeProtection',
            'shield:CreateProtection',
            'shield:DeleteProtection',
          ],
          resources: ['*'],
        }),
      ],
    });

    const albServiceAccount = this.cluster.addServiceAccount('AlbController', {
      name: 'aws-load-balancer-controller',
      namespace: 'kube-system',
    });
    albServiceAccount.role.attachInlinePolicy(albControllerPolicy);

    // Install AWS Load Balancer Controller via Helm
    this.cluster.addHelmChart('AwsLoadBalancerController', {
      chart: 'aws-load-balancer-controller',
      repository: 'https://aws.github.io/eks-charts',
      namespace: 'kube-system',
      release: 'aws-load-balancer-controller',
      values: {
        clusterName: this.cluster.clusterName,
        serviceAccount: {
          create: false,
          name: 'aws-load-balancer-controller',
        },
        region: this.region,
        vpcId: vpc.vpcId,
      },
    });

    // ─────────────────────────────────────────────
    // Kubernetes Namespace
    // ─────────────────────────────────────────────

    this.cluster.addManifest('Namespace', {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: 'awsome-shop' },
    });

    // ─────────────────────────────────────────────
    // ALB reference (created by Ingress controller)
    // We create a placeholder ALB for CloudFront to reference
    // ─────────────────────────────────────────────

    // AWS-managed prefix list for CloudFront origin-facing IPs.
    // The prefix list consumes ~55 SG rule slots per reference, so we use
    // a single rule with port range 80-443 to stay within the default 60-rule quota.
    const cloudfrontPrefixList = ec2.PrefixList.fromLookup(this, 'CloudFrontPrefixList', {
      prefixListName: 'com.amazonaws.global.cloudfront.origin-facing',
    });

    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'Security group for ALB - CloudFront only',
      allowAllOutbound: true,
    });
    albSecurityGroup.addIngressRule(
      ec2.Peer.prefixList(cloudfrontPrefixList.prefixListId),
      ec2.Port.tcpRange(80, 443),
      'Allow HTTP/HTTPS from CloudFront only',
    );

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'awsomeshop-alb',
      securityGroup: albSecurityGroup,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    this.alb = alb;

    // ─────────────────────────────────────────────
    // Cleanup: Remove Kubernetes resources on stack deletion
    // This ensures ALBs/NLBs created by Ingress are deleted
    // before CloudFormation tries to remove VPC/subnets.
    // ─────────────────────────────────────────────

    const cleanupManifest = this.cluster.addManifest('CleanupJob', {
      apiVersion: 'batch/v1',
      kind: 'Job',
      metadata: {
        name: 'pre-delete-cleanup',
        namespace: 'awsome-shop',
        annotations: {
          'helm.sh/hook': 'pre-delete',
        },
      },
      spec: {
        template: {
          spec: {
            serviceAccountName: 'awsome-shop-sa',
            containers: [
              {
                name: 'cleanup',
                image: 'bitnami/kubectl:latest',
                command: [
                  '/bin/sh',
                  '-c',
                  'kubectl delete ingress --all -n awsome-shop --ignore-not-found && kubectl delete svc --field-selector spec.type=LoadBalancer -n awsome-shop --ignore-not-found && sleep 60',
                ],
              },
            ],
            restartPolicy: 'Never',
          },
        },
        backoffLimit: 1,
      },
    });

    // ─────────────────────────────────────────────
    // Outputs
    // ─────────────────────────────────────────────

    new cdk.CfnOutput(this, 'ClusterName', {
      value: this.cluster.clusterName,
    });

    new cdk.CfnOutput(this, 'ClusterEndpoint', {
      value: this.cluster.clusterEndpoint,
    });

    new cdk.CfnOutput(this, 'AlbDnsName', {
      value: alb.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, 'PodRoleArn', {
      value: podRole.roleArn,
    });

    for (const [name, repo] of Object.entries(repos)) {
      new cdk.CfnOutput(this, `EcrUri-${name}`, {
        value: repo.repositoryUri,
      });
    }
  }
}
