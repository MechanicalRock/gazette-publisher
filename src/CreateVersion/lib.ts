import { ServiceCatalog } from "aws-sdk";

interface Params {
    productId: string
    version: string
    templateUrl: string
    token: string
}

export async function CreateVersion(catalog: ServiceCatalog, params: Params) {
    const { ProvisioningArtifactDetail } = await catalog.createProvisioningArtifact({
        ProductId: params.productId,
        IdempotencyToken: params.token,
        Parameters: {
            Name: params.version,
            Type: "CLOUD_FORMATION_TEMPLATE",
            Info: {
                LoadTemplateFromURL: params.templateUrl
            }
        }
    }).promise();
}
