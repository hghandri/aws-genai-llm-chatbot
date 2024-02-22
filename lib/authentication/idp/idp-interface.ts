import {
    UserPool, UserPoolIdentityProviderAmazonProps, UserPoolIdentityProviderAppleProps,
    UserPoolIdentityProviderFacebookProps,
    UserPoolIdentityProviderGoogleProps
} from "aws-cdk-lib/aws-cognito";
import {UserPoolIdentityProviderBase} from "aws-cdk-lib/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base";

export interface UserPoolIdentityProviderProps {
    userPool: UserPool,
    secretCompleteArn: string;
    IdentityProviderProps: UserPoolIdentityProviderGoogleProps | UserPoolIdentityProviderFacebookProps | UserPoolIdentityProviderAmazonProps | UserPoolIdentityProviderAppleProps
}

export interface IdpInterface {
    add(config: UserPoolIdentityProviderProps): UserPoolIdentityProviderBase
    getName(): string
}
