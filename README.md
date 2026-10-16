# Salmast

Salmast is a responsive, single-page website for **Salmast Furniture**, an Armenian custom-furniture company. It presents the company, its services and completed projects, then lets prospective customers request a free design consultation.

View the live website at [salmast.am](https://salmast.am).

The site is intentionally simple: it is served directly from the `site/` directory and has no build step. The consultation form saves submitted name, email, and phone data to Firebase Realtime Database.

## Features

- Responsive landing page with navigation, gallery, testimonials, and contact details
- Furniture portfolio using locally stored images and SVG assets
- English, Armenian, and Russian interface text
- Client-side form validation for name, email, and numeric phone number
- Firebase Realtime Database integration for consultation requests
- Social-media links and Meta Pixel tracking
- Legacy PHP/PHPMailer contact-form endpoint, retained under `site/bat/`

## Project layout

```text
.
├── site/                         # Web root; deploy this directory
│   ├── index.html                # Page structure and content
│   ├── css/                      # Bootstrap, fonts, and site styles
│   ├── js/
│   │   ├── core.min.js           # Third-party UI plugins
│   │   ├── firebaseConfig.js     # Firebase client configuration
│   │   └── script.js             # UI, translations, validation, form submission
│   ├── images/                   # Portfolio, branding, and UI images
│   ├── fonts/                    # Local web fonts
│   └── bat/                      # Legacy PHP mail form and reCAPTCHA code
├── package.json                  # Firebase package metadata
└── documentation.txt             # Original template documentation link
```

## Run locally

Any static HTTP server can serve the website. From the repository root, for example:

```bash
cd site
php -S localhost:8080
```

Open [http://localhost:8080](http://localhost:8080) in a browser.

The page loads Firebase from the CDN, so installing npm packages is not required to preview or edit the current site. `package.json` records Firebase as a dependency for projects that prefer to manage it through npm.

## Configuration

### Firebase

The browser configuration is in `site/js/firebaseConfig.js`. Update it when moving the site to a different Firebase project. The form in `site/js/script.js` writes each request to:

```text
users/{name}
```

with `username`, `email`, and `phone` fields.

Firebase web configuration values are visible to visitors by design; they are not secrets. Protect submitted data with restrictive **Firebase Realtime Database Rules** and appropriate Firebase App Check/authentication before using this in production. Do not place server credentials or private keys in JavaScript files.

### Content, translations, and assets

- Edit page copy, links, company contact details, and section markup in `site/index.html`.
- Edit the `translations` object and language-selection behavior in `site/js/script.js`.
- Replace images in `site/images/`, then update their matching paths in `site/index.html`.
- Adjust colors, spacing, and responsive presentation in `site/css/style.css`.

### Legacy mail form

`site/bat/rd-mailform.php` and `site/bat/rd-mailform.config.json` are a PHPMailer-based endpoint supplied with the original template. The current consultation form is intercepted in `site/js/script.js` and saves directly to Firebase, so the PHP endpoint is not part of the normal submission path.

If you deliberately re-enable the PHP form, configure a real recipient and SMTP details in `site/bat/rd-mailform.config.json`, keep that file out of version control if it contains credentials, and serve the site with PHP. Do not use the placeholder values currently in that file.

## Deploy

Deploy the **contents of `site/`** to any static hosting provider. The page uses relative paths, so `index.html` must remain alongside the `css/`, `js/`, `images/`, and `fonts/` directories.

Before going live:

1. Verify the Firebase project and database rules.
2. Submit a test consultation request and confirm the expected database record is created.
3. Review the contact information, social links, portfolio images, and Meta Pixel ID in `site/index.html`.
4. If you enable the legacy PHP endpoint, configure SMTP securely and test it on the production host.

## Development notes

- There is currently no automated test suite or build command.
- `site/js/core.min.js` is a bundled third-party asset; avoid editing it unless you are updating the underlying UI plugins.
- The original template documentation URL is available in `documentation.txt`.

## License

No license is currently specified. Add one before distributing or reusing the project outside its intended scope.
