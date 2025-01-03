import { describe, it, expect } from 'vitest';
import { getTokensInfo } from './token';

describe('getTokensInfo', () => {
    it('should return tokens info', async () => {
        const tokensInfo = await getTokensInfo(['0x9271a15bb6f3d488d8f0ad35e4d2dd0c0ac6b874', '0xfde81f197bb945da5f1bafe5598405d6ddd1230c']);
        expect(tokensInfo).toHaveLength(2);
        for (const tokenInfo of tokensInfo) {
            expect(tokenInfo).toHaveProperty('circulatingSupply');
            expect(tokenInfo).toHaveProperty('dexSupplyThresh');
            expect(tokenInfo).toHaveProperty('price');
            expect(tokenInfo).toHaveProperty('r');
            expect(tokenInfo).toHaveProperty('status');
            expect(tokenInfo).toHaveProperty('tokenVersion');
            expect(tokenInfo).toHaveProperty('progress');
            expect(tokenInfo).toHaveProperty('boundedProgress');
        }
    });
});