import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DataStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class DataStack extends cdk.Stack {
  public readonly dbCluster: rds.DatabaseCluster;
  public readonly redisEndpoint: string;
  public readonly queue: sqs.Queue;
  public readonly imageBucket: s3.Bucket;
  public readonly dbSecret: secretsmanager.ISecret;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const { vpc } = props;

    // ─────────────────────────────────────────────
    // Aurora Serverless v2 (MySQL 8.0 compatible)
    // ─────────────────────────────────────────────

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Security group for Aurora Serverless v2',
      allowAllOutbound: false,
    });

    this.dbCluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_12_0,
      }),
      serverlessV2MinCapacity: 0.5,
      serverlessV2MaxCapacity: 4,
      writer: rds.ClusterInstance.serverlessV2('writer', {
        publiclyAccessible: false,
      }),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [dbSecurityGroup],
      defaultDatabaseName: 'awsomeshop',
      credentials: rds.Credentials.fromGeneratedSecret('admin', {
        secretName: 'awsomeshop/db/credentials',
      }),
      storageEncrypted: true,
      deletionProtection: false, // Set to true for production
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change for production
    });

    this.dbSecret = this.dbCluster.secret!;

    // ─────────────────────────────────────────────
    // ElastiCache Serverless (Redis)
    // ─────────────────────────────────────────────

    const redisSecurityGroup = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Security group for ElastiCache Serverless Redis',
      allowAllOutbound: false,
    });

    const redisSubnetGroup = new elasticache.CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for ElastiCache Serverless',
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
      cacheSubnetGroupName: 'awsomeshop-redis-subnets',
    });

    const redisServerless = new elasticache.CfnServerlessCache(this, 'RedisServerless', {
      engine: 'redis',
      serverlessCacheName: 'awsomeshop-redis',
      securityGroupIds: [redisSecurityGroup.securityGroupId],
      subnetIds: vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
      cacheUsageLimits: {
        dataStorage: { maximum: 5, unit: 'GB' },
        ecpuPerSecond: { maximum: 5000 },
      },
    });

    this.redisEndpoint = redisServerless.attrEndpointAddress;

    // ─────────────────────────────────────────────
    // SQS Queue (for order async messaging)
    // ─────────────────────────────────────────────

    const dlq = new sqs.Queue(this, 'OrderDLQ', {
      queueName: 'awsomeshop-order-dlq',
      retentionPeriod: cdk.Duration.days(14),
    });

    this.queue = new sqs.Queue(this, 'OrderQueue', {
      queueName: 'awsomeshop-order-queue',
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.days(7),
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 3,
      },
    });

    // ─────────────────────────────────────────────
    // S3 Buckets
    // ─────────────────────────────────────────────

    // Product images bucket
    this.imageBucket = new s3.Bucket(this, 'ImageBucket', {
      bucketName: `awsomeshop-images-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // Restrict in production
          allowedHeaders: ['*'],
        },
      ],
    });

    // ─────────────────────────────────────────────
    // Security Group Rules (allow from Private subnets)
    // ─────────────────────────────────────────────

    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(3306),
      'Allow MySQL from VPC'
    );

    redisSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(6379),
      'Allow Redis from VPC'
    );

    // ─────────────────────────────────────────────
    // Outputs
    // ─────────────────────────────────────────────

    new cdk.CfnOutput(this, 'AuroraClusterEndpoint', {
      value: this.dbCluster.clusterEndpoint.hostname,
    });

    new cdk.CfnOutput(this, 'RedisEndpoint', {
      value: this.redisEndpoint,
    });

    new cdk.CfnOutput(this, 'OrderQueueUrl', {
      value: this.queue.queueUrl,
    });

    new cdk.CfnOutput(this, 'ImageBucketName', {
      value: this.imageBucket.bucketName,
    });
  }
}
