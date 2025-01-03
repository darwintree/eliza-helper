import { VercelRequest, VercelResponse } from '@vercel/node';
import { getTokenCreateds } from '../lib/subgraph';

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
        return res.status(200).json({ tokenCreateds });
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}