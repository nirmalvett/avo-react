import * as Helper from '../HelperFunctions/Helpers'

describe("unique id", () => {
    it("should give a different id each time it is called", () => {
        for (let i = 0; i < 1000000; i++) {
            const key1 = Helper.uniqueKey();
            const key2 = Helper.uniqueKey();
            expect(key1).not.toEqual(key2)
        }
    })
})
