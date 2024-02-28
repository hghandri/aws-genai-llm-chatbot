import {Construct} from "constructs";
import {IdpInterface} from "./idp/idp-interface";

export class IdpLoader extends Construct {

    availableIdp: IdpInterface[]
    idpSupports = ['Google', 'Facebook', 'Amazon', 'Apple', 'Okta']

    constructor(scope: Construct, id: string) {
        super(scope, id);
    }

    async get(idpName: string): Promise<IdpInterface> {
        const dynamicImport = await import(`./idp/${idpName.toLowerCase()}` as string)
        const idpInstance: IdpInterface = new dynamicImport[idpName](this, 'idp'+ idpName)
        return idpInstance
    }
}
