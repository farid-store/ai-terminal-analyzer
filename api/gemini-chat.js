// File: api/gemini-chat.js

import { GoogleGenAI } from '@google/genai';

// Inisialisasi Klien Gemini.
// Klien ini secara otomatis akan membaca GEMINI_API_KEY
// dari Environment Variable di Vercel.
const ai = new GoogleGenAI({}); 

// Konfigurasi untuk Vercel: Mengizinkan ukuran body request yang lebih besar
// agar dapat menangani upload gambar (base64) dengan aman.
export const config = {
    maxDuration: 10,
    api: {
        bodyParser: {
            sizeLimit: '5mb', // Batas 5MB untuk request body
        },
    },
};


export default async function handler(req, res) {
    // 1. Validasi Metode
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are accepted.' });
    }

    // 2. Validasi Content Type
    if (req.headers['content-type'] !== 'application/json') {
         return res.status(400).json({ error: 'Invalid Content-Type. Expected application/json.' });
    }

    try {
        const { model, type, prompt, imageData } = req.body;

        // 3. Validasi Data Dasar
        if (!model || !prompt) {
            return res.status(400).json({ error: 'Missing model or prompt in request body.' });
        }

        let contents = [];
        
        // 4. Siapkan Contents (Teks atau Multimodal)
        if (type === 'text') {
            // Kasus Teks
            contents = [{ role: "user", parts: [{ text: prompt }] }];
        } 
        else if (type === 'image' && imageData && imageData.data && imageData.mimeType) {
            // Kasus Gambar (Multimodal)
            contents = [{ 
                role: "user", 
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: imageData.mimeType, data: imageData.data } }
                ]
            }];
        } else {
             return res.status(400).json({ error: 'Invalid request type or missing image data for image type.' });
        }
        
        // 5. Panggil Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                // Temperatur rendah untuk analisis pasar yang lebih faktual
                temperature: 0.2, 
                maxOutputTokens: 1024
            }
        });

        const reply = response.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!reply) {
             return res.status(500).json({ error: 'Gemini API returned no valid text reply.', details: response });
        }
        
        // 6. Kirim Balasan Sukses ke Frontend
        res.status(200).json({ text: reply });

    } catch (error) {
        console.error('API Error:', error);
        // 7. Tangani Error
        res.status(500).json({ error: 'Internal Server Error (Gemini API Call Failed).', details: error.message });
    }
}
