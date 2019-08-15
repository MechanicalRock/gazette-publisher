import joi from "@hapi/joi";


const schema = joi.object({
    productId: joi.string().required(),
    name: joi.string().required(),
    version: joi.string().required()
});

interface Payload {
    productId: string
    name: string
    version: string
}

export const Validate =
    async (payload) => 
        await schema.validate<Payload>(payload)


