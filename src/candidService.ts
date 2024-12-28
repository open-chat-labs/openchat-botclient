import { Actor, HttpAgent } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { toCanisterResponseError } from "./error";

export abstract class CandidService {
    protected createServiceClient<T>(
        factory: IDL.InterfaceFactory,
        canisterId: string,
        host: string,
    ): T {
        const agent = new HttpAgent({
            identity: this.#identity,
            host,
            retryTimes: 5,
        });
        const isMainnet = host.includes("icp-api.io");
        if (!isMainnet) {
            agent.fetchRootKey();
        }
        return Actor.createActor<T>(factory, {
            agent,
            canisterId,
        });
    }

    protected handleResponse<From, To>(
        service: Promise<From>,
        mapper: (from: From) => To,
        args?: unknown,
    ): Promise<To> {
        return service.then(mapper).catch((err) => {
            console.log(err, args);
            throw toCanisterResponseError(err as Error);
        });
    }

    #createIdentity(privateKey: string) {
        const privateKeyPem = privateKey.replace(/\\n/g, "\n");
        try {
            return Secp256k1KeyIdentity.fromPem(privateKeyPem);
        } catch (err) {
            console.error("Unable to create identity from private key", err);
            throw err;
        }
    }

    #identity: Secp256k1KeyIdentity;

    constructor(privateKey: string) {
        this.#identity = this.#createIdentity(privateKey);
        console.log("Principal: ", this.#identity.getPrincipal().toText());
    }
}
