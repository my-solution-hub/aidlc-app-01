import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rum from 'aws-cdk-lib/aws-rum';
import { Construct } from 'constructs';

export interface RumStackProps extends cdk.StackProps {
  /** Domain RUM should accept beacons from (CloudFront distribution domain). */
  domain: string;
}

/**
 * CloudWatch RUM AppMonitor for the awsome-shop frontend.
 *
 * Flow:
 *   Browser → CloudWatch RUM beacon endpoint
 *   Browser uses an Identity Pool unauth role for sigv4 signing
 *   The unauth role is allow-listed in the AppMonitor identity-pool config
 */
export class RumStack extends cdk.Stack {
  public readonly appMonitorName: string;
  public readonly identityPoolId: string;
  public readonly guestRole: iam.Role;

  constructor(scope: Construct, id: string, props: RumStackProps) {
    super(scope, id, props);

    this.appMonitorName = 'awsome-shop-frontend';

    // ─────────────────────────────────────────────
    // Cognito Identity Pool (unauth) — gives the browser a temp signed cred
    // ─────────────────────────────────────────────
    const identityPool = new cognito.CfnIdentityPool(this, 'RumIdentityPool', {
      identityPoolName: 'awsomeshop-rum',
      allowUnauthenticatedIdentities: true,
    });
    this.identityPoolId = identityPool.ref;

    // Unauth role assumed by anonymous browsers
    this.guestRole = new iam.Role(this, 'RumGuestRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    // Permission for the guest role to ship RUM events.
    this.guestRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['rum:PutRumEvents'],
        resources: [
          `arn:aws:rum:${this.region}:${this.account}:appmonitor/${this.appMonitorName}`,
        ],
      }),
    );

    // Wire the unauth role to the identity pool.
    new cognito.CfnIdentityPoolRoleAttachment(this, 'RumIdentityPoolRoleAttachment', {
      identityPoolId: identityPool.ref,
      roles: {
        unauthenticated: this.guestRole.roleArn,
      },
    });

    // ─────────────────────────────────────────────
    // RUM AppMonitor
    //
    // NOTE: session replay is enabled separately via
    //   aws rum update-app-monitor --name awsome-shop-frontend \
    //     --session-replay sessionReplayDuration=30,sessionSampleRate=0.1
    // because CFN doesn't (yet) expose session-replay configuration. Run
    // that CLI command once after the AppMonitor is created.
    // ─────────────────────────────────────────────
    new rum.CfnAppMonitor(this, 'AppMonitor', {
      name: this.appMonitorName,
      domain: props.domain,
      cwLogEnabled: true,
      appMonitorConfiguration: {
        identityPoolId: identityPool.ref,
        guestRoleArn: this.guestRole.roleArn,
        telemetries: ['errors', 'performance', 'http'],
        sessionSampleRate: 1.0,
        // RUM client-side traces flow into X-Ray, joining backend segments.
        enableXRay: true,
      },
      // Custom events let the web SDK emit named app-level events.
      customEvents: { status: 'ENABLED' },
    });

    // ─────────────────────────────────────────────
    // Outputs (consumed by the frontend Vite build via CI env)
    // ─────────────────────────────────────────────
    new cdk.CfnOutput(this, 'AppMonitorName', { value: this.appMonitorName });
    new cdk.CfnOutput(this, 'RumIdentityPoolId', { value: identityPool.ref });
    new cdk.CfnOutput(this, 'RumGuestRoleArn', { value: this.guestRole.roleArn });
  }
}
