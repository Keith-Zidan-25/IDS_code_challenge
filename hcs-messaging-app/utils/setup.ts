import { Client, Hbar } from "@hashgraph/sdk";

let client: Client | null = null;
export default async function environmentSetup() {
    const accountId = process.env.ACCOUNT_ID;
    const privateKey = process.env.PRIVATE_KEY;

    if (!accountId || !privateKey) {
        throw new Error("AccountID or Private Key missing");
    }

    if (client) {
        return client;
    }

    client = Client.forTestnet()
                    .setOperator(accountId, privateKey)
    return client;
}