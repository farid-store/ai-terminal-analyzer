document.addEventListener('DOMContentLoaded', () => {
    // 🛑 PERINGATAN: MENEMPATKAN KUNCI API DI SINI SANGAT BERISIKO KEAMANAN!
    // KUNCI INI AKAN DAPAT DIAKSES OLEH SIAPA PUN.
    // GANTI DENGAN KUNCI GEMINI API ANDA DI BAWAH INI:
    const GEMINI_API_KEY = "AIzaSyBD22OZdh4V0ypkIj2DfG1wHcY_6KYLcCU";
    
    // Pastikan library @google/genai sudah dimuat
    if (typeof GoogleGenAI === 'undefined') {
        console.error("Library GoogleGenAI tidak dimuat. Pastikan Anda memiliki tag <script> yang benar.");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    // Menggunakan model 'gemini-pro-vision' untuk input multimodal (teks + gambar)
    // Jika hanya ingin teks, gunakan 'gemini-pro'
    const model = ai.getGenerativeModel({ model: "gemini-pro-vision" });

    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const closeChat = document.getElementById('close-chat');
    const chatBody = document.getElementById('chat-body');
    const chatInputText = document.getElementById('chat-input-text');
    const sendChatMessageButton = document.getElementById('send-chat-message');
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const uploadedImagePreview = document.getElementById('uploaded-image-preview');
    const removeImageButton = document.getElementById('remove-image-button');

    let uploadedImageBase64 = null; // Menyimpan data gambar dalam format Base64

    // Fungsionalitas Pop-up Chat
    chatButton.addEventListener('click', () => {
        chatPopup.classList.toggle('hidden');
    });

    closeChat.addEventListener('click', () => {
        chatPopup.classList.add('hidden');
    });

    // Menambah pesan ke chat body
    function appendMessage(sender, message, imageUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);

        if (imageUrl) {
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.style.maxWidth = '100%';
            imgElement.style.maxHeight = '200px';
            imgElement.style.borderRadius = '8px';
            imgElement.style.marginBottom = '8px';
            messageDiv.appendChild(imgElement);
        }

        const textNode = document.createTextNode(message);
        messageDiv.appendChild(textNode);
        
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Fungsi untuk mengirim pesan
    async function sendMessage() {
        const userMessage = chatInputText.value.trim();
        const hasImage = uploadedImageBase64 !== null;

        if (userMessage === "" && !hasImage) return;

        // Tampilkan pesan pengguna
        appendMessage('user', userMessage, uploadedImagePreview.src && hasImage ? uploadedImagePreview.src : null);
        
        chatInputText.value = ''; // Kosongkan input
        chatInputText.disabled = true; // Nonaktifkan input saat menunggu respon
        sendChatMessageButton.disabled = true; // Nonaktifkan tombol kirim

        // Hapus preview gambar setelah dikirim
        resetImageUpload();

        getGeminiResponse(userMessage, uploadedImageBase64);
    }

    // Event listener untuk tombol kirim
    sendChatMessageButton.addEventListener('click', sendMessage);

    // Event listener untuk tombol Enter di input teks
    chatInputText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendChatMessageButton.disabled) { // Hanya kirim jika tidak disabled
            sendMessage();
        }
    });

    // --- Fungsionalitas Upload Gambar ---
    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageBase64 = e.target.result.split(',')[1]; // Ambil hanya data base64
                uploadedImagePreview.src = e.target.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageButton.addEventListener('click', () => {
        resetImageUpload();
    });

    function resetImageUpload() {
        uploadedImageBase64 = null;
        uploadedImagePreview.src = '';
        imageUploadInput.value = ''; // Reset input file
        imagePreviewContainer.classList.add('hidden');
    }

    // --- FUNGSI INTEGRASI GEMINI API LANGSUNG (FRONTEND) ---
    async function getGeminiResponse(userQuery, imageBase64 = null) {
        appendMessage('bot', '⏳ Sedang memproses analisis...');
        
        try {
            const parts = [];

            if (userQuery) {
                parts.push({ text: userQuery });
            }

            if (imageBase64) {
                parts.push({
                    inlineData: {
                        mimeType: 'image/jpeg', // Asumsi JPEG, sesuaikan jika perlu
                        data: imageBase64
                    }
                });
            }

            if (parts.length === 0) {
                appendMessage('bot', 'Tidak ada pesan atau gambar untuk dianalisis.');
                return;
            }

            const result = await model.generateContent({ contents: [{ parts }] });
            const response = await result.response;
            const text = response.text;

            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang memproses')) {
                chatBody.removeChild(loadingMessage);
            }

            // Tampilkan respons AI
            appendMessage('bot', text);

        } catch (error) {
            console.error('Gemini API Error:', error);
            
            // Hapus pesan loading
            const loadingMessage = chatBody.lastElementChild;
            if (loadingMessage && loadingMessage.textContent.includes('Sedang memproses')) {
                chatBody.removeChild(loadingMessage);
            }
            
            let errorMessage = '🚫 Maaf, terjadi kesalahan saat berkomunikasi dengan AI. ';
            if (error.message.includes("API key not valid")) {
                errorMessage += "Periksa kembali kunci API Gemini Anda.";
            } else if (error.message.includes("quota exceeded")) {
                errorMessage += "Kuota API Anda mungkin sudah habis.";
            } else if (error.message.includes("Blocked reason: UNSAFE")) {
                errorMessage += "Konten ini mungkin melanggar kebijakan keamanan AI.";
            } else {
                errorMessage += "Silakan coba lagi nanti.";
            }
            appendMessage('bot', errorMessage);
        } finally {
            chatInputText.disabled = false;
            sendChatMessageButton.disabled = false;
            chatInputText.focus();
        }
    }
});
