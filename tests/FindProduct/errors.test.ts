import { RegionError } from "../../src/FindProduct/errors";

describe("FindProduct:", () => {
    describe("Errors:", () => {
        it("It should create format a region error message", () => {
            expect(RegionError("us-east-1", "ap-southeast-2")).toEqual(
                `Bucket region "us-east-1" does not match region of lambda "ap-southeast-2"`
            );
        });
    });
});
