import { NextRequest, NextResponse } from "next/server";
import environmentSetup from "../../../utils/setup";
import { TopicCreateTransaction, TopicMessageQuery } from "@hashgraph/sdk";

export async function GET(request: NextRequest) {
    try {
        const client = await environmentSetup();
        const createTxResponse = await new TopicCreateTransaction().execute(client);
        const receipt = await createTxResponse.getReceipt(client);
        const topicId = receipt.topicId;

        if (!topicId) {
            return NextResponse.json({}, { status: 400, statusText: "Topic creation failed" });
        }

        console.log("New topic created, TopicId: ", topicId);
        await new Promise((resolve) => setTimeout(resolve, 7000));
        
        new TopicMessageQuery()
            .setTopicId(topicId)
            .subscribe(client, null, (message) => {
                const messageAsString = Buffer.from(message.contents.toString(), "utf8").toString();
                console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
                client.close();
            });
            
        return NextResponse.json(topicId.toString(), { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500, statusText: "Unknown Error" });
    }
}