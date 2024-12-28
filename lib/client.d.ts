import type { Theme } from "./theme";
export type OpenChatEmbedClient = {
    username: string;
    theme: Theme;
};
import { CandidService } from "./candidService";
import type { ExecuteBotCommandResponse, MessageContent } from "./candid/types";
export declare class BotClient extends CandidService {
    #private;
    constructor(privateKey: string, canisterId: string, host: string);
    sendTextMessage(text: string, jwt: string, finalised: boolean): Promise<unknown>;
    executeCommand(jwt: string, messageContent: MessageContent, finalised: boolean): Promise<ExecuteBotCommandResponse>;
}
