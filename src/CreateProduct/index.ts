import { Handler } from "aws-lambda";
import { ServiceCatalog } from "aws-sdk";
import { captureAWSClient } from "aws-xray-sdk";
import { get } from "env-var";
import { Validate } from "./schema";
import { CreateProduct } from "./lib";

export const handler: Handler = async (event, context) => {
    const owner = get("OWNER")
        .required()
        .asString();

    const payload = await Validate(event);

    const catalog: ServiceCatalog = captureAWSClient(new ServiceCatalog());

    const params = { token: context.awsRequestId, owner, ...payload };

    return await CreateProduct(catalog, params);
};
