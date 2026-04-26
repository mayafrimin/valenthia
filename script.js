const CORRECT_PASSWORD = 'conciencia';
let newsReadCount = 0;

const loginScreen = document.getElementById('login-screen');
const blogScreen = document.getElementById('blog-screen');
const consequenceScreen = document.getElementById('consequence-screen');

const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');

const navButtons = document.querySelectorAll('.nav-button');
const newsSection = document.getElementById('news-section');
const truthSection = document.getElementById('truth-section');

const newsItems = document.querySelectorAll('.news-item');
const readButtons = document.querySelectorAll('.read-button');

const truthMessage = document.getElementById('truth-message');
const videoContainer = document.getElementById('video-container');
const truthVideo = document.getElementById('truth-video');
const choiceButtons = document.getElementById('choice-buttons');

const truthPill = document.getElementById('truth-pill');
const medicinePill = document.getElementById('medicine-pill');

const consequenceContent = document.getElementById('consequence-content');
const restartButton = document.getElementById('restart-button');

loginButton.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const section = button.dataset.section;
        switchSection(section);
    });
});

readButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const newsItem = e.target.closest('.news-item');
        if (newsItem && newsItem.dataset.read === 'false') {
            newsItem.dataset.read = 'true';
            newsReadCount++;
            button.textContent = 'Leído';
            button.disabled = true;
            button.style.background = '#27ae60';
        }
    });
});

truthVideo.addEventListener('ended', () => {
    choiceButtons.classList.remove('hidden');
});

truthPill.addEventListener('click', () => showConsequence('truth'));
medicinePill.addEventListener('click', () => showConsequence('medicine'));
restartButton.addEventListener('click', restartApp);

function attemptLogin() {
    const password = passwordInput.value.trim();
    
    if (password === CORRECT_PASSWORD) {
        showScreen('blog');
    } else {
        errorMessage.textContent = 'No eres suficiente milenial para saber la contraseña. ¡Dale una vuelta!';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showScreen(screenName) {
    loginScreen.classList.add('hidden');
    blogScreen.classList.add('hidden');
    consequenceScreen.classList.add('hidden');

    switch(screenName) {
        case 'login':
            loginScreen.classList.remove('hidden');
            break;
        case 'blog':
            blogScreen.classList.remove('hidden');
            break;
        case 'consequence':
            consequenceScreen.classList.remove('hidden');
            break;
    }
}

function switchSection(section) {
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    if (section === 'news') {
        navButtons[0].classList.add('active');
        newsSection.classList.remove('hidden');
        truthSection.classList.add('hidden');
    } else if (section === 'truth') {
        navButtons[1].classList.add('active');
        newsSection.classList.add('hidden');
        truthSection.classList.remove('hidden');
        
        if (newsReadCount === 0) {
            truthMessage.textContent = 'Necesitas estar más informado para revelar la verdad. Lee más noticias antes de continuar.';
            truthMessage.style.display = 'block';
            videoContainer.classList.add('hidden');
            choiceButtons.classList.add('hidden');
        } else {
            truthMessage.style.display = 'none';
            videoContainer.classList.remove('hidden');
            choiceButtons.classList.add('hidden');
            truthVideo.currentTime = 0;
            truthVideo.play();
        }
    }
}

function showConsequence(choice) {
    showScreen('consequence');
    
    let content = '';
    
    if (choice === 'truth') {
        content = `
            <h2 class="consequence-title" style="color: #3498db;">Has revelado la verdad</h2>
            <p class="consequence-text">
                Al elegir la verdad, has descubierto que Emecidad no es un medicamento milagroso, 
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
            <h2 class="consequence-title" style="color: #e74c3c;">Has tomado el medicamento</h2>
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
    newsReadCount = 0;
    newsItems.forEach(item => {
        item.dataset.read = 'false';
        const button = item.querySelector('.read-button');
        button.textContent = 'Leer más';
        button.disabled = false;
        button.style.background = '#667eea';
    });
    
    passwordInput.value = '';
    errorMessage.textContent = '';
    truthVideo.pause();
    truthVideo.currentTime = 0;
    
    showScreen('login');
}