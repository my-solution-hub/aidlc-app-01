import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CdnStack } from '../lib/cdn-stack';

describe('CdnStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const env = { account: '123456789012', region: 'ap-southeast-1' };

    // Create a mock ALB in a separate stack
    const albStack = new cdk.Stack(app, 'AlbStack', { env });
    const vpc = new ec2.Vpc(albStack, 'Vpc');
    const alb = new elbv2.ApplicationLoadBalancer(albStack, 'Alb', {
      vpc,
      internetFacing: true,
    });

    const cdnStack = new CdnStack(app, 'TestCDN', { env, alb });
    template = Template.fromStack(cdnStack);
  });

  // Frontend Bucket
  test('creates frontend S3 bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  // CloudFront Distribution
  test('creates CloudFront distribution', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  test('CloudFront has default root object set to index.html', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultRootObject: 'index.html',
      },
    });
  });

  test('CloudFront has SPA error responses (403 → index.html)', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          }),
        ]),
      },
    });
  });

  test('CloudFront has SPA error responses (404 → index.html)', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          }),
        ]),
      },
    });
  });

  test('CloudFront uses PriceClass 200', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        PriceClass: 'PriceClass_200',
      },
    });
  });

  test('CloudFront has /api/* cache behavior (no caching)', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: '/api/*',
            CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CACHING_DISABLED policy ID
          }),
        ]),
      },
    });
  });

  // Origin Access Control
  test('creates Origin Access Control for S3', () => {
    template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
      OriginAccessControlConfig: {
        Name: 'awsomeshop-frontend-oac',
      },
    });
  });

  // Outputs
  test('outputs distribution domain name', () => {
    template.hasOutput('DistributionDomainName', {});
  });

  test('outputs distribution ID', () => {
    template.hasOutput('DistributionId', {});
  });

  test('outputs frontend bucket name', () => {
    template.hasOutput('FrontendBucketName', {});
  });
});
