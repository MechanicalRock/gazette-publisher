import { ServiceCatalog } from "aws-sdk";
import { Tag } from "aws-sdk/clients/servicecatalog"

interface Params {
    name: string;
    version: string;
    owner: string;
    templateUrl: string;
    token: string;
    tags?: Tag[]
}

export async function CreateProduct(catalog: ServiceCatalog, params: Params) {
    const {
        ProductViewDetail: { ProductViewSummary: { ProductId } },
        ProvisioningArtifactDetail
    } = await catalog
        .createProduct({
            Name: params.name,
            Owner: params.owner,
            ProductType: "CLOUD_FORMATION_TEMPLATE",
            IdempotencyToken: params.token,
            ProvisioningArtifactParameters: {
                Name: params.version,
                Type: "CLOUD_FORMATION_TEMPLATE",
                Info: {
                    LoadTemplateFromURL: params.templateUrl
                }
            },
            Tags: params.tags,
        })
        .promise();

    return {
        productId: ProductId,
        name: params.name,
        version: params.version
    }
}
