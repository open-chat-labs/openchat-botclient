import { CandidService } from "../candidService";
import type { ExecuteBotCommandResponse, MessageContent } from "./candid/types";
export type BotClientConfig = {
    botGatewayCanisterId: string;
    openStorageCanisterId: string;
    icHost: string;
    identityPrivateKey: string;
};
export declare class BotClient extends CandidService {
    #private;
    private config;
    constructor(config: BotClientConfig);
    sendImageMessage(jwt: string, finalised: boolean, canisterId: string, imageData: Uint8Array, mimeType: string, width: number, height: number, caption?: string): Promise<ExecuteBotCommandResponse>;
    sendTextMessage(jwt: string, finalised: boolean, text: string): Promise<ExecuteBotCommandResponse>;
    executeCommand(jwt: string, messageContent: MessageContent, finalised: boolean): Promise<ExecuteBotCommandResponse>;
}
