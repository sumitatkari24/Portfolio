# Sumit Atkari — Portfolio

This is a modern, responsive personal portfolio website built with HTML, CSS, and vanilla JavaScript.

## Features
- Futuristic gaming / cyberpunk design
- Responsive layout for desktop and mobile
- Home, About, Skills, Projects, Certifications, Experience, and Contact pages
- Netlify Forms integration for the contact form
- Client-side validation and honeypot spam protection
- Ready for Netlify deployment

## Project structure
- `index.html` — landing page
- `about.html` — about section page
- `skills.html` — skills page
- `projects.html` — projects page
- `certifications.html` — certifications page
- `experience.html` — experience page
- `contact.html` — contact form page
- `style.css` — site styling
- `script.js` — interactivity and form handling
- `assets/` — images and certificate assets
- `netlify.toml` — Netlify publishing and security headers
- `README_NETLIFY.md` — Netlify deployment and email notification setup notes

## Local preview
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in a browser.

## Netlify deployment
This project is configured to work as a static site on Netlify. The form uses Netlify Forms with a hidden `form-name` field and honeypot.

## Contact form email notifications
The project uses Netlify's built-in form system. After deployment, configure notifications in the Netlify dashboard for the `contact` form and send them to `sumitatkari24@gmail.com`.

No passwords, API keys, or Gmail credentials are stored in the repository.
