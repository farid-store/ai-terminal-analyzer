// *** PERINGATAN KEAMANAN: GANTI DENGAN API KEY ANDA. JANGAN GUNAKAN INI DI PRODUKSI! ***
const API_KEY = "AIzaSyBD22OZdh4V0ypkIj2DfG1wHcY_6KYLcCU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const chatBox = document.getElementById('chat-box');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');
const imageUpload = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');

let uploadedImageBase64 = null;
let uploadedImageMimeType = null;
let conversationHistory = []; // Untuk Multi-Turn (Riwayat Obrolan)

// --- FUNGSI UTAMA ---

function displayMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    // Menggunakan white-space: pre-wrap di CSS untuk menampilkan format teks Gemini (seperti Markdown dasar)
    messageElement.textContent = text; 
    
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Konversi File Gambar ke Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Ambil hanya string Base64
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Tambahkan pesan ke riwayat obrolan
function addToHistory(text, role) {
    conversationHistory.push({
        role: role,
        parts: [{ text: text }]
    });
}

// --- HANDLER GAMBAR ---

uploadBtn.addEventListener('click', () => {
    imageUpload.click(); // Memicu klik pada input file tersembunyi
});

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            uploadedImageBase64 = await fileToBase64(file);
            uploadedImageMimeType = file.type;
            
            // Tampilkan preview
            imagePreview.src = URL.createObjectURL(file);
            imagePreviewContainer.style.display = 'flex';
            
            // Beri notifikasi ke pengguna
            displayMessage(`Gambar ${file.name} telah diunggah. Silakan ajukan pertanyaan terkait chart ini.`, 'gemini');

        } catch (error) {
            console.error("Gagal membaca file:", error);
            alert("Gagal memproses gambar.");
        }
    }
});

removeImageBtn.addEventListener('click', () => {
    uploadedImageBase64 = null;
    uploadedImageMimeType = null;
    imageUpload.value = null; // Reset input file
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '#';
});

// --- HANDLER SUBMIT FORM CHAT ---

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (userText === '' && !uploadedImageBase64) return;

    // 1. Tampilkan pesan pengguna dan tambahkan ke riwayat
    displayMessage(userText, 'user');
    addToHistory(userText, 'user');
    
    // 2. Persiapan Payload untuk Gemini
    const contents = [...conversationHistory];
    
    if (uploadedImageBase64) {
        // Jika ada gambar, tambahkan gambar ke bagian parts dari pesan pengguna terakhir
        const lastUserMessage = contents[contents.length - 1];
        lastUserMessage.parts.unshift({
            inlineData: {
                mimeType: uploadedImageMimeType,
                data: uploadedImageBase64
            }
        });
        
        // Hapus gambar setelah dikirim
        removeImageBtn.click();
    }
    
    // 3. Tampilkan pesan loading
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'gemini-message');
    loadingMessage.textContent = 'Gemini sedang menganalisis...';
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    userInput.value = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: contents })
        });

        const data = await response.json();
        
        // Hapus pesan loading
        chatBox.removeChild(loadingMessage);

        // Ambil dan tampilkan respons Gemini
        const geminiResponse = data.candidates[0].content.parts[0].text;
        displayMessage(geminiResponse, 'gemini');
        
        // Tambahkan respons Gemini ke riwayat untuk konteks multi-turn
        addToHistory(geminiResponse, 'model');

    } catch (error) {
        console.error('Error memanggil Gemini API:', error);
        chatBox.removeChild(loadingMessage);
        const errorMessage = 'Maaf, terjadi kesalahan saat menghubungi Gemini. Pastikan API Key Anda benar dan aman.';
        displayMessage(errorMessage, 'gemini');
        addToHistory(errorMessage, 'model'); // Tambahkan error ke riwayat (opsional)
    }
});
