import { S3, ServiceCatalog, ResourceGroups, config } from "aws-sdk";
import { v4 } from "uuid";
import { backOff } from "exponential-backoff";

import {
    GivenAnExistingProduct,
    WhenICreateANewVersionOfTheProduct,
    ThenItShouldCreateANewVersionOfTheProduct
} from "./steps";

describe("Given an existing product", () => {
    config.region = "ap-southeast-2";

    let id;

    const catalog = new ServiceCatalog();
    const s3 = new S3();
    const rg = new ResourceGroups();

    beforeEach(async done => {
        id = v4();
        await GivenAnExistingProduct(catalog, s3, rg, id);
        done();
    });

    describe("When I create a new version of the product", () => {
        const result = async () =>
            await backOff(() => WhenICreateANewVersionOfTheProduct(catalog, s3, id), {
                numOfAttempts: 5,
                startingDelay: 1000,
                timeMultiple: 1.5
            });

        it(
            "Then it should create a new version of the product",
            () => ThenItShouldCreateANewVersionOfTheProduct(result()),
            20000
        );
    });
});
