import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { NetworkStack } from '../lib/network-stack';

describe('NetworkStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new NetworkStack(app, 'TestNetwork', {
      env: { account: '123456789012', region: 'ap-southeast-1' },
    });
    template = Template.fromStack(stack);
  });

  test('creates a VPC', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('VPC has correct name tag', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      Tags: [{ Key: 'Name', Value: 'awsomeshop-vpc' }],
    });
  });

  test('creates public, private, and isolated subnets', () => {
    // 2 AZs × 3 subnet types = 6 subnets
    template.resourceCountIs('AWS::EC2::Subnet', 6);
  });

  test('creates a NAT Gateway', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 1);
  });

  test('creates S3 Gateway Endpoint', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: {
        'Fn::Join': ['', ['com.amazonaws.', { Ref: 'AWS::Region' }, '.s3']],
      },
      VpcEndpointType: 'Gateway',
    });
  });

  test('creates ECR Interface Endpoint', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: 'com.amazonaws.ap-southeast-1.ecr.api',
      VpcEndpointType: 'Interface',
    });
  });

  test('creates SQS Interface Endpoint', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: 'com.amazonaws.ap-southeast-1.sqs',
      VpcEndpointType: 'Interface',
    });
  });

  test('creates Secrets Manager Interface Endpoint', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: 'com.amazonaws.ap-southeast-1.secretsmanager',
      VpcEndpointType: 'Interface',
    });
  });

  test('outputs VPC ID', () => {
    template.hasOutput('VpcId', {});
  });
});
