import { HttpAgent } from "@dfinity/agent";
import { CandidService } from "../candidService";
import { type BotService, idlFactory } from "./candid/idl";
import type { ExecuteBotCommandResponse, MessageContent } from "./candid/types";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { DataClient } from "../data/data.client";
import { Principal } from "@dfinity/principal";
import type { Chat } from "../storageIndex/candid/types";

export type BotClientConfig = {
    botGatewayCanisterId: string;
    openStorageCanisterId: string;
    icHost: string;
    identityPrivateKey: string;
    chatId: Chat;
};

export class BotClient extends CandidService {
    #botService: BotService;
    #agent: HttpAgent;
    #identity: Secp256k1KeyIdentity;

    constructor(private config: BotClientConfig) {
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

    #extractCanisterFromChat() {
        if ("Group" in this.config.chatId) {
            return this.config.chatId.Group.toString();
        } else if ("Channel" in this.config.chatId) {
            return this.config.chatId.Channel[0].toString();
        }
        return "";
    }

    sendImageMessage(
        jwt: string,
        finalised: boolean,
        imageData: Uint8Array,
        mimeType: string,
        width: number,
        height: number,
        caption?: string,
    ): Promise<ExecuteBotCommandResponse> {
        const dataClient = new DataClient(this.#agent, this.config);
        const canisterId = this.#extractCanisterFromChat();
        console.log("Upload canister: ", canisterId);
        const uploadContentPromise = dataClient.uploadData([canisterId], mimeType, imageData);

        return uploadContentPromise.then((blobRef) => {
            return this.executeCommand(
                jwt,
                {
                    Image: {
                        height,
                        mime_type: mimeType,
                        blob_reference: [
                            {
                                blob_id: blobRef.blobId,
                                canister_id: Principal.fromText(blobRef.canisterId),
                            },
                        ],
                        thumbnail_data: "",
                        caption: caption ? [caption] : [],
                        width,
                    },
                },
                finalised,
            );
        });
    }

    sendTextMessage(
        jwt: string,
        finalised: boolean,
        text: string,
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
