const PASSWORD_HASH = '03a98f74306972aaa78ab766d29f0a9ffa69c03a5d72b1ac67543efc9bfddaad';
const REQUIRED_EMOTIONS = ['alegria', 'tristeza', 'miedo', 'rabia', 'amor', 'sorpresa'];

const SPECIAL_NEWS_ANSWER_HASHES = [
    '6cdfefb9f3e96e75b8b0bb4f4efc6efdd20cf51666f716c9303e9170c250d1ef',
    '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    '404f6a57f5e183f7f27d3656405e1f35f029f4e4566130180b8af50b914ce046',
    '313ce7d71787960e3bb5f8258c173ae466b4e08e1e7d24b9c7a5ba81c9a02d96',
    '7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451'
];

let newsReadCount = 0;
let newsData = [];
const specialNewsUnlocked = new Set();
let videoTimerId = null; // Variable para guardar el ID del timer
let truthChoicesUnlocked = false;
const selectedEmotions = new Set();
let consequenceCaptchaAttempt = 0;
let consequenceCaptchaTimerId = null;

const loginScreen = document.getElementById('login-screen');
const blogScreen = document.getElementById('blog-screen');
const consequenceScreen = document.getElementById('consequence-screen');
const loginTitle = document.querySelector('.login-title');

const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const captchaContainer = document.getElementById('captcha-container');
const captchaOptions = document.querySelectorAll('.captcha-option');
const captchaContinueButton = document.getElementById('captcha-continue-button');
const errorMessage = document.getElementById('error-message');

const navButtons = document.querySelectorAll('.nav-button');
const newsSection = document.getElementById('news-section');
const truthSection = document.getElementById('truth-section');
const newsList = document.querySelector('.news-list');

const newsModal = document.getElementById('news-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');

const truthMessage = document.getElementById('truth-message');
const videoContainer = document.getElementById('video-container');
const truthVideo = document.getElementById('truth-video');
const choiceButtons = document.getElementById('choice-buttons');

const truthPill = document.getElementById('truth-pill');
const medicinePill = document.getElementById('medicine-pill');

const consequenceContent = document.getElementById('consequence-content');
const restartButton = document.getElementById('restart-button');

async function loadNews() {
    try {
        const response = await fetch('news.json');
        newsData = await response.json();
        renderNews();
    } catch (error) {
        console.error('Error al cargar las noticias:', error);
    }
}

function renderNews() {
    newsList.innerHTML = '';
    newsData.forEach((news, index) => {
        const isSpecial = news.special === true;
        const isLocked = isSpecial && !specialNewsUnlocked.has(index);
        const article = document.createElement('article');
        article.className = `news-item${isSpecial ? ' special-news' : ''}${isLocked ? ' locked-news' : ''}`;
        article.dataset.index = index;
        article.dataset.read = 'false';
        article.dataset.fullContent = news.fullContent;
        article.dataset.locked = String(isLocked);
        
        article.innerHTML = `
            ${isSpecial ? '<span class="special-badge">Especial</span>' : ''}
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
            <button class="read-button">${isLocked ? 'Desbloquear' : 'Leer más'}</button>
        `;
        
        newsList.appendChild(article);
    });
    
    attachReadButtonListeners();
}

function attachReadButtonListeners() {
    const readButtons = document.querySelectorAll('.read-button');
    readButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const newsItem = e.target.closest('.news-item');
            if (!newsItem) return;

            const newsIndex = Number(newsItem.dataset.index);
            const news = newsData[newsIndex];

            if (newsItem.dataset.locked === 'true') {
                showUnlockChallenge(newsIndex);
                return;
            }

            openNews(newsItem);
        });
    });
}

