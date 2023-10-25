import {describe,it,expect} from "vitest";

describe('splitPayload splits payload into chunks of 100 items or less', () => {
    it('splits payload into chunks of 100 items or less', () => {
        const payload = Array.from(Array(500).keys());
        const payloadChunks = splitPayload(payload);
        expect(payloadChunks.length).toBe(10);
        payloadChunks.forEach(chunk => {
            expect(chunk.length).toBeLessThanOrEqual(100);
        });
    });

});
