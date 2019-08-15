import { Validate } from "../../src/CreateProduct/schema";

interface SchemaTestCase {
    description: string;
    shouldThrow: boolean;
    input: {
        productId?: string;
        templateUrl?: string;
        name?: string;
        version?: string;
    };
}

const cases: SchemaTestCase[] = [
    {
        description: "productId should not be supplied",
        shouldThrow: true,
        input: {
            productId: "prod-xyz",
            templateUrl: "https://mytemplate.yaml",
            name: "myproduct",
            version: "v1"
        }
    },
    {
        description: "Success",
        shouldThrow: false,
        input: {
            templateUrl: "https://mytemplate.yaml",
            name: "myproduct",
            version: "v1"
        }
    },
    {
        description: "templateUrl must be supplied",
        shouldThrow: true,
        input: {
            name: "myproduct",
            version: "v1"
        }
    },
    {
        description: "name must be supplied",
        shouldThrow: true,
        input: {
            templateUrl: "https://mytemplate.yaml",
            version: "v1"
        }
    },
    {
        description: "version must be supplied",
        shouldThrow: true,
        input: {
            templateUrl: "https://mytemplate.yaml",
            name: "myproduct"
        }
    }
];

describe("CreateProduct:", () => {
    describe("Schema:", () => {
        cases.forEach(c => {
            it(c.description, async done => {
                try {
                    await Validate(c.input);
                    if (c.shouldThrow) {
                        done.fail(`Validation should have thrown an error`);
                    }
                } catch (err) {
                    if (!c.shouldThrow) {
                        done.fail(`Validation should not have thrown an error`);
                    }
                }
                done();
            });
        });
    });
});
