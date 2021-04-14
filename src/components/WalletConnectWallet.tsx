import WalletConnectClient, { CLIENT_EVENTS, SESSION_EMPTY_PERMISSIONS } from "@walletconnect/client";
import { SessionTypes, ClientTypes, } from "@walletconnect/types";
import { Box, Button, Grid, Heading, Image, Layer, Text, TextArea } from 'grommet';
import React, { useEffect, useState } from 'react';


interface Props {
    uri: string
}

interface CustomPayload {
    id: number
    jsonrpc: string
    method: string
    params: {
        url: string
        dataType: string
    }
}

export const WalletConnectWallet: React.FC<Props> = ({ ...props }) => {
    const [client, setClient] = useState<WalletConnectClient>();
    const [proposal, setProposal] = useState<SessionTypes.Proposal>();
    const [payloadApproval, setPayloadApproval] = useState<{ payloadEvent: SessionTypes.PayloadEvent, session: SessionTypes.Settled }>();
    const [data] = useState([
        {
            type: "wife",
            name: "Kari Nordmann",
            age: 34
        },
        {
            type: "child",
            name: "Siri Nordmann",
            age: 4
        }
    ]);
    const handlePayloadApproval = async (approve: boolean) => {
        if (!client) {
            throw Error("Cannot reponds to approval because client is now undefined")
        }
        if (!payloadApproval) {
            throw Error("Cannot reponds to payloadApproval because payloadApproval is now undefined")
        }

        const { payloadEvent, session } = payloadApproval
        if (approve) {
            const response: ClientTypes.RespondParams = {
                response: {
                    jsonrpc: payloadEvent.payload.jsonrpc,
                    id: payloadEvent.payload.id,
                    result: JSON.stringify(data),
                },
                topic: session.topic,
            }
            await client.respond(response)
        } else {
            const response: ClientTypes.RespondParams = {
                response: {
                    error: {
                        code: 200,
                        message: "Declined"
                    },
                    jsonrpc: payloadEvent.payload.jsonrpc,
                    id: payloadEvent.payload.id,
                },
                topic: session.topic
            }
            await client.respond(response)
        }
        setPayloadApproval(undefined)
    }

    const handlePropsal = async (approved: boolean) => {
        if (!client) {
            throw Error("Cannot reponds to approval because client is now undefined")
        }
        if (!proposal) {
            throw Error("Cannot reponds to approval because proposal is now undefined")
        }
        if (approved) {
            const response: SessionTypes.Response = {
                metadata: {
                    name: "Symfoni Wallet",
                    description: "A private enclave to interact with Symfoni nettwork",
                    url: "#",
                    icons: ["https://walletconnect.org/walletconnect-logo.png"],
                },
                state: {
                    accounts: ["0x1d85568eEAbad713fBB5293B45ea066e552A90De"],
                },
            }
            console.log("Approvei")
            const settled = await client.approve({ proposal, response });
        } else {
            await client.reject({ proposal });
        }
        setProposal(undefined)
    }

    useEffect(() => {
        let subscribed = true;
        if (!client) {
            const doAsync = async () => {
                const _client = await WalletConnectClient.init({
                    relayProvider: "ws://0.0.0.0:5555",
                    logger: "warn",
                    controller: true
                });

                if (subscribed) {
                    setClient(_client);
                }
            };
            doAsync();
        } else {
            client.on(
                CLIENT_EVENTS.session.proposal,
                async (proposal: SessionTypes.Proposal) => {
                    // user should be prompted to approve the proposed session permissions displaying also dapp metadata
                    console.log("session.proposal", proposal)
                    if (subscribed) {
                        setProposal(proposal)
                    }

                }
            );
            client.on(CLIENT_EVENTS.session.request, async (payloadEvent: (SessionTypes.PayloadEvent)) => {
                console.log("CLIENT_EVENTS.session.payload", payloadEvent)
                const payload = payloadEvent.payload as CustomPayload
                console.log(payload.method)
                console.log(payload.params)
                const session = await client.session.get(payloadEvent.topic);
                if (!session.permissions.jsonrpc.methods.includes("symfoni_getData")) {
                    throw Error("You have not approved requests for symfoni_getData in this session")
                }
                if (payload.method === "symfoni_getData") {
                    if (subscribed) {
                        setPayloadApproval({ payloadEvent, session })
                    }
                }

            })
            // client.on(
            //     CLIENT_EVENTS.session.created,
            //     async (session: SessionTypes.Created) => {
            //         // session created succesfully
            //         console.log("session", session)
            //         setTimeout(() => {
            //             console.log("DO something async")
            //         }, 3000)
            //     }
            // );
            client.pair({ uri: props.uri });
        }
        return () => {
            subscribed = false;
        };
    }, [client, props.uri]);

    return (
        <Box background="beige" margin="small" border="all">
            <Heading>Wallet</Heading>
            {proposal &&
                <Layer
                    onEsc={() => handlePropsal(false)}
                    onClickOutside={() => handlePropsal(false)}
                >
                    <Box pad="small" gap="small" margin="small">
                        <Heading level="3">Godkjenn tilkobling</Heading>
                        <Grid columns={["small", "flex"]} gap="small">
                            <Text>App</Text>
                            <Text>{proposal.proposer.metadata.name}</Text>
                            <Text>Beskrivelse</Text>
                            <Text>{proposal.proposer.metadata.description}</Text>
                        </Grid>
                        <Image src={proposal.proposer.metadata.icons[0]} fit="contain" height="100px"></Image>

                        <Button label="Godkjenn" onClick={() => handlePropsal(true)} />
                        <Button label="Avslå" onClick={() => handlePropsal(false)} />
                    </Box>
                </Layer>
            }

            {payloadApproval &&
                <Layer
                    onEsc={() => handlePayloadApproval(false)}
                    onClickOutside={() => handlePayloadApproval(false)}
                >
                    <Box pad="small" gap="small" margin="small">
                        <Heading level="3">Godkjenn dataforspørsel</Heading>
                        <Grid columns={["small", "flex"]} gap="small">
                            <Text>Hvem</Text>
                            <Text>{payloadApproval.session.peer.metadata.name}</Text>
                            <Text>Hva</Text>
                            <TextArea value={JSON.stringify(data)}></TextArea>
                        </Grid>

                        <Button label="Godkjenn" onClick={() => handlePayloadApproval(true)} />
                        <Button label="Avslå" onClick={() => handlePayloadApproval(false)} />
                    </Box>
                </Layer>
            }

        </Box>
    );
};
