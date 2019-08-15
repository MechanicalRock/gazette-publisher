import { Validate } from "../../src/EventAdaptor/schema";

interface SchemaTestCase {
    description: string
    shouldThrow: boolean,
    input: string//{
    //     productId?: string
    //     name?: string
    //     version?: string
    // }
}

const cases: SchemaTestCase[] = [
    {
        description: "productId should be supplied",
        shouldThrow: true,
        input: JSON.stringify({
            name: "myproduct",
            version: "v1"
        })
    },
    {
        description: "Success",
        shouldThrow: false,
        input: JSON.stringify({
            productId: "prod-xyz",
            name: "myproduct",
            version: "v1"
        })
    },
    {
        description: "name must be supplied",
        shouldThrow: true,
        input: JSON.stringify({
            productId: "prod-xyz",
            version: "v1"
        })
    },
    {
        description: "version must be supplied",
        shouldThrow: true,
        input: JSON.stringify({
            productId: "prod-xyz",
            name: "myproduct",
        })
    },
]

describe("CreateProduct:", () => {
    describe("Schema:", () => {
        cases.forEach(c => {
            it(c.description, async (done) => {
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
            })
        })
    })
})