function openNews(newsItem) {
    const button = newsItem.querySelector('.read-button');
    const title = newsItem.querySelector('h3').textContent;
    const fullContent = newsItem.dataset.fullContent;

    modalTitle.textContent = title;
    modalBody.innerHTML = `<p>${fullContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    newsModal.classList.remove('hidden');

    if (newsItem.dataset.read === 'false') {
        newsItem.dataset.read = 'true';
        newsReadCount++;
        button.textContent = 'Leído';
        button.style.background = '#27ae60';
    }
}

function normalizeUnlockAnswer(value) {
    return value
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\s-]/g, '')
        .toLowerCase();
}

function unlockSpecialNews(newsIndex) {
    specialNewsUnlocked.add(newsIndex);

    const newsItem = document.querySelector(`.news-item[data-index="${newsIndex}"]`);
    if (!newsItem) return;

    newsItem.dataset.locked = 'false';
    newsItem.classList.remove('locked-news');
    newsItem.querySelector('.read-button').textContent = 'Leer más';
    openNews(newsItem);
}

function showUnlockChallenge(newsIndex) {
    const news = newsData[newsIndex];

    modalTitle.textContent = `Desbloquear ${news.title}`;
    modalBody.innerHTML = `
        <div class="unlock-challenge">
            <p>${news.unlock.question}</p>
            <input type="text" id="unlock-answer" class="unlock-input" autocomplete="off" placeholder="Respuesta">
            <button id="unlock-submit" class="unlock-button">Desbloquear</button>
            <p id="unlock-error" class="unlock-error"></p>
        </div>
    `;
    newsModal.classList.remove('hidden');

    const unlockInput = document.getElementById('unlock-answer');
    const unlockButton = document.getElementById('unlock-submit');
    const unlockError = document.getElementById('unlock-error');
    const expectedAnswerHash = SPECIAL_NEWS_ANSWER_HASHES[newsIndex];

    async function verifyUnlockAnswer() {
        const answerHash = await hashPassword(normalizeUnlockAnswer(unlockInput.value));
        if (answerHash === expectedAnswerHash) {
            unlockError.textContent = '';
            unlockSpecialNews(newsIndex);
            return;
        }

        unlockError.textContent = 'Esa clave no desbloquea esta noticia.';
        unlockInput.focus();
    }

    unlockButton.addEventListener('click', verifyUnlockAnswer);
    unlockInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyUnlockAnswer();
    });
    unlockInput.focus();
}

// Solución alternativa para iframes de Google Drive: setTimeout
// El video de Google Drive dura 38 segundos
function startVideoTimer() {
    console.log('Timer iniciado - Los botones aparecerán en 38 segundos');
    // Cancelar timer anterior si existe
    if (videoTimerId !== null) {
        clearTimeout(videoTimerId);
    }
    videoTimerId = setTimeout(() => {
        console.log('Timer completado - Mostrando botones');
        console.log('choiceButtons element:', choiceButtons);
        truthChoicesUnlocked = true;
        videoTimerId = null;
        choiceButtons.classList.remove('hidden');
    }, 38000); // 38 segundos en milisegundos
}

function resetTruthVideo() {
    const currentSrc = truthVideo.getAttribute('src');
    truthVideo.setAttribute('src', '');
    truthVideo.setAttribute('src', currentSrc);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('shake');
    void errorMessage.offsetWidth;
    errorMessage.classList.add('shake');
}
async function hashPassword(value) {
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function attemptLogin() {
    const password = passwordInput.value.trim();
    const passwordHash = await hashPassword(password);
    

    if (passwordHash === PASSWORD_HASH) {
        errorMessage.textContent = '';
        passwordInput.value = '';
        loginForm.classList.add('hidden');
        loginTitle.classList.add('hidden');
        captchaContainer.classList.remove('hidden');
        return;
    }

    showError('No eres suficiente milenial para saber la contraseña. ¡Dale una vuelta!');
    passwordInput.value = '';
    passwordInput.focus();
}

function toggleEmotionSelection(option) {
    const emotion = option.dataset.emotion;
    if (selectedEmotions.has(emotion)) {
        selectedEmotions.delete(emotion);
        option.classList.remove('selected');
    } else {
        selectedEmotions.add(emotion);
        option.classList.add('selected');
    }
}

function verifyCaptcha() {
    const allSelected = REQUIRED_EMOTIONS.every((emotion) => selectedEmotions.has(emotion));

    if (!allSelected) {
        showError('¿Seguro que eres humano? ¿Has tomado Valenthia? Vuelvelo a intentar');
        return;
    }

    errorMessage.textContent = '';
    showScreen('blog');
    switchSection('news'); // Resetear a la sección de noticias al hacer login
}

function showScreen(screenName) {
    loginScreen.classList.add('hidden');
    blogScreen.classList.add('hidden');
    consequenceScreen.classList.add('hidden');

    if (screenName === 'login') loginScreen.classList.remove('hidden');
    if (screenName === 'blog') blogScreen.classList.remove('hidden');
    if (screenName === 'consequence') consequenceScreen.classList.remove('hidden');
}

function switchSection(section) {
    navButtons.forEach((btn) => btn.classList.remove('active'));

    if (section === 'news') {
        navButtons[0].classList.add('active');
        newsSection.classList.remove('hidden');
        truthSection.classList.add('hidden');
        return;
    }

    if (section === 'truth') {
        navButtons[1].classList.add('active');
        newsSection.classList.add('hidden');
        truthSection.classList.remove('hidden');

        if (newsReadCount < newsData.length) {
            truthMessage.textContent = `Necesitas estar más informado para revelar la verdad. Lee más noticias antes de continuar. Has leído ${newsReadCount} de ${newsData.length}.`;
            truthMessage.style.display = 'block';
            videoContainer.classList.add('hidden');
            choiceButtons.classList.add('hidden');
            return;
        }

        // No se puede resetear iframe de Google Drive
        // truthVideo.currentTime = 0;
        // truthVideo.play();
        // Iniciar el timer para mostrar botones después de 38 segundos
        truthMessage.style.display = 'none';
        videoContainer.classList.remove('hidden');
        if (truthChoicesUnlocked) {
            choiceButtons.classList.remove('hidden');
        } else {
            choiceButtons.classList.add('hidden');
            startVideoTimer();
        }
    }
}

function showConsequence(choice) {
    // Si ya elegiste, al volver a este punto se vuelve a esperar el tiempo completo.
    truthChoicesUnlocked = false;
    if (videoTimerId !== null) {
        clearTimeout(videoTimerId);
        videoTimerId = null;
    }
    // Para iframes de Google Drive, reasignar el src fuerza empezar desde el inicio.
    resetTruthVideo();

    showScreen('consequence');
    consequenceCaptchaAttempt = 0;
    if (consequenceCaptchaTimerId !== null) {
        clearTimeout(consequenceCaptchaTimerId);
        consequenceCaptchaTimerId = null;
    }
    restartButton.classList.toggle('hidden', choice === 'medicine');

    let content = '';

    if (choice === 'truth') {
        content = `
            <h2 class="consequence-title" style="color: #e74c3c;">Has contado la verdad</h2>
            <p class="consequence-text">
                Al elegir contar la verdad, has revelado que Valenthia no es un medicamento milagroso,
                sino una herramienta de control mental diseñada para eliminar la capacidad crítica
                de las personas.
            </p>
            <p class="consequence-text">
                La "felicidad" que promete es en realidad la pérdida total de voluntad propia.
                Los que toman el medicamento se convierten en dóciles seguidores incapaces de
                cuestionar nada.
            </p>
            <p class="consequence-text">
                Has despertado. Ahora eres consciente de la manipulación.
                Pero... ¿Qué harás con esta información?
            </p>
            <p class="consequence-text" style="color: #e74c3c; font-weight: bold;">
                Fin del juego. Gracias por apoyar a una sociedad que aún siente.
            </p>
        `;
    } else {
        content = `
            <h2 class="consequence-title" style="color: #3498db;">Has publicitado la pastilla</h2>
            <p class="consequence-text">
                Sientes una calma absoluta. Todas tus preocupaciones desaparecen.
                El mundo parece perfecto ahora.
            </p>
            <p class="consequence-text">
                Ya no te importan los peligros. Ya no te importan las preguntas.
                Solo sientes una felicidad plena y eterna.
            </p>
            <p class="consequence-text">
                Cruzas la calle sin mirar. Un coche se acerca, pero no importa.
                No sientes miedo. No sientes nada excepto... paz.
            </p>
            <p class="consequence-text" style="color: #e74c3c; font-weight: bold;">
                Fin del juego. Has perdido tu capacidad de cuestionar.
            </p>
            <div class="return-captcha" id="return-captcha">
                <p class="return-captcha-label">Verifica que eres humano para volver al inicio.</p>
                <button class="return-captcha-box" id="return-captcha-box" type="button" aria-label="Iniciar verificación humana">
                    <span class="return-captcha-square" aria-hidden="true"></span>
                    <span class="return-captcha-text">No soy un robot</span>
                </button>
                <p class="return-captcha-status" id="return-captcha-status" aria-live="polite"></p>
            </div>
        `;
    }

    consequenceContent.innerHTML = content;
    const returnCaptchaBox = document.getElementById('return-captcha-box');
    if (returnCaptchaBox) {
        returnCaptchaBox.addEventListener('click', runReturnCaptcha);
    }
}

function runReturnCaptcha() {
    const captchaBox = document.getElementById('return-captcha-box');
    const captchaStatus = document.getElementById('return-captcha-status');
    if (!captchaBox || !captchaStatus || captchaBox.disabled) return;

    const messages = [
        'Verificación fallida. Actividad sospechosa detectada. Intenta de nuevo.',
        'Verificación fallida. Sin actividad humana detectada. Intenta una ultima vez.',
        '⚠️ ¡Error del sistema! Acceso denegado por respuesta emocional insuficiente.'
    ];

    captchaBox.disabled = true;
    captchaBox.classList.add('is-loading');
    captchaStatus.textContent = 'Cargando...';

    consequenceCaptchaTimerId = setTimeout(() => {
        captchaBox.classList.remove('is-loading');
        captchaStatus.textContent = messages[consequenceCaptchaAttempt];
        consequenceCaptchaAttempt++;

        if (consequenceCaptchaAttempt >= messages.length) {
            restartButton.classList.remove('hidden');
            consequenceCaptchaTimerId = null;
            return;
        }

        captchaBox.disabled = false;
        consequenceCaptchaTimerId = null;
    }, 1800);
}

function restartApp() {
    // Cancelar el timer si está activo
    if (videoTimerId !== null) {
        clearTimeout(videoTimerId);
        videoTimerId = null;
    }
    if (consequenceCaptchaTimerId !== null) {
        clearTimeout(consequenceCaptchaTimerId);
        consequenceCaptchaTimerId = null;
    }
    truthChoicesUnlocked = false;
    consequenceCaptchaAttempt = 0;
    restartButton.classList.remove('hidden');
    
    newsReadCount = 0;
    specialNewsUnlocked.clear();
    renderNews();

    selectedEmotions.clear();
    captchaOptions.forEach((option) => option.classList.remove('selected'));

    loginTitle.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    captchaContainer.classList.add('hidden');
    errorMessage.textContent = '';
    passwordInput.value = '';
    // No se puede pausar/resetear iframe de Google Drive
    // truthVideo.pause();
    // truthVideo.currentTime = 0;
    resetTruthVideo();

    showScreen('login');
}

loginButton.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});
captchaContinueButton.addEventListener('click', verifyCaptcha);
captchaOptions.forEach((option) => {
    option.addEventListener('click', () => toggleEmotionSelection(option));
});

navButtons.forEach((button) => {
    button.addEventListener('click', () => {
        switchSection(button.dataset.section);
    });
});

modalClose.addEventListener('click', () => {
    newsModal.classList.add('hidden');
});

newsModal.addEventListener('click', (e) => {
    if (e.target === newsModal) {
        newsModal.classList.add('hidden');
    }
});

truthPill.addEventListener('click', () => showConsequence('truth'));
medicinePill.addEventListener('click', () => showConsequence('medicine'));
restartButton.addEventListener('click', restartApp);

loadNews();
