import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { FindProducts, ParseFromKey } from "../../src/FindProduct/lib";
import { CreateProduct } from "../../src/CreateProduct/lib";
import { CreateVersion } from "../../src/CreateVersion/lib";

export async function GivenAnExistingProduct(
    catalog: ServiceCatalog,
    s3: S3,
    rg: ResourceGroups,
    id: string
) {
    const { region } = config;

    await CreateTagResourceGroup(rg, id);

    await CreateTaggedBucket(s3, id);

    const key = `${id}/v1.json`;

    await UploadTaggedTemplate(s3, id, key, DUMMY);

    const { name, version } = ParseFromKey(key);
    return await CreateProduct(catalog, {
        name,
        version,
        owner: "",
        templateUrl: `https://${id}.s3-${region}.amazonaws.com/${key}`,
        token: `${name}`,
        tags: [{ Key: "ExecutionId", Value: id }]
    });
}

export async function WhenICreateANewVersionOfTheProduct(
    catalog: ServiceCatalog,
    s3: S3,
    id: string
) {
    const { region } = config;

    const { products, count } = await FindProducts(catalog, id);
    if (count === 0) {
        throw new Error("Product does not exist");
    }

    const key = `${id}/v2.json`;
    await UploadTaggedTemplate(s3, id, key, DUMMY);

    const { name, version } = ParseFromKey(key);

    await CreateVersion(catalog, {
        productId: products[0],
        templateUrl: `https://${id}.s3-${region}.amazonaws.com/${key}`,
        token: `${name}2`,
        version
    });
}

export async function ThenItShouldCreateANewVersionOfTheProduct(result: Promise<void>) {
    await expect(result).resolves.toBeUndefined();
}

const DUMMY = `
{
    "AWSTemplateFormatVersion": "2010-09-09",
    "Resources": {
        "Bucket": {
            "Type": "AWS::S3::Bucket"
        }
    }
}`;

async function UploadTaggedTemplate(
    s3: S3,
    bucket: string,
    key: string,
    template: string
) {
    await s3
        .putObject({
            Bucket: bucket,
            Body: template,
            Key: key
        })
        .promise();
}

async function CreateTaggedBucket(s3: S3, id: string) {
    await s3.createBucket({ Bucket: id }).promise();
    await s3
        .putBucketTagging({
            Bucket: id,
            Tagging: {
                TagSet: [{ Key: "ExecutionId", Value: id }]
            }
        })
        .promise();
}

async function CreateTagResourceGroup(rg: ResourceGroups, executionId: string) {
    await rg
        .createGroup({
            Name: executionId,
            ResourceQuery: {
                Type: "TAG_FILTERS_1_0",
                Query: JSON.stringify({
                    ResourceTypeFilters: ["AWS::AllSupported"],
                    TagFilters: [
                        {
                            Key: "ExecutionId",
                            Values: [executionId]
                        }
                    ]
                })
            }
        })
        .promise();
}
