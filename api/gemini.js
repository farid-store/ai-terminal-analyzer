export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Mengambil API Key secara aman dari Environment Variable Vercel
    const apiKey = process.env.GEMINI_API_KEY; 

    // Validasi apakah API Key sudah di-set di Vercel
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key belum dikonfigurasi di Environment Variables Vercel.' });
    }

    const { contents, model } = req.body;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'API Error');
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
