import { VercelRequest, VercelResponse } from '@vercel/node';
import { getImageCIDFromUrl } from '../lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const apiURL = process.env.API_URL;
    if (!apiURL) {
        return res.status(500).json({ error: 'API_URL is not set' });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({ error: 'No image URL provided', data: req.body });
        }

        const cid = await getImageCIDFromUrl(apiURL, imageUrl);

        return res.status(200).json({ cid });
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 