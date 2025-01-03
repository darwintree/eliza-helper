import { describe, it, expect } from 'vitest';
import { parseMetadata, getTokenCreateds, getTokenTransactions, SubgraphConfig } from './subgraph';

describe('parseMetadata', () => {
  it('should parse valid JSON metadata', () => {
    const validMeta = JSON.stringify({
      description: 'Test Token',
      image: 'https://example.com/image.png',
      website: 'https://example.com',
      x: 'https://x.com/test',
      telegram: 'https://t.me/test'
    });

    const result = parseMetadata(validMeta);
    expect(result).toEqual({
      description: 'Test Token',
      image: 'https://example.com/image.png',
      website: 'https://example.com',
      x: 'https://x.com/test',
      telegram: 'https://t.me/test'
    });
  });

  it('should handle partial metadata', () => {
    const partialMeta = JSON.stringify({
      description: 'Test Token',
      image: 'https://example.com/image.png'
    });

    const result = parseMetadata(partialMeta);
    expect(result).toEqual({
      description: 'Test Token',
      image: 'https://example.com/image.png',
      website: null,
      x: null,
      telegram: null
    });
  });

  it('should handle invalid JSON', () => {
    const invalidMeta = 'invalid-json';
    const result = parseMetadata(invalidMeta);
    expect(result).toEqual({
      description: '',
      image: 'invalid-json'
    });
  });
});

describe('Subgraph Queries', () => {
  const config: SubgraphConfig = {
    url: 'https://testnet.congraph.io/subgraphs/name/0x3d4fb1cf/meme-subgraph'
  };

  it('should fetch token createds', async () => {
    const tokens = await getTokenCreateds(config);
    expect(Array.isArray(tokens)).toBe(true);
    
    if (tokens.length > 0) {
      const token = tokens[0];
      expect(token).toHaveProperty('ts');
      expect(token).toHaveProperty('creator');
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('name');
      expect(token).toHaveProperty('symbol');
      expect(token).toHaveProperty('meta');
      expect(token.meta).toHaveProperty('description');
      expect(token.meta).toHaveProperty('image');
    }
  });

  it('should fetch token transactions', async () => {
    // Use a known token address from your subgraph
    const tokenAddress = '0x1234567890123456789012345678901234567890';
    const transactions = await getTokenTransactions(config, tokenAddress);
    
    expect(transactions).toHaveProperty('tokenBoughts');
    expect(transactions).toHaveProperty('tokenSolds');
    expect(Array.isArray(transactions.tokenBoughts)).toBe(true);
    expect(Array.isArray(transactions.tokenSolds)).toBe(true);

    if (transactions.tokenBoughts.length > 0) {
      const buy = transactions.tokenBoughts[0];
      expect(buy).toHaveProperty('id');
      expect(buy).toHaveProperty('ts');
      expect(buy).toHaveProperty('eth');
      expect(buy).toHaveProperty('amount');
      expect(buy).toHaveProperty('postPrice');
      expect(buy).toHaveProperty('buyer');
      expect(buy).toHaveProperty('token');
    }

    if (transactions.tokenSolds.length > 0) {
      const sell = transactions.tokenSolds[0];
      expect(sell).toHaveProperty('id');
      expect(sell).toHaveProperty('ts');
      expect(sell).toHaveProperty('eth');
      expect(sell).toHaveProperty('amount');
      expect(sell).toHaveProperty('postPrice');
      expect(sell).toHaveProperty('seller');
      expect(sell).toHaveProperty('token');
    }
  });
}); 