Netlify Deployment & Form Setup

This project is a static portfolio website. These notes show exact steps to deploy from GitHub to Netlify and configure email notifications for Netlify Forms.

1) Push your repo to GitHub

- Ensure your local changes are committed and pushed:

```bash
git add .
git commit -m "Prepare site for Netlify forms"
git push origin main
```

2) Deploy to Netlify (GitHub integration)

- Sign in at https://app.netlify.com/
- Click "Add new site" → "Import from Git" → choose GitHub.
- Select the repository for this portfolio.
- Build settings: leave "Build command" empty for a static site.
- Publish directory: `.` (root of the repo).
- Deploy site.

3) Verify the Contact form is detected

- After the initial deploy, go to your Site dashboard → "Forms".
- You should see a form named `contact` (Netlify discovers forms from deployed HTML).
- Submit a test entry on the live site to confirm it appears in the form submissions list.

4) Configure email notifications (so submissions email you)

- Site dashboard → Forms → click the `contact` form.
- Click "Notifications" (or the bell/settings icon) → "Add notification" → choose "Email".
- Enter: sumitatkari24@gmail.com and save.
- Netlify will send notifications to that address when submissions arrive.

Notes: Netlify stores submissions even if notifications are not configured. You can export submissions as CSV from the Forms UI.

5) Spam protection (optional)

- A honeypot is already included (hidden `bot-field`).
- For stronger protection, register reCAPTCHA (v2) at https://www.google.com/recaptcha/admin and then:
  - In Netlify Site settings → Forms → reCAPTCHA, enter the site key and secret.
  - Uncomment the `data-netlify-recaptcha` scaffolding in `contact.html` (see comment near the form).

6) Security notes

- Do NOT store any API keys, SMTP credentials, or passwords in this repository.
- Use Netlify site settings to store any secrets (reCAPTCHA keys) when required.

7) Troubleshooting

- If Netlify does not show the `contact` form:
  - Confirm the deployed HTML includes `data-netlify="true"` and `<input type="hidden" name="form-name" value="contact">`.
  - Re-deploy the site (trigger a new deploy from the Netlify UI or push a new commit).

- If you don't receive email notifications:
  - Verify your notification is added in Site → Forms → Notifications.
  - Check spam folder; Netlify sends from its own domains.

8) Optional: `netlify.toml`

This repo includes `netlify.toml` with `publish = "."` and some basic security headers. You can customize it later for redirects or headers.

If you'd like, I can enable reCAPTCHA scaffolding in the form (requires the site & secret keys) or create a Netlify webhook integration (e.g., forward to Slack or automation).