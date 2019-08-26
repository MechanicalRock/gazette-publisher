import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { FindProducts, ParseFromKey } from "../../src/FindProduct/lib";
import { CreateProduct } from "../../src/CreateProduct/lib";
import { CreateVersion } from "../../src/CreateVersion/lib";
import { TagSet } from "aws-sdk/clients/s3";

type TagFilters = { Key: string, Values: string[]}[]

function ToTagFilters (tagSet: TagSet): TagFilters {
    return tagSet.map( ( { Key, Value } ) => ({ Key, Values: [ Value ] }))
}

const prefix = id => `gazette-test-${id}`;

export async function GivenAnExistingProduct(
    catalog: ServiceCatalog,
    s3: S3,
    rg: ResourceGroups,
    guid: string
) {
    const { region } = config;

    const id = prefix(guid);

    const tags: TagSet = [
        {
            Key: "ExecutionId",
            Value: guid
        }
    ];

    await CreateTagResourceGroup(rg, id, ...ToTagFilters(tags));

    await CreateTaggedBucket(s3, id, ...tags);

    const key = `${guid}/v1.json`;

    await UploadTaggedTemplate(s3, id, key, DUMMY);

    const { name, version } = ParseFromKey(key);
    return await CreateProduct(catalog, {
        name,
        version,
        owner: "",
        templateUrl: `https://${id}.s3-${region}.amazonaws.com/${key}`,
        token: `${name}`,
        tags
    });
}

export async function WhenICreateANewVersionOfTheProduct(
    catalog: ServiceCatalog,
    s3: S3,
    guid: string
) {
    const { region } = config;

    const id = prefix(guid);

    const { products, count } = await FindProducts(catalog, guid);
    if (count === 0) {
        throw new Error("Product does not exist");
    }

    const key = `${guid}/v2.json`;
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

async function CreateTaggedBucket(s3: S3, Bucket: string, ...TagSet: TagSet) {
    await s3.createBucket({ Bucket }).promise();
    await s3
        .putBucketTagging({
            Bucket,
            Tagging: {
                TagSet
            }
        })
        .promise();
    return Bucket;
}

async function CreateTagResourceGroup(
    rg: ResourceGroups,
    Name: string,
    ...TagFilters: TagFilters
) {
    await rg
        .createGroup({
            Name,
            ResourceQuery: {
                Type: "TAG_FILTERS_1_0",
                Query: JSON.stringify({
                    ResourceTypeFilters: ["AWS::AllSupported"],
                    TagFilters
                })
            }
        })
        .promise();
}
