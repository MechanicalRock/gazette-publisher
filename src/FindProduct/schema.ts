import joi from "@hapi/joi";

interface Input {
    bucket: string
    key: string
    region: string
}

interface Output {
    products: string[]
    templateUrl: string
    name: string
    version: string
}

const inputSchema = joi.object({
    bucket: joi.string().required(),
    key: joi.string().required(),
    region: joi.string().required()
});

const outputSchema = joi.object({
    products: joi.object({
        values: joi
            .array()
            .items(joi.string().optional())
            .min(0)
            .required(),
        count: joi
            .number()
            .allow(0)
            .positive()
            .required()
    }).required(),
    candidate: joi.object({
        productId: joi.string().optional(),
        templateUrl: joi.string().required(),
        name: joi.string().required(),
        version: joi.string().required()
    }).required()
});

export const ValidateInput =
    async (input) => await inputSchema.validate<Input>(input)

export const ValidateOutput =
    async (output) => await outputSchema.validate<Output>(output)

