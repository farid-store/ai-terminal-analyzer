// Fungsi Serverless untuk Vercel (Node.js Environment)
// File ini terletak di 'api/analyze.js'

import { GoogleGenAI } from '@google/genai';

// Inisialisasi Klien Gemini menggunakan variabel lingkungan
// API Key akan diambil secara otomatis dari Vercel Environment Variables
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

/**
 * Handler untuk fungsi serverless Vercel.
 * @param {object} req - Objek permintaan (request).
 * @param {object} res - Objek respons (response).
 */
export default async function handler(req, res) {
    
    // Pastikan metode adalah POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Hanya metode POST yang diizinkan.' });
    }

    try {
        const { query, historicalData } = req.body;

        if (!query || !historicalData) {
            return res.status(400).json({ error: 'Kueri atau data historis tidak lengkap.' });
        }

        // Cek Keamanan: Pastikan GEMINI_API_KEY disetel
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return res.status(500).json({ error: 'Kesalahan Server: Kunci API Gemini belum dikonfigurasi.' });
        }

        const systemInstruction = "You are a professional financial analyst specialized in XAU/USD historical data. Your response must be formatted using Markdown, be professional, and strictly based only on the provided historical data. Use clear headings and lists. Answer the user query concisely.";

        const prompt = `[PERAN: Anda adalah analis keuangan AI yang bertugas menganalisis data historis XAU/USD (Emas) yang disediakan. Analisis Anda harus STRIKTLY berdasarkan data yang diberikan dan menjawab kueri pengguna. Jangan gunakan pengetahuan eksternal atau data real-time.]

DATA HISTORIS YANG TERSEDIA (2020 - 2025):
---
${historicalData}
---

Kueri Pengguna: "${query}"

Berdasarkan data historis di atas, lakukan analisis berikut:
1. Identifikasi dan ringkas 3 poin utama (Trend, Faktor) yang paling relevan dengan kueri pengguna.
2. Berikan narasi/jawaban mendetail yang menjelaskan data terkait kueri.
3. Berikan kesimpulan singkat (maksimum 1 kalimat) yang menjawab pertanyaan inti pengguna berdasarkan data.`;

        // Panggilan API Gemini
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2 
            }
        });

        // Kirimkan teks hasil analisis kembali ke klien
        res.status(200).json({ text: response.text });

    } catch (error) {
        console.error('Error in Vercel Serverless function:', error);
        res.status(500).json({ error: 'Gagal memproses kueri melalui Gemini API.', details: error.message });
    }
}
