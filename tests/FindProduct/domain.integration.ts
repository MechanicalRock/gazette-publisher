import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { v4 } from "uuid";
import { backOff } from "exponential-backoff";

import {
    GivenACatalogOfProducts,
    WhenISearchForAProductByName,
    ThenItShouldReturnAValidIdForTheProduct,
    ThenItShouldReturnUndefined
} from "./steps";

describe("Given a catalog of products", () => {
    config.region = "ap-southeast-2";

    let id;

    const catalog = new ServiceCatalog();
    const s3 = new S3();
    const rg = new ResourceGroups();

    beforeEach(async done => {
        id = v4();
        await GivenACatalogOfProducts(catalog, s3, rg, id);
        done();
    });

    describe("When I search for an existing product by name", () => {
        const expectedId = async () =>
            await backOff(() => WhenISearchForAProductByName(catalog, `${id}_1`), {
                numOfAttempts: 5,
                startingDelay: 1000,
                timeMultiple: 1.5
            });

        it(
            "Then it should return a valid ID for an existing product",
            () => ThenItShouldReturnAValidIdForTheProduct(expectedId()),
            20000
        );
    });

    describe("When I search for a product that does not exist by name", () => {
        const expectedId = async () =>
            await backOff(() => WhenISearchForAProductByName(catalog, `${id}_abc`), {
                numOfAttempts: 5,
                startingDelay: 1000,
                timeMultiple: 1.5
            });

        it(
            "Then it should return undefined for a product",
            () => ThenItShouldReturnUndefined(expectedId()),
            20000
        );
    });
});
