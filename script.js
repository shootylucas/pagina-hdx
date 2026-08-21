// =========================================
// DATOS MAESTROS (52 Extraídos de imágenes)
// =========================================
const FESTIVALES_IMAGENES = [
    "JORGE ROJAS - JESUS MARIA 2026", "LOS PALMERAS - JESUS MARIA 2026", "LAZARO CABALLERO - JESÚS MARÍA 2026", 
    "EL INDIO LUCIO ROJAS - COSQUIN 2026", "SERGIO GALLEGUILLO - SERENATA 2026", "LAS VOCES DE ORAN - SAN CARLOS",
    "ABEL PINTOS - JESUS MARIA 2026", "LUCIANO PEREYRA - COSQUIN 2026", "MANSEROS SANTIAGUEÑOS - JESÚS MARÍA 2026",
    "CAMPEDRINOS - CACHI 2026", "EL INDIO LUCIO ROJAS - MOLINOS 2026", "AHYRE - JESUS MARIA 2026",
    "NOCHEROS - JESUS MARIA 2026", "CHAQUEÑO PALAVECINO - JESUS MARIA 2026", "INDIO LUCIO ROJAS - SAN CARLOS",
    "RALY BARRIONUEVO - JESÚS MARÍA 2026", "LOS NOCHEROS - COSQUIN 2026", "AHYRE - MOLINOS 2026",
    "LAS VOCES DE ORAN - SERENATA 2026", "LOS NOCHEROS - MOLINOS 2026", "ABEL PINTOS - COSQUIN 2026",
    "JOAQUÍN SOSA - LA POMA 2026", "AHYRE - COSQUIN 2026", "CHAQUEÑO PALAVECINO - COSQUIN 2026",
    "LAZARO CABALLERO - COSQUIN 2026", "LAS VOCES DE ORAN - JESÚS MARÍA 2026", "LOS KJARKAS - CACHI 2026",
    "CANTO DEL ALMA - SERENATA 2026", "GUITARREROS - COSQUIN 2026", "DESTINO SAN JAVIER - JESÚS MARIA 2026",
    "LAZARO CABALLERO - MORILLO", "CANTO 4 - SECLANTAS 2026", "CAMPEDRINOS - JESÚS MARÍA 2026",
    "RALY BARRIONUEVO - SECLANTAS 2026", "HUK - MOLINOS 2026", "LOS 4 DE CORDOBA - JESUS MARIA 2026",
    "CHAQUEÑO PALAVECINO - SERENATA 2026", "C - MILAGROS DEL CIELO", "JORGE ROJAS - SERENATA 2026 RECONVE",
    "NOCHEROS - SERENATA 2026", "NOCHEROS - SERENATA 2026 NOCHE", "AHYRE - SERENATA 2026",
    "INDIO LUCIO ROJAS - SERENATA 2026", "NOCHEROS - LAS LAJITAS 2026", "LAS VOCES DE ORÁN - LAS LAJITAS 2026",
    "ANGELO ARANDA - LAS LAJITAS 2026", "CHAQUEÑO PALAVECINO - LAS LAJITAS 2026", "DALMIRO CUELLAR - SERENATA 2026",
    "CHAQUEÑO PALAVECINO - PICHANAL 2026", "LAS VOCES DE ORAN - LA CHICHA 2026", "INDIO LUCIO ROJAS - LA CHICHA 2026",
    "CHRISTIAN HERRERA - CAFAYATE 2026"
];

const initialState = {
    danteSlots: {
        'slot_0000': { time: '00:00', duration: 90, episode: 445 },
        'slot_0630': { time: '06:30', duration: 30, episode: 445 }, 
        'slot_1700': { time: '17:00', duration: 30, episode: 445 }  
    },
    festivales: [],
    historialIA: [] 
};

let appState = {};
let chatHistory = []; // Almacena el contexto para Gemini

