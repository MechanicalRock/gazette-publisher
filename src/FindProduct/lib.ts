import { ServiceCatalog } from "aws-sdk";

export function ParseFromKey(key: string) {
    const re = /^(?<name>[\w-]+)\/(?<version>\w+)\.(yaml|yml|json)$/;
    const match = re.exec(key);
    return {
        name: match.groups.name,
        version: match.groups.version
    };
}

export async function FindProducts(sc: ServiceCatalog, name: string) {
    const products: string[] = [];
    for await (const p of SearchProducts(sc, name)) {
        const { ProductId, Name } = p.ProductViewSummary;
        if (name === Name) {
            products.push(ProductId);
        }
    }
    return { products, count: products.length };
}

async function* SearchProducts(sc: ServiceCatalog, name: string) {
    let morePages;
    do {
        const { ProductViewDetails, NextPageToken } = await sc
            .searchProductsAsAdmin({
                Filters: {
                    FullTextSearch: [name]
                },
                PageToken: morePages
            })
            .promise();

        for (const p of ProductViewDetails) {
            yield p;
        }

        morePages = NextPageToken;
    } while (morePages);
}
