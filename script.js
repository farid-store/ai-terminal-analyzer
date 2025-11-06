document.addEventListener('DOMContentLoaded', () => {
    // 🛑 PERINGATAN: MENEMPATKAN KUNCI API DI SINI SANGAT BERISIKO KEAMANAN!
    // KUNCI INI AKAN DAPAT DIAKSES OLEH SIAPA PUN.
    // GANTI DENGAN KUNCI GEMINI API ANDA DI BAWAH INI:
    const GEMINI_API_KEY = "GANTI_DENGAN_KUNCI_API_GEMINI_ANDA_DI_SINI";
    
    // Pastikan library @google/genai sudah dimuat (disediakan di index.html)
    if (typeof GoogleGenAI === 'undefined') {
        console.error("Library GoogleGenAI tidak dimuat. Pastikan Anda memiliki tag <script> yang benar.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const closeChat = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInputText = document.getElementById('chat-input-text');
    const sendChatMessageButton = document.getElementById('send-chat-message');

    // Fungsionalitas Pop-up Chat
    chatButton.addEventListener('click', () => {
        chatPopup.classList.toggle('hidden');
    });

    closeChat.addEventListener('click', () => {
        chatPopup.classList.add('hidden');
    });

    // Menambah pesan ke chat body
    function appendMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        messageDiv.textContent = message;
        chatBody.appendChild(messageDiv);
        // Gulir ke bawah pesan terbaru
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Fungsi untuk mengirim pesan
    function sendMessage() {
        const userMessage = chatInputText.value.trim();
        if (userMessage === "") return;

        appendMessage('user', userMessage);
        chatInputText.value = ''; // Kosongkan input
        chatInputText.disabled = true; // Nonaktifkan input saat menunggu respon

        getGeminiResponse(userMessage);
    }

    // Event listener untuk tombol kirim
    sendChatMessageButton.addEventListener('click', sendMessage);

    // Event listener untuk tombol Enter di input teks
    chatInputText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // --- FUNGSI INTEGRASI GEMINI API LANGSUNG (FRONTEND) ---
    
    async function getGeminiResponse(userQuery) {
        appendMessage('bot', '⏳ Sedang memproses analisis...');
        
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: userQuery,
            });

            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang memproses')) {
                chatBody.removeChild(loadingMessage);
            }

            // Tampilkan respons AI
            appendMessage('bot', response.text);

        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang memproses')) {
                chatBody.removeChild(loadingMessage);
            }
            
            appendMessage('bot', '🚫 Maaf, terjadi kesalahan API (Mungkin Kunci API salah atau habis kuota).');
        } finally {
            chatInputText.disabled = false;
            chatInputText.focus();
        }
    }
});
