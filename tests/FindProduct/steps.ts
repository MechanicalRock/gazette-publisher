import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { ParseFromKey, FindProducts } from "../../src/FindProduct/lib";
import { TagSet } from "aws-sdk/clients/s3"
import { CreateProduct } from "../../src/CreateProduct/lib";

type TagFilters = { Key: string, Values: string[]}[]

function ToTagFilters (tagSet: TagSet): TagFilters {
    return tagSet.map( ( { Key, Value } ) => ({ Key, Values: [ Value ] }))
}

const prefix = id => `gazette-test-${id}`;

export async function GivenACatalogOfProducts(
    catalog: ServiceCatalog,
    s3: S3,
    rg: ResourceGroups,
    guid: string
) {
    const { region } = config;

    const id = prefix(guid)

    const tags: TagSet = [
        {
            Key: "ExecutionId",
            Value: guid,
        }
    ]

    await CreateTagResourceGroup(rg, id, ...ToTagFilters(tags));

    await CreateTaggedBucket(s3, id, ...tags);

    const keys = new Array(2).fill(0).map((_, idx) => `${guid}_${idx}/v1.json`);
    await Promise.all(
        keys.map(key => UploadTaggedTemplate(s3, id, key, DUMMY))
    );

    await Promise.all(
        keys.map(key => {
            const { name, version } = ParseFromKey(key);
            return CreateProduct(catalog, {
                name,
                version,
                owner: "",
                templateUrl: `https://${id}.s3-${region}.amazonaws.com/${key}`,
                token: `${name}`,
                tags
            });
        })
    );
}

export async function WhenISearchForAProductByName(
    catalog: ServiceCatalog,
    name: string
) {
    const { products, count } = await FindProducts(catalog, name);
    if (count === 0) {
        throw new Error("Product could not be found");
    }
    return products[0];
}

export async function ThenItShouldReturnAValidIdForTheProduct(id: Promise<string>) {
    await expect(id).resolves.toMatch(/prod-.+/);
}

export async function ThenItShouldReturnUndefined(id: Promise<string>) {
    await expect(id).rejects.toThrowError();
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
                TagSet,
            }
        })
        .promise();
    return Bucket;
}

async function CreateTagResourceGroup(rg: ResourceGroups, Name: string, ...TagFilters: TagFilters) {
    await rg
        .createGroup({
            Name,
            ResourceQuery: {
                Type: "TAG_FILTERS_1_0",
                Query: JSON.stringify({
                    ResourceTypeFilters: ["AWS::AllSupported"],
                    TagFilters,
                })
            }
        })
        .promise();
}
