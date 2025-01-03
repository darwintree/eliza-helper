import { VercelRequest, VercelResponse } from '@vercel/node';
import { uploadImageToIPFS } from '../lib/utils';

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
            return res.status(400).json({ error: 'No image URL provided' });
        }

        const url = await uploadImageToIPFS(apiURL, imageUrl);

        return res.status(200).json({ url });
    } catch (error) {
        console.error('Error processing request:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 