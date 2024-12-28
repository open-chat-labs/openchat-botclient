import type { IDL } from "@dfinity/candid";
export declare abstract class CandidService {
    #private;
    protected createServiceClient<T>(factory: IDL.InterfaceFactory, canisterId: string, host: string): T;
    protected handleResponse<From, To>(service: Promise<From>, mapper: (from: From) => To, args?: unknown): Promise<To>;
    constructor(privateKey: string);
}
