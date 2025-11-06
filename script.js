// *** PERINGATAN KEAMANAN: GANTI DENGAN API KEY ANDA. JANGAN GUNAKAN INI DI PRODUKSI! ***
const API_KEY = "AIzaSyBD22OZdh4V0ypkIj2DfG1wHcY_6KYLcCU";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// --- Elemen Chatbot ---
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
let conversationHistory = []; // Riwayat obrolan (Multi-Turn)

// --- Elemen TradingView ---
const assetPairSelect = document.getElementById('asset-pair');
const chartContainer = document.getElementById('chart-container');
const DEFAULT_SYMBOL = assetPairSelect.value; 

// -------------------------------------------------------------------
//                             FUNGSI CHATBOT
// -------------------------------------------------------------------

function displayMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text; 
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); 
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

function addToHistory(text, role) {
    conversationHistory.push({
        role: role,
        parts: [{ text: text }]
    });
}

// --- HANDLER GAMBAR (MULTIMODAL) ---

uploadBtn.addEventListener('click', () => {
    imageUpload.click();
});

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            uploadedImageBase64 = await fileToBase64(file);
            uploadedImageMimeType = file.type;
            
            imagePreview.src = URL.createObjectURL(file);
            imagePreviewContainer.style.display = 'flex';
            
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
    imageUpload.value = null;
    imagePreviewContainer.style.display = 'none';
    imagePreview.src = '#';
});

// --- HANDLER SUBMIT FORM CHAT ---

inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (userText === '' && !uploadedImageBase64) return;
    
    displayMessage(userText, 'user');
    addToHistory(userText, 'user');
    
    const contents = [...conversationHistory];
    
    if (uploadedImageBase64) {
        const lastUserMessage = contents[contents.length - 1];
        lastUserMessage.parts.unshift({
            inlineData: {
                mimeType: uploadedImageMimeType,
                data: uploadedImageBase64
            }
        });
        removeImageBtn.click();
    }
    
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'gemini-message');
    loadingMessage.textContent = 'Gemini sedang menganalisis...';
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    userInput.value = '';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents })
        });

        const data = await response.json();
        
        chatBox.removeChild(loadingMessage);

        const geminiResponse = data.candidates[0].content.parts[0].text;
        displayMessage(geminiResponse, 'gemini');
        
        addToHistory(geminiResponse, 'model');

    } catch (error) {
        console.error('Error memanggil Gemini API:', error);
        chatBox.removeChild(loadingMessage);
        const errorMessage = 'Maaf, terjadi kesalahan saat menghubungi Gemini. Periksa konsol untuk detail error.';
        displayMessage(errorMessage, 'gemini');
        addToHistory(errorMessage, 'model');
    }
});

// -------------------------------------------------------------------
//                             FUNGSI TRADINGVIEW
// -------------------------------------------------------------------

function loadTradingViewWidget(symbol) {
    // Bersihkan kontainer chart lama
    chartContainer.innerHTML = '';
    
    // Pastikan library TradingView sudah dimuat sebelum memanggil TradingView.widget
    if (typeof TradingView === 'undefined' || !TradingView.widget) {
        console.warn("TradingView library not loaded yet.");
        // Coba muat lagi setelah jeda singkat
        setTimeout(() => loadTradingViewWidget(symbol), 500); 
        return;
    }
    
    new TradingView.widget(
        {
            "autosize": true,
            "symbol": symbol, 
            "interval": "60", 
            "timezone": "Asia/Jakarta", 
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": "chart-container"
        }
    );
}

// Handler saat pilihan aset berubah
assetPairSelect.addEventListener('change', (e) => {
    const newSymbol = e.target.value;
    loadTradingViewWidget(newSymbol);
});

// Muat chart default saat script dijalankan pertama kali
window.addEventListener('load', () => {
    loadTradingViewWidget(DEFAULT_SYMBOL);
});
