import joi from "@hapi/joi";

interface Input {
    productId: string
    templateUrl: string
    name: string
    version: string
}

const schema = joi.object({
    productId: joi.string().required(),
    templateUrl: joi.string().required(),
    name: joi.string().required(),
    version: joi.string().required()
})

export const Validate =
    async (input) => await schema.validate<Input>(input)


