import { Handler } from "aws-lambda";
import { ServiceCatalog } from "aws-sdk";
import { captureAWSClient } from "aws-xray-sdk";
import { Validate } from "./schema";
import { CreateVersion } from "./lib";

export const handler: Handler = async (event, context) => {
    const payload = await Validate(event);

    const catalog: ServiceCatalog = captureAWSClient(new ServiceCatalog());

    const params = { token: context.awsRequestId, ...payload };

    await CreateVersion(catalog, params);

    return {
        productId: payload.productId,
        name: payload.name,
        version: payload.version
    }
}
