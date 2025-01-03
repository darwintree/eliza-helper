import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokensInfo } from '../lib/token';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const addressList = req.query.addressList;
    if (!Array.isArray(addressList)) {
        return res.status(400).json({ error: 'addressList must be an array' });
    }

    try {
        const tokensInfo = await getTokensInfo(addressList as `0x${string}`[]);
        return res.status(200).json(JSON.parse(JSON.stringify(tokensInfo,(key, value) =>
            typeof value === 'bigint' ? value.toString() : value
          )));
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}