import { Handler } from "aws-lambda";
import { EventBridge } from "aws-sdk";
import { captureAWSClient } from "aws-xray-sdk";
import { get } from "env-var";
import { Validate } from "./schema";

export const handler: Handler = async (event) => {
    const BucketArn = get("BUCKET_ARN").required().asString();
    const EventBusName = get("EVENT_BUS").required().asString();
    const eventBridge: EventBridge = captureAWSClient(new EventBridge());
    return await eventBridge.putEvents({
        Entries: [
            {
                EventBusName,
                Source: "gazette",
                DetailType: "publisher.Created",
                Resources: [ BucketArn ],
                Detail: JSON.stringify(await Validate(event))
            }
        ]
    }).promise();
}
