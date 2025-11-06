// api/chat.js (Kode Serverless Function Vercel)

const { GoogleGenAI } = require('@google/genai');

// Vercel secara otomatis menyediakan GEMINI_API_KEY di process.env
// setelah Anda mengaturnya di Environment Variables di dashboard Vercel.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

// Handler untuk permintaan POST ke /api/chat
module.exports = async (req, res) => {
    // Hanya izinkan permintaan POST
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // Mengurai body permintaan (Vercel menangani ini secara otomatis)
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: message,
        });

        // Set header CORS agar dapat diakses oleh frontend
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Content-Type', 'application/json');

        // Kirimkan teks respons kembali
        res.status(200).json({ text: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        // Penting: Jangan kirimkan detail error API ke frontend
        res.status(500).json({ error: "Gagal memproses permintaan dari AI. Silakan coba lagi." });
    }
};
