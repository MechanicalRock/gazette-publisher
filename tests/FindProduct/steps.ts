import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { ParseFromKey, FindProducts } from "../../src/FindProduct/lib";
import { CreateProduct } from "../../src/CreateProduct/lib";

// add tags to create product
// list out resource groups
// delete the bucket and all objects
// delete the products

export async function GivenACatalogOfProducts(
    catalog: ServiceCatalog,
    s3: S3,
    rg: ResourceGroups,
    id: string
) {
    const { region } = config;

    await CreateTagResourceGroup(rg, id);

    await CreateTaggedBucket(s3, id);

    const keys = new Array(2).fill(0).map((_, idx) => `${id}_${idx}/v1.json`);
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
                tags: [{ Key: "ExecutionId", Value: id }]
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
