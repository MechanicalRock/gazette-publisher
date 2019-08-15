import { ValidateInput, ValidateOutput } from "../../src/FindProduct/schema";

interface InputSchemaTestCase {
    description: string
    shouldThrow: boolean
    input: {
        bucket?: string
        key?: string
        region?: string
    }
}

interface OutputSchemaTestCase {
    description: string
    shouldThrow: boolean
    input: {
        products?: {
            values?: string[],
            count?: number
        },
        candidate: {
            productId?: string
            templateUrl?: string
            name?: string
            version?: string
        }

    }
}

const outputCases: OutputSchemaTestCase[] = [
    {
        description: "products can be supplied",
        shouldThrow: false,
        input: {
            products: {
                values: ["prod-1234"],
                count: 1
            },
            candidate: {
                productId: "prod-1234",
                templateUrl: "https://mytemplate.yaml",
                name: "myproduct",
                version: "v1"
            }
        }
    },
    {
        description: "products can be omitted",
        shouldThrow: false,
        input: {
            products: {
                values: [],
                count: 0
            },
            candidate: {
                templateUrl: "https://mytemplate.yaml",
                name: "myproduct",
                version: "v1"
            }
        }
    },
    {
        description: "templateUrl must be supplied",
        shouldThrow: true,
        input: {
            products: {
                values: ["prod-1234"],
                count: 1
            },
            candidate: {
                productId: "prod-1234",
                name: "myproduct",
                version: "v1"
            }
        }
    },
    {
        description: "name must be supplied",
        shouldThrow: true,
        input: {
            products: {
                values: ["prod-1234"],
                count: 1
            },
            candidate: {
                productId: "prod-1234",
                templateUrl: "https://mytemplate.yaml",
                version: "v1"
            }
        }
    },
    {
        description: "version must be supplied",
        shouldThrow: true,
        input: {
            products: {
                values: ["prod-1234"],
                count: 1
            },
            candidate: {
                productId: "prod-1234",
                templateUrl: "https://mytemplate.yaml",
                name: "myproduct"
            }
        }
    },
    {
        description: "count must be supplied",
        shouldThrow: true,
        input: {
            products: {
                values: ["prod-1234"],
                count: 1
            },
            candidate: {
                productId: "prod-1234",
                templateUrl: "https://mytemplate.yaml",
                name: "myproduct"
            }
        }
    },
    {
        description: "products must be supplied",
        shouldThrow: true,
        input: {
            candidate: {
                templateUrl: "https://mytemplate.yaml",
                name: "myproduct",
                version: "v1"
            }
        }
    }
];

const inputCases: InputSchemaTestCase[] = [
    {
        description: "bucket must be supplied",
        shouldThrow: true,
        input: {
            key: "akey",
            region: "us-east-1"
        }
    },
    {
        description: "Success",
        shouldThrow: false,
        input: {
            bucket: "abucket",
            key: "akey",
            region: "us-east-1"
        }
    },
    {
        description: "key must be supplied",
        shouldThrow: true,
        input: {
            bucket: "abucket",
            region: "us-east-1"
        }
    },
    {
        description: "region must be supplied",
        shouldThrow: true,
        input: {
            bucket: "abucket",
            key: "akey",
        }
    },
];

describe("FindProduct:", () => {
    describe("Schema:", () => {
        inputCases.forEach(c => {
            it(c.description, async (done) => {
                try {
                    await ValidateInput(c.input);
                    if (c.shouldThrow) {
                        done.fail(`Validation should have thrown an error`)
                    }
                } catch (err) {
                    if (!c.shouldThrow) {
                        done.fail(`Validation should not have thrown an error`)
                    }
                }
                done()
            })
        })

        outputCases.forEach(c => {
            it(c.description, async (done) => {
                try {
                    await ValidateOutput(c.input);
                    if (c.shouldThrow) {
                        done.fail(`Validation should have thrown an error`)
                    }
                } catch (err) {
                    if (!c.shouldThrow) {
                        done.fail(`Validation should not have thrown an error: ${err}`)
                    }
                }
                done()
            })
        })
    })
});
