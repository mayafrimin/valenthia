# Blog Privado - Escape Room

Página estática para escape room que simula un blog privado de una influencer hablando sobre los efectos secundarios descubrideros de un edicamento inventado llamda Valenthia.

## Estructura del proyecto

```
Valenthia/
├── index.html          # Página principal
├── styles.css          # Estilos
├── script.js           # Lógica de la aplicación
├── news.json           # Contenido de las noticias
├── assets/
│   └── video.mp4       # Video para la sección final.
└── README.md           # Este archivo
```

## Funcionalidades

- **Login**: Sistema de autenticación con contraseña
- **Noticias encubiertas**: Noticias sobre Valenthia con modal de lectura completa
- **Desvelo la verdad**: Solo accesible después de leer todas las noticias y resolver el acertijo final
- **Elección final**: Dos opciones con consecuencias diferentes
- **Modal de noticias**: Popup interactivo para leer el contenido completo

## Personalización

- El contenido de las noticias en `news.json`
- Los estilos en `styles.css`
- La lógica en `script.js`
- El video reemplazando `assets/video.mp4`
- La contraseña de acceso en `script.js` (variable `CORRECT_PASSWORD`)

## Cómo editar las noticias

Las noticias se almacenan en `news.json` en formato JSON. Cada noticia tiene:
- `title`: Título de la noticia
- `summary`: Resumen que aparece en la lista
- `fullContent`: Contenido completo que se muestra en el modal