// =========================================
// GESTIÓN DE DATOS Y CARGA
// =========================================
function loadState() {
    const saved = localStorage.getItem('dinesatStateV4');
    if (saved) {
        appState = JSON.parse(saved);
    } else {
        appState = JSON.parse(JSON.stringify(initialState));
    }

    // AUTO-CARGA de imágenes
    FESTIVALES_IMAGENES.forEach((festName, index) => {
        const existe = appState.festivales.some(f => f.name.toLowerCase() === festName.toLowerCase());
        if (!existe) {
            appState.festivales.push({
                id: 'fest_' + index + '_' + Date.now(),
                name: festName,
                lastPlayed: 0 
            });
        }
    });
    saveState(); 
}

function saveState() {
    localStorage.setItem('dinesatStateV4', JSON.stringify(appState));
    renderUI();
}

// =========================================
// LÓGICA DANTE GEBEL
// =========================================
function emitirDante(slotId) {
    appState.danteSlots[slotId].episode++;
    addToIAHistory(`El usuario acaba de emitir Dante Gebel de las ${appState.danteSlots[slotId].time} (Episodio #${appState.danteSlots[slotId].episode})`);
    saveState();
    
    const btn = document.getElementById(`btn-${slotId}`);
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> ¡LISTO!';
    btn.style.background = 'var(--success)';
    setTimeout(() => { 
        btn.innerHTML = originalText; 
        btn.style.background = '';
        renderUI(); 
    }, 1500);
}

function cambiarEpisodioManual(slotId, nuevoValor) {
    const num = parseInt(nuevoValor);
    if (!isNaN(num) && num >= 0) {
        appState.danteSlots[slotId].episode = num;
        addToIAHistory(`El usuario corrigió manualmente el episodio de Dante Gebel de las ${appState.danteSlots[slotId].time} al #${num}`);
        saveState();
    } else {
        renderUI(); 
    }
}

// =========================================
// LÓGICA DE FESTIVALES
// =========================================
function emitirFestival(festId) {
    const fest = appState.festivales.find(f => f.id === festId);
    if (fest) {
        fest.lastPlayed = Date.now(); 
        addToIAHistory(`El usuario emitió el festival: ${fest.name}`);
        saveState();
    }
}

function agregarFestivalUI() {
    const input = document.getElementById('newFestivalInput');
    const name = input.value.trim();
    if (name) {
        appState.festivales.push({
            id: 'f_nuevo_' + Date.now(),
            name: name,
            lastPlayed: 0 
        });
        addToIAHistory(`El usuario agregó un nuevo festival: ${name}`);
        input.value = '';
        saveState();
    }
}

function borrarFestival(festId) {
     if(confirm("¿Estás seguro de eliminar este festival para siempre?")) {
         const fest = appState.festivales.find(f => f.id === festId);
         appState.festivales = appState.festivales.filter(f => f.id !== festId);
         addToIAHistory(`El usuario eliminó el festival: ${fest.name}`);
         saveState();
     }
}

function editarFestival(festId) {
    const fest = appState.festivales.find(f => f.id === festId);
    const nuevoNombre = prompt("Editar nombre del bloque:", fest.name);
    if(nuevoNombre && nuevoNombre.trim() !== "") {
        addToIAHistory(`El usuario cambió el nombre del festival "${fest.name}" a "${nuevoNombre.trim()}"`);
        fest.name = nuevoNombre.trim();
        saveState();
    }
}

function resetearRotacionFestivales() {
    if(confirm("ATENCIÓN: ¿Querés poner el contador de TODOS los festivales a cero?")) {
        appState.festivales.forEach(f => f.lastPlayed = 0);
        addToIAHistory("El usuario reseteó el orden de rotación de todos los festivales.");
        saveState();
    }
}

function addToIAHistory(actionText) {
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    appState.historialIA.unshift(`[${time}] ${actionText}`);
    if(appState.historialIA.length > 10) appState.historialIA.pop(); 
}

