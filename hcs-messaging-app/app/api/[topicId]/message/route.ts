import { NextResponse, NextRequest } from "next/server";
import environmentSetup from "@/utils/setup";
import { TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { decryptMessage } from "@/utils/aes";

interface responseT {
    messages: {
      chunk_info: null | string | undefined,
      consensus_timestamp: string,
      message: string,
      payer_account_id: string,
      running_hash: string,
      running_hash_version: number,
      sequence_number: number,
      topic_id: string
    }[],
    links: {
        next: null | string | undefined
    }
}
async function responseMapper(data: responseT) {
    const messages = data.messages;
    const result = [];

    for (const value of messages) {
        const decryptedtext = await decryptMessage(value.message);
        const mapped = {
            id: value.sequence_number,
            sender: value.payer_account_id,
            text: decryptedtext,
            timestamp: value.consensus_timestamp
        }

        result.push(mapped);
    }

    return result;
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ topicId: string }> }
) {
    try {
        const client = await environmentSetup();
        const {topicId} = await context.params;
        const message = await request.json();
        console.log("Message Sent: ",message)

        if (!message || !topicId) {
            console.log(message, topicId);
            return NextResponse.json({}, { status: 404, statusText: "Missing parameters"});
        }
        const response = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: message,
        }).execute(client);

        const getReceipt = await response.getReceipt(client);
        const status = getReceipt.status;
        console.log(status.toString());

        return NextResponse.json(status, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, { status: 500, statusText: "Unknown Error" });
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ topicId: string }> }
) {
    try {
        const {topicId} = await context.params;
        const MirrorNodeApiUrl = process.env.MIRROR_NODE_API;

        if (!topicId) {
            return NextResponse.json({}, { status: 404, statusText: "Missing Parameters" });
        }
        const response = await fetch(`${MirrorNodeApiUrl}/topics/${topicId}/messages?encoding=utf8&order=asc`);
        const result =  await response.json();

        if (!response.ok) {
            throw new Error(result._status.messages[0].message);
        }

        const finalMessageData = await responseMapper(result);
        return NextResponse.json(finalMessageData, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error, { status: 500, statusText: "Unknown Error" });
    }
}