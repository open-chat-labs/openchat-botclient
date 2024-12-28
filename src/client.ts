import type { Theme } from "./theme";

export type OpenChatEmbedClient = {
    username: string;
    theme: Theme;
};

import { CandidService } from "./candidService";
import { type BotService, idlFactory } from "./candid/idl";
import type { ExecuteBotCommandResponse, MessageContent } from "./candid/types";

export class BotClient extends CandidService {
    #botService: BotService;

    constructor(privateKey: string, canisterId: string, host: string) {
        super(privateKey);
        this.#botService = this.createServiceClient<BotService>(idlFactory, canisterId, host);
    }

    sendTextMessage(text: string, jwt: string, finalised: boolean): Promise<unknown> {
        return this.executeCommand(
            jwt,
            {
                Text: { text },
            },
            finalised,
        );
    }

    executeCommand(
        jwt: string,
        messageContent: MessageContent,
        finalised: boolean,
    ): Promise<ExecuteBotCommandResponse> {
        return this.handleResponse(
            this.#botService.execute_bot_command({
                jwt,
                action: {
                    SendMessage: {
                        content: messageContent,
                        finalised,
                    },
                },
            }),
            (res) => {
                if (!("Ok" in res)) {
                    console.log("Hurrah!");
                }
                return res;
            },
        ).catch((err) => {
            console.error("Call to execute_command failed with: ", err);
            throw err;
        });
    }
}
