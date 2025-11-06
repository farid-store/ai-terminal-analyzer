// Contoh Sederhana di Server Proxy (misal: Node.js/Express)
// JANGAN taruh kode ini di file HTML!

const express = require('express');
const axios = require('axios');
const app = express();
const bodyParser = require('body-parser');

// 🛑 AMBIL KEY DARI ENVIRONMENT, BUKAN DI-HARDCODE!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

app.use(bodyParser.json({ limit: '5mb' }));

app.post('/api/gemini-chat', async (req, res) => {
    const { model, type, prompt, imageData } = req.body;
    
    // Konfigurasi request ke Gemini
    let contents = [];
    if (type === 'text') {
        contents = [{ role: "user", parts: [{ text: prompt }] }];
    } else if (type === 'image' && imageData) {
        contents = [{ 
            role: "user", 
            parts: [
                { text: prompt }, 
                { inlineData: { mimeType: imageData.mimeType, data: imageData.data } }
            ]
        }];
    }

    try {
        const geminiResponse = await axios.post(
            `https://generative.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            { contents: contents, config: { temperature: 0.2 } }
        );

        const reply = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Kirim balik ke frontend
        res.json({ text: reply });

    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to communicate with Gemini API via proxy." });
    }
});

// Tambahkan konfigurasi CORS di server Anda jika diperlukan
// Contoh: app.use(cors({ origin: 'http://localhost:3000' }));

// app.listen(3000, () => console.log('Proxy running on port 3000'));
