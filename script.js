// Anda dapat menginstal '@google/genai' melalui npm, atau menggunakan CDN/bundler
// Untuk contoh sederhana, kita akan menggunakan panggilan API fetch (asumsi Anda memiliki backend untuk keamanan)

// *** CATATAN PENTING: Untuk produksi, JANGAN SIMPAN API KEY DI FRONTEND ***
const API_KEY = "GANTI_DENGAN_API_KEY_ANDA"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const chatBox = document.getElementById('chat-box');
const inputForm = document.getElementById('input-form');
const userInput = document.getElementById('user-input');

// Fungsi untuk menampilkan pesan di chat box
function displayMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    // Gulir ke bawah
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Handler saat form disubmit
inputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userText = userInput.value.trim();
    if (userText === '') return;

    // Tampilkan pesan pengguna
    displayMessage(userText, 'user');
    userInput.value = '';

    // Tampilkan pesan loading
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('message', 'gemini-message');
    loadingMessage.textContent = 'Gemini sedang berpikir...';
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: userText }] }]
            })
        });

        const data = await response.json();
        
        // Hapus pesan loading
        chatBox.removeChild(loadingMessage);

        // Ambil dan tampilkan respons Gemini
        const geminiResponse = data.candidates[0].content.parts[0].text;
        displayMessage(geminiResponse, 'gemini');

    } catch (error) {
        console.error('Error memanggil Gemini API:', error);
        chatBox.removeChild(loadingMessage);
        displayMessage('Maaf, terjadi kesalahan saat menghubungi Gemini.', 'gemini');
    }
});
