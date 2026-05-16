const PASSWORD_HASH = '03a98f74306972aaa78ab766d29f0a9ffa69c03a5d72b1ac67543efc9bfddaad';
const REQUIRED_EMOTIONS = ['alegria', 'tristeza', 'miedo', 'rabia', 'amor', 'sorpresa'];

let newsReadCount = 0;
let newsData = [];
let videoTimerId = null; // Variable para guardar el ID del timer
const selectedEmotions = new Set();

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
    newsData.forEach((news) => {
        const article = document.createElement('article');
        article.className = 'news-item';
        article.dataset.read = 'false';
        article.dataset.fullContent = news.fullContent;
        
        article.innerHTML = `
            <h3>${news.title}</h3>
            <p>${news.summary}</p>
            <button class="read-button">Leer más</button>
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

            const title = newsItem.querySelector('h3').textContent;
            const fullContent = newsItem.dataset.fullContent;

            modalTitle.textContent = title;
            modalBody.innerHTML = fullContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
            newsModal.classList.remove('hidden');

            if (newsItem.dataset.read === 'false') {
                newsItem.dataset.read = 'true';
                newsReadCount++;
                button.textContent = 'Leído';
                button.style.background = '#27ae60';
            }
        });
    });
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
        choiceButtons.classList.remove('hidden');
    }, 38000); // 38 segundos en milisegundos
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

    errorMessage.textContent = 'No eres suficiente milenial para saber la contraseña. ¡Dale una vuelta!';
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
        errorMessage.textContent = '¿Seguro que eres humano? ¿Has tomado Valenthia? Vuelvelo a intentar';
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

        if (newsReadCount === 0) {
            truthMessage.textContent = 'Necesitas estar más informado para revelar la verdad. Lee más noticias antes de continuar.';
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
        choiceButtons.classList.add('hidden');
        startVideoTimer();
    }
}

function showConsequence(choice) {
    showScreen('consequence');

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
                Pero... ¿qué harás con esta información?
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
        `;
    }

    consequenceContent.innerHTML = content;
}

function restartApp() {
    // Cancelar el timer si está activo
    if (videoTimerId !== null) {
        clearTimeout(videoTimerId);
        videoTimerId = null;
    }
    
    newsReadCount = 0;
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
