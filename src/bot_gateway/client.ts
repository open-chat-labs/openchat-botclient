import { HttpAgent } from "@dfinity/agent";
import { CandidService } from "../candidService";
import { type BotService, idlFactory } from "./candid/idl";
import type { ExecuteBotCommandResponse, MessageContent } from "./candid/types";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";

export type BotClientConfig = {
    botGatewayCanisterId: string;
    openStorageCanisterId: string;
    icHost: string;
    identityPrivateKey: string;
};

export class BotClient extends CandidService {
    #botService: BotService;
    #agent: HttpAgent;
    #identity: Secp256k1KeyIdentity;

    constructor(config: BotClientConfig) {
        super();
        this.#identity = this.#createIdentity(config.identityPrivateKey);
        console.log("Principal: ", this.#identity.getPrincipal().toText());
        this.#agent = new HttpAgent({
            identity: this.#identity,
            host: config.icHost,
            retryTimes: 5,
        });

        this.#botService = this.createServiceClient<BotService>(
            idlFactory,
            config.botGatewayCanisterId,
            config.icHost,
            this.#agent,
        );
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

    sendImageMessage(
        text: string,
        jwt: string,
        finalised: boolean,
    ): Promise<ExecuteBotCommandResponse> {
        return this.executeCommand(
            jwt,
            {
                Text: { text },
            },
            finalised,
        );
    }

    sendTextMessage(
        text: string,
        jwt: string,
        finalised: boolean,
    ): Promise<ExecuteBotCommandResponse> {
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
