import * as cognitoIdentityPool from "@aws-cdk/aws-cognito-identitypool-alpha";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { NagSuppressions } from "cdk-nag";
import {SystemConfig} from "../shared/types";
import {IdpLoader} from "./idpLoader";
import {IdpInterface} from "./idp/idp-interface";

export interface AuthenticationProps {
  readonly config: SystemConfig;
}

export class Authentication extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognitoIdentityPool.IdentityPool;

  constructor(scope: Construct, id: string, props: AuthenticationProps) {
    super(scope, id);

    const userPool = new cognito.UserPool(this, "UserPool", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: false,
      mfa: cognito.Mfa.OPTIONAL,
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
      autoVerify: { email: true, phone: true },
      signInAliases: {
        email: true,
      },
    });

    if(props.config.oauth?.domain){
      userPool.addDomain('UserPoolDomain', {
        cognitoDomain: {
          domainPrefix: props.config.oauth.domain
        }
      })
    }

    const supportedIdentityProviders = [
      cognito.UserPoolClientIdentityProvider.COGNITO
    ]

    const userPoolClient = userPool.addClient("UserPoolClient", {
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.COGNITO_ADMIN
        ],
        callbackUrls: props.config.oauth?.redirectSignIn,
        logoutUrls: props.config.oauth?.redirectSignOut
      },
      supportedIdentityProviders: supportedIdentityProviders
    });

    if(props.config.oauth?.social_provider){

      const idpLoader = new IdpLoader(this, 'IdpLoader');
      let idp: IdpInterface;

      for (const [providerName, providerConfig] of Object.entries(props.config.oauth?.social_provider)) {

        void (async () => {
          idp = await idpLoader.get(providerName)
          idp.add({
            userPool: userPool,
            secretCompleteArn: providerConfig.secretArn,
            IdentityProviderProps: providerConfig.config
          })

          // Make sure the user pool client is created after the IDP
          userPoolClient.node.addDependency(idp);

        })()
      }
    }

    const identityPool = new cognitoIdentityPool.IdentityPool(
      this,
      "IdentityPool",
      {
        authenticationProviders: {
          userPools: [
            new cognitoIdentityPool.UserPoolAuthenticationProvider({
              userPool,
              userPoolClient,
            }),
          ],
        },
      }
    );

    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
    this.identityPool = identityPool;

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.identityPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolWebClientId", {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "UserPoolLink", {
      value: `https://${
        cdk.Stack.of(this).region
      }.console.aws.amazon.com/cognito/v2/idp/user-pools/${
        userPool.userPoolId
      }/users?region=${cdk.Stack.of(this).region}`,
    });

    /**
     * CDK NAG suppression
     */
    NagSuppressions.addResourceSuppressions(userPool, [
      {
        id: "AwsSolutions-COG1",
        reason:
          "Default password policy requires min length of 8, digits, lowercase characters, symbols and uppercase characters: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito.PasswordPolicy.html",
      },
      { id: "AwsSolutions-COG2", reason: "MFA not required for user usage." },
    ]);
  }
}
