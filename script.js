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

        // Kirim pesan ke Serverless Function Vercel
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

    // --- FUNGSI INTEGRASI GEMINI API VIA VERCEL BACKEND ---
    
    // Fungsi untuk mendapatkan respons dari Gemini melalui Serverless Function Vercel
    async function getGeminiResponse(userQuery) {
        appendMessage('bot', '⏳ Sedang berpikir...');
        
        // Alamat endpoint Vercel Anda. Menggunakan path relatif /api/chat
        // Vercel akan otomatis menyelesaikan URL lengkap setelah di-deploy.
        const serverUrl = '/api/chat'; 

        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userQuery }),
            });

            const data = await response.json();
            
            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang berpikir')) {
                chatBody.removeChild(loadingMessage);
            }

            if (data.error) {
                // Tampilkan pesan error dari backend
                appendMessage('bot', `Kesalahan: ${data.error}`);
            } else {
                // Tampilkan respons AI dari backend Vercel
                appendMessage('bot', data.text);
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            
            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang berpikir')) {
                chatBody.removeChild(loadingMessage);
            }
            
            appendMessage('bot', 'Maaf, terjadi kesalahan koneksi atau jaringan. Periksa server Vercel Anda.');
        }
    }
});
