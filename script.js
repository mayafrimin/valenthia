const CORRECT_PASSWORD = 'conciencia';
let newsReadCount = 0;
let newsData = [];

const loginScreen = document.getElementById('login-screen');
const blogScreen = document.getElementById('blog-screen');
const consequenceScreen = document.getElementById('consequence-screen');

const passwordInput = document.getElementById('password-input');
const loginButton = document.getElementById('login-button');
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
    readButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newsItem = e.target.closest('.news-item');
            if (newsItem) {
                const title = newsItem.querySelector('h3').textContent;
                const fullContent = newsItem.dataset.fullContent;
                
                modalTitle.textContent = title;
                modalBody.innerHTML = fullContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
                newsModal.classList.remove('hidden');
                
                if (newsItem.dataset.read === 'false') {
                    newsItem.dataset.read = 'true';
                    newsReadCount++;
                    button.textContent = 'Leído';
                    button.disabled = true;
                    button.style.background = '#27ae60';
                }
            }
        });
    });
}

loadNews();

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

modalClose.addEventListener('click', () => {
    newsModal.classList.add('hidden');
});

newsModal.addEventListener('click', (e) => {
    if (e.target === newsModal) {
        newsModal.classList.add('hidden');
    }
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
            <h2 class="consequence-title" style="color: #3498db;">Has contado la verdad</h2>
            <p class="consequence-text">
                Al elegir contar la verdad, has revelado que Valexidil no es un medicamento milagroso, 
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
            <h2 class="consequence-title" style="color: #e74c3c;">Has publicitado la pastilla</h2>
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
    renderNews();
    
    passwordInput.value = '';
    errorMessage.textContent = '';
    truthVideo.pause();
    truthVideo.currentTime = 0;
    
    showScreen('login');
}