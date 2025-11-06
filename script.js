document.addEventListener('DOMContentLoaded', () => {
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

        // Kirim pesan ke Gemini API (Asumsi: Anda sudah menyiapkan fungsi di sini)
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


    // --- INTEGRASI GEMINI API ---
    
    // CATATAN PENTING: Untuk alasan keamanan, Anda TIDAK boleh menempatkan 
    // API Key langsung di kode frontend (JavaScript) jika web akan di-hosting 
    // publik. Sebaiknya, buatlah endpoint di server (misalnya menggunakan Node.js, 
    // Python, atau PHP) yang menangani permintaan ke Gemini API.
    
    // Fungsi Placeholder untuk Respon Gemini
    async function getGeminiResponse(userQuery) {
        // Tampilkan pesan loading bot
        appendMessage('bot', '⏳ Sedang berpikir...');
        
        // Hapus pesan loading sebelumnya (Anda mungkin perlu ID untuk ini, tapi ini adalah cara sederhana)
        // Kita anggap pesan terakhir adalah "Sedang berpikir"
        const loadingMessage = chatBody.lastElementChild;
        if (loadingMessage && loadingMessage.textContent.includes('Sedang berpikir')) {
            // Hapus pesan loading
            chatBody.removeChild(loadingMessage);
        }
        
        // GANTI BAGIAN INI dengan kode yang memanggil server-side endpoint Anda
        // yang terhubung ke Gemini API.
        
        // Contoh Respon Mockup (Ganti dengan respon API nyata)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulasi delay API
        const mockResponse = `Saya sedang memproses pertanyaan Anda tentang: "${userQuery}". Silakan integrasikan kunci API Gemini Anda di sini untuk mendapatkan analisis pasar yang sesungguhnya!`;
        
        appendMessage('bot', mockResponse);
    }
});
