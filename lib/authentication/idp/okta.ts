import {IdpInterface, UserPoolIdentityProviderProps} from "./idp-interface";
import {Construct} from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {SecretValue} from 'aws-cdk-lib';
import {UserPoolIdentityProviderBase} from "aws-cdk-lib/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base";
import {ProviderAttribute, UserPoolIdentityProviderOidcProps} from "aws-cdk-lib/aws-cognito";

export class Okta extends Construct implements IdpInterface {

    readonly attributeMapping: any;

    constructor(scope: Construct, id: string) {
        super(scope, id);
    }

    add(props: UserPoolIdentityProviderProps): UserPoolIdentityProviderBase {

        const identityProvider: UserPoolIdentityProviderOidcProps = props.IdentityProviderProps

        const secretClientId = SecretValue.secretsManager(props.secretCompleteArn, {jsonField: "clientId"} )
        const secretClientSecret = SecretValue.secretsManager(props.secretCompleteArn, {jsonField: "clientSecret"} )

        const config = {
            ...identityProvider,
            providerName: this.getName(),
            userPool: props.userPool,
            clientId: secretClientId.unsafeUnwrap(),
            clientSecret: secretClientSecret.unsafeUnwrap(),
        }

        return new cognito.UserPoolIdentityProviderOidc(this, this.getName(), config);
    }

    getName(): string {
        return 'okta'
    }
}
