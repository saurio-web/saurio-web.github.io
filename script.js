const GEMINI_API_KEY = "TU_API_KEY_AQUÍ"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_INSTRUCTION = `
Eres el "Asistente IA Saurio", experto en soporte de software libre, optimización de latencia en juegos como GeForce NOW y configuraciones de Void Linux o modpacks de Minecraft de bajos recursos. Mantén las respuestas directas, con formato de código en comandos y muy concisas.
`;

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') enviarMensaje();
});

async function enviarMensaje() {
    const inputElement = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const mensajeTexto = inputElement.value.trim();

    if (mensajeTexto === "") return;

    // Mensaje de Usuario
    const userDiv = document.createElement('div');
    userDiv.className = "text-gray-300";
    userDiv.innerHTML = `<span class="text-blue-400 font-bold">[Tú]:</span> ${escapeHTML(mensajeTexto)}`;
    chatBox.appendChild(userDiv);

    inputElement.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Animación de Carga
    const loadingDiv = document.createElement('div');
    loadingDiv.className = "text-yellow-500 animate-pulse";
    loadingDiv.innerText = "[Asistente]: Compilando respuesta...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nPregunta: ${mensajeTexto}` }] }]
            })
        });

        const data = await response.json();
        chatBox.removeChild(loadingDiv);

        const botResponse = data.candidates[0].content.parts[0].text;
        const botDiv = document.createElement('div');
        botDiv.className = "text-green-400";
        botDiv.innerHTML = `<span class="text-green-500 font-bold">[Asistente]:</span> ${formatResponse(botResponse)}`;
        chatBox.appendChild(botDiv);

    } catch (error) {
        chatBox.removeChild(loadingDiv);
        const errorDiv = document.createElement('div');
        errorDiv.className = "text-red-500";
        errorDiv.innerText = "[Error]: Conexión fallida.";
        chatBox.appendChild(errorDiv);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function formatResponse(text) {
    let safeText = escapeHTML(text);
    safeText = safeText.replace(/`([^`]+)`/g, '<code class="bg-gray-900 px-1 text-green-300 rounded font-mono text-xs border border-gray-800">$1</code>');
    return safeText.replace(/\n/g, '<br>');
}
