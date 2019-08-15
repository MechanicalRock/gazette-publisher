
export const RegionError = (bucketRegion, lambdaRegion) =>
    `Bucket region "${bucketRegion}" does not match region of lambda "${lambdaRegion}"`