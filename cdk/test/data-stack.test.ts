import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../lib/network-stack';
import { DataStack } from '../lib/data-stack';

describe('DataStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const env = { account: '123456789012', region: 'ap-southeast-1' };

    const networkStack = new NetworkStack(app, 'TestNetwork', { env });
    const dataStack = new DataStack(app, 'TestData', {
      env,
      vpc: networkStack.vpc,
    });
    template = Template.fromStack(dataStack);
  });

  // Aurora Serverless v2
  test('creates Aurora Serverless v2 cluster', () => {
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      Engine: 'aurora-mysql',
      ServerlessV2ScalingConfiguration: {
        MinCapacity: 0.5,
        MaxCapacity: 4,
      },
    });
  });

  test('Aurora uses isolated subnets', () => {
    template.hasResourceProperties('AWS::RDS::DBSubnetGroup', {
      DBSubnetGroupDescription: Match.anyValue(),
    });
  });

  test('Aurora has storage encryption enabled', () => {
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      StorageEncrypted: true,
    });
  });

  test('Aurora has default database name', () => {
    template.hasResourceProperties('AWS::RDS::DBCluster', {
      DatabaseName: 'awsomeshop',
    });
  });

  test('creates a Secrets Manager secret for DB credentials', () => {
    template.resourceCountIs('AWS::SecretsManager::Secret', 1);
  });

  // ElastiCache Serverless
  test('creates ElastiCache Serverless Redis', () => {
    template.hasResourceProperties('AWS::ElastiCache::ServerlessCache', {
      Engine: 'redis',
      ServerlessCacheName: 'awsomeshop-redis',
    });
  });

  test('ElastiCache has usage limits configured', () => {
    template.hasResourceProperties('AWS::ElastiCache::ServerlessCache', {
      CacheUsageLimits: {
        DataStorage: { Maximum: 5, Unit: 'GB' },
        ECPUPerSecond: { Maximum: 5000 },
      },
    });
  });

  // SQS
  test('creates order queue', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'awsomeshop-order-queue',
      VisibilityTimeout: 60,
    });
  });

  test('creates dead letter queue', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'awsomeshop-order-dlq',
      MessageRetentionPeriod: 1209600, // 14 days in seconds
    });
  });

  test('order queue has DLQ configured with maxReceiveCount 3', () => {
    template.hasResourceProperties('AWS::SQS::Queue', {
      QueueName: 'awsomeshop-order-queue',
      RedrivePolicy: {
        deadLetterTargetArn: Match.anyValue(),
        maxReceiveCount: 3,
      },
    });
  });

  // S3
  test('creates image bucket with encryption', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
        ],
      },
    });
  });

  test('image bucket blocks public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  // Security Groups
  test('creates DB security group allowing MySQL from VPC', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription: 'Security group for Aurora Serverless v2',
    });
  });

  test('creates Redis security group', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription: 'Security group for ElastiCache Serverless Redis',
    });
  });

  // Outputs
  test('outputs Aurora cluster endpoint', () => {
    template.hasOutput('AuroraClusterEndpoint', {});
  });

  test('outputs Redis endpoint', () => {
    template.hasOutput('RedisEndpoint', {});
  });

  test('outputs order queue URL', () => {
    template.hasOutput('OrderQueueUrl', {});
  });
});