// =========================================
// INTEGRACIÓN CON API GEMINI (LLM)
// =========================================

const SYSTEM_PROMPT = `
Eres el asistente virtual integrado en el software 'Dinesat Manager Pro' operado por un radiodifusor/programador en Argentina.
Tu tarea es ayudar al usuario a gestionar su pauta de transmisión basándote estrictamente en los datos que se te proporcionan.
El usuario emite dos tipos de contenidos principales:
1. 'Dante Gebel': Programas seriados que tienen distintos episodios numéricos dependiendo de la hora (00:00, 06:30, 17:00).
2. 'Festivales': Shows musicales que rotan en un sistema Round-Robin. El próximo festival a emitir es siempre el que lleva más tiempo sin salir (o que nunca salió).

Tono: Amable, directo, útil, conciso y profesional, usando voseo argentino (ej: 'tenés', 'fijate', 'podés').
Formato: Usa listas con viñetas o negritas para destacar nombres de festivales o episodios, facilita la lectura. Sé breve, no des respuestas extremadamente largas a menos que se te pida el listado completo.
Importante: No inventes datos. Si te preguntan algo fuera de la gestión de la pauta de radio o festivales, responde amablemente que tu función es ayudar con la operación de Dinesat.
`;

function getCurrentStateString() {
    let stateStr = "### ESTADO ACTUAL DE LOS DATOS ###\n\n";
    stateStr += "1. ESTADO DE DANTE GEBEL:\n";
    Object.values(appState.danteSlots).forEach(slot => {
        stateStr += `- Horario ${slot.time} (Duración: ${slot.duration}m): Siguiente Episodio a emitir #${slot.episode}\n`;
    });

    stateStr += "\n2. COLA DE FESTIVALES:\n";
    const sortedFestivales = [...appState.festivales].sort((a, b) => a.lastPlayed - b.lastPlayed);
    stateStr += `Total de festivales en la base de datos: ${sortedFestivales.length}\n`;
    stateStr += `Próximos 5 festivales en fila para ser emitidos:\n`;
    sortedFestivales.slice(0, 5).forEach((fest, idx) => {
        const estado = fest.lastPlayed === 0 ? "(Nunca emitido)" : `(Última vez: ${new Date(fest.lastPlayed).toLocaleString()})`;
        stateStr += `${idx + 1}. ${fest.name} ${estado}\n`;
    });

    if(appState.historialIA.length > 0) {
        stateStr += "\n3. HISTORIAL DE ACCIONES RECIENTES DEL USUARIO:\n";
        appState.historialIA.forEach(h => stateStr += `${h}\n`);
    } else {
         stateStr += "\n3. HISTORIAL: No hay acciones recientes registradas.\n";
    }

    return stateStr;
}

