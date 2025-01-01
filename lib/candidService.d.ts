import { HttpAgent } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
export declare abstract class CandidService {
    protected createServiceClient<T>(factory: IDL.InterfaceFactory, canisterId: string, host: string, agent: HttpAgent): T;
    protected handleResponse<From, To>(service: Promise<From>, mapper: (from: From) => To, args?: unknown): Promise<To>;
    constructor();
}
