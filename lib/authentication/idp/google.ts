import {IdpInterface, UserPoolIdentityProviderProps} from "./idp-interface";
import {Construct} from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {SecretValue} from 'aws-cdk-lib';
import {UserPoolIdentityProviderBase} from "aws-cdk-lib/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base";
import {ProviderAttribute} from "aws-cdk-lib/aws-cognito";

export class Google extends Construct implements IdpInterface {

    readonly attributeMapping: any;

    constructor(scope: Construct, id: string) {
        super(scope, id);
    }

    add(props: UserPoolIdentityProviderProps): UserPoolIdentityProviderBase {

        const secretClientId = SecretValue.secretsManager(props.secretCompleteArn, {jsonField: "clientId"} )
        const secretClientSecret = SecretValue.secretsManager(props.secretCompleteArn, {jsonField: "clientSecret"} )

        const config = {
            ...props.IdentityProviderProps,
            userPool: props.userPool,
            clientId: secretClientId.unsafeUnwrap(),
            clientSecretValue: secretClientSecret,
            attributeMapping: {
                email: ProviderAttribute.GOOGLE_EMAIL
            }
        }

        return new cognito.UserPoolIdentityProviderGoogle(this, this.getName(), config);
    }

    getName(): string {
        return 'Google'
    }
}