async function sendChatMessageToGemini() {
    const input = document.getElementById('chatInput');
    const btnSend = document.getElementById('btnSendChat');
    const typingIndicator = document.getElementById('typingIndicator');
    const userMsg = input.value.trim();
    
    if (!userMsg) return;

    addMessageToChat(userMsg, 'user');
    input.value = '';
    input.disabled = true;
    btnSend.disabled = true;
    typingIndicator.style.display = 'block';
    
    const chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;

    const apiKey = ""; // Canvas injects it automatically
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    
    const contextMessage = `[SISTEMA INTERNO: ESTADO DE DATOS ACTUALIZADO EN TIEMPO REAL]\n${getCurrentStateString()}\n[FIN DEL REPORTE DE SISTEMA. Por favor, responde a la siguiente consulta del usuario basándote en esta información:]\n\nConsulta del Usuario: ${userMsg}`;

    if (chatHistory.length > 4) chatHistory = chatHistory.slice(-4);
    
    const currentContents = [...chatHistory, { role: "user", parts: [{ text: contextMessage }] }];

    const payload = {
        contents: currentContents,
        systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
        },
    };

    try {
        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
           if(response.status === 429) {
               await new Promise(resolve => setTimeout(resolve, 2000));
               response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
           }
           if(!response.ok) throw new Error(`Error API: ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const aiText = candidate.content.parts[0].text;
            
            chatHistory.push({ role: "user", parts: [{ text: userMsg }] });
            chatHistory.push({ role: "model", parts: [{ text: aiText }] });

            const htmlResponse = marked.parse(aiText);
            addMessageToChat(htmlResponse, 'ai');
        } else {
            throw new Error("Respuesta de API vacía o estructura inesperada.");
        }

    } catch (error) {
        console.error("Error llamando a Gemini:", error);
        addMessageToChat("Ups, tuve un problema conectándome a los servidores. Por favor, intentá de nuevo en un momento.", 'ai');
    } finally {
        typingIndicator.style.display = 'none';
        input.disabled = false;
        btnSend.disabled = false;
        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function addMessageToChat(htmlContent, sender) {
    const chatBox = document.getElementById('chatBox');
    const typingIndicator = document.getElementById('typingIndicator');
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `message msg-${sender}`;
    msgDiv.innerHTML = htmlContent; 
    
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================================
// RENDERIZADO DE LA INTERFAZ
// =========================================
function renderUI() {
    const danteContainer = document.getElementById('danteGrid');
    danteContainer.innerHTML = '';
    Object.keys(appState.danteSlots).forEach(slotId => {
        const slot = appState.danteSlots[slotId];
        const div = document.createElement('div');
        div.className = 'dante-slot';
        div.innerHTML = `
            <div class="slot-time"><i class="far fa-clock"></i> ${slot.time}</div>
            <div class="slot-duration">${slot.duration} minutos</div>
            <div class="episode-label">N° de Episodio:</div>
            <input type="number" class="episode-input" value="${slot.episode}" onchange="cambiarEpisodioManual('${slotId}', this.value)" title="Escribí para modificar">
            <button class="btn-emitir" id="btn-${slotId}" onclick="emitirDante('${slotId}')">
                <i class="fas fa-play"></i> PAUTAR (+1)
            </button>
        `;
        danteContainer.appendChild(div);
    });

    const sortedFestivales = [...appState.festivales].sort((a, b) => a.lastPlayed - b.lastPlayed);
    
    document.getElementById('festCount').innerText = sortedFestivales.length;
    const festContainer = document.getElementById('festivalList');
    festContainer.innerHTML = '';
    
    sortedFestivales.forEach((fest, index) => {
        const li = document.createElement('li');
        const isNext = index === 0;
        li.className = `fest-item ${isNext ? 'next-up' : ''}`;
        
        let lastPlayedText = fest.lastPlayed === 0 
            ? '<span style="color:var(--success);"><i class="fas fa-star"></i> Nunca emitido en esta ronda</span>' 
            : `Última vez: ${new Date(fest.lastPlayed).toLocaleString([], {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}`;
        
        let nextLabel = isNext ? '<span style="color:var(--accent-fest); font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;"><i class="fas fa-arrow-circle-right"></i> Siguiente en pauta</span><br>' : '';

        li.innerHTML = `
            <div class="fest-info">
                ${nextLabel}
                <span class="fest-name">${fest.name}</span><br>
                <span class="fest-last-played">${lastPlayedText}</span>
            </div>
            <div class="fest-actions">
                <button class="btn-icon btn-play" style="${isNext ? '' : 'background: var(--success); font-size: 0.8rem; padding: 0 8px;'}" title="Marcar como Pautado en Dinesat" onclick="emitirFestival('${fest.id}')"><i class="fas fa-check"></i> PAUTAR</button>
                <button class="btn-icon" title="Editar Nombre" onclick="editarFestival('${fest.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-delete" title="Borrar" onclick="borrarFestival('${fest.id}')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        festContainer.appendChild(li);
    });
}

// START
loadState();