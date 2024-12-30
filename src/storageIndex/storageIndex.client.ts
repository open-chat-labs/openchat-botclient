import type { HttpAgent } from "@dfinity/agent";
import {
    idlFactory,
    type CandidAllocatedBucketResponse,
    type StorageIndexService,
} from "./candid/idl";
import { CandidService } from "../candidService";

export class StorageIndexClient extends CandidService {
    private service: StorageIndexService;

    constructor(agent: HttpAgent, canisterId: string, icHost: string) {
        super();

        this.service = this.createServiceClient<StorageIndexService>(
            idlFactory,
            canisterId,
            icHost,
            agent,
        );
    }

    allocatedBucket(
        fileHash: Uint8Array,
        fileSize: bigint,
        fileIdSeed: bigint | undefined,
    ): Promise<CandidAllocatedBucketResponse> {
        return this.handleResponse(
            this.service.allocated_bucket_v2({
                file_hash: fileHash,
                file_size: fileSize,
                file_id_seed: fileIdSeed === undefined ? [] : [fileIdSeed],
            }),
            (resp) => resp,
        );
    }
}
