import { externalApiHandler } from "./externalApiHandler";

export async function POST() {
    return externalApiHandler(
        process.env.APP_API_URL!,
        "APP_CLIENT_ID",
        "APP_CLIENT_SECRET"
    );
}
