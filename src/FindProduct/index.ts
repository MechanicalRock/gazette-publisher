import { Handler } from "aws-lambda";
import { strictEqual } from "assert";
import { ServiceCatalog } from "aws-sdk";
import { captureAWSClient } from "aws-xray-sdk";
import { get } from "env-var";
import { FindProducts, ParseFromKey } from "./lib";
import { ValidateInput, ValidateOutput } from "./schema";
import { RegionError } from "./errors"

export const handler: Handler = async (event) => {
    const { bucket, key, region: bucketRegion } = await ValidateInput(event);
    const region = get("AWS_REGION").required().asString();

    strictEqual(bucketRegion, region, RegionError(bucketRegion, region));

    const { name, version } = ParseFromKey(key);
    const catalog = captureAWSClient(new ServiceCatalog());

    const { products, count } = await FindProducts(catalog, name);

    return await ValidateOutput({
        products: {
            values: products,
            count
        },
        candidate: {
            productId: products[0],
            templateUrl: `https://${bucket}.s3-${region}.amazonaws.com/${key}`,
            name,
            version
        }
    });
}
