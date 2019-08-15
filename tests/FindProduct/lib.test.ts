import { ParseFromKey } from "../../src/FindProduct/lib";

interface ParseFromKeyCase {
    description: string;
    key: string;
    shouldThrow: boolean;
    output?: {
        name: string;
        version: string;
    };
}

const cases: ParseFromKeyCase[] = [
    {
        description: "Yaml Extension",
        key: "myproduct/v2.yaml",
        shouldThrow: false,
        output: {
            name: "myproduct",
            version: "v2"
        }
    },
    {
        description: "Yml Extension",
        key: "myproduct/v2.yml",
        shouldThrow: false,
        output: {
            name: "myproduct",
            version: "v2"
        }
    },
    {
        description: "Json Extension",
        key: "myproduct/v2.json",
        shouldThrow: false,
        output: {
            name: "myproduct",
            version: "v2"
        }
    },
    {
        description: "Incorrect format: too much nesting",
        key: "nested/myproduct/v2.json",
        shouldThrow: true
    },
    {
        description: "Incorrect format: too much nesting",
        key: "myproduct/v2/nested.json",
        shouldThrow: true
    },
    {
        description: "Incorrect format: No file extension",
        key: "myproduct/v2",
        shouldThrow: true
    }
];

describe("FindProduct:", () => {
    describe("ParseFromKey:", () => {
        cases.forEach(c => {
            it(c.description, () => {
                try {
                    const output = ParseFromKey(c.key);
                    if (c.shouldThrow) {
                        fail("Should have thrown an error");
                    }
                    expect(c.output).toStrictEqual(output);
                } catch (err) {
                    if (!c.shouldThrow) {
                        fail(`Should not have thrown an error: ${err.Message}`);
                    }
                }
            });
        });
    });
});
