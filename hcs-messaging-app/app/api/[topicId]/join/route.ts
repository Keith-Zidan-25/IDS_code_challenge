import { NextResponse, NextRequest } from "next/server";
import environmentSetup from "@/utils/setup";
import { TopicMessageQuery } from "@hashgraph/sdk";

export async function GET(request: NextRequest, 
    { params }: { params: { topicId: string }}
) {
    try {
        const topicId = await params.topicId;
        const client = await environmentSetup();

        if (!topicId) {
            return NextResponse.json({}, {status: 404, statusText: "TopicId not found"});
        }
        new TopicMessageQuery()
            .setTopicId(topicId)
            .subscribe(client, null, (message) => {
                const messageAsString = Buffer.from(message.contents.toString(), "utf8").toString();
                console.log(`${message.consensusTimestamp.toDate()} Received: ${messageAsString}`);
                client.close();
            });
            
        return NextResponse.json(topicId, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500, statusText: "Unknown Error" });
    }
}