import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokenCreateds } from '../lib/subgraph';
import { getTokensInfo } from '../lib/token';

interface TokenList {
    address: `0x${string}`
    name: string
    symbol: string
    description: string
    progress: number
}[]

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const subgraphURL = process.env.SUBGRAPH_URL;
    if (!subgraphURL) {
        return res.status(500).json({ error: 'SUBGRAPH_URL is not set' });
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const tokenCreateds = await getTokenCreateds({ url: subgraphURL });
        const addressList = tokenCreateds.map(token => token.token);
        const tokensInfo = await getTokensInfo(addressList);
        if (tokensInfo.length !== tokenCreateds.length) {
            throw new Error('Tokens info length does not match token createds length');
        }
        let tokenList = [];
        for (let i = 0; i < tokenCreateds.length; i++) {
            tokenList.push({
                address: tokenCreateds[i].token,
                name: tokenCreateds[i].name,
                symbol: tokenCreateds[i].symbol,
                description: tokenCreateds[i].meta.description,
                progress: tokensInfo[i].progress,
                boundedProgress: tokensInfo[i].boundedProgress
            });
        }
        return res.status(200).json({ tokenList });
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}