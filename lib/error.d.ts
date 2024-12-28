export declare class HttpError extends Error {
    code: number;
    constructor(code: number, error: Error);
}
export declare class DestinationInvalidError extends HttpError {
    constructor(error: Error);
}
export declare class AuthError extends HttpError {
    code: number;
    constructor(code: number, error: Error);
}
export declare class ReplicaNotUpToDateError extends Error {
    static byTimestamp(replicaTimestamp: bigint, clientTimestamp: bigint, failedPostCheck: boolean): ReplicaNotUpToDateError;
    private constructor();
}
export declare function toCanisterResponseError(error: Error): HttpError | ReplicaNotUpToDateError;
