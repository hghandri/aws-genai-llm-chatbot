import {
    UserPool, UserPoolIdentityProviderAmazonProps, UserPoolIdentityProviderAppleProps,
    UserPoolIdentityProviderFacebookProps,
    UserPoolIdentityProviderGoogleProps, UserPoolIdentityProviderOidcProps
} from "aws-cdk-lib/aws-cognito";
import {UserPoolIdentityProviderBase} from "aws-cdk-lib/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base";

export interface UserPoolIdentityProviderProps {
    userPool: UserPool,
    secretCompleteArn: string;
    IdentityProviderProps: any
}

export interface IdpInterface {
    add(config: UserPoolIdentityProviderProps): UserPoolIdentityProviderBase
    getName(): string
}
