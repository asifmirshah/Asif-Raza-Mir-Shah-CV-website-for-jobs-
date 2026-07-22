# Muhammad Asif — Portfolio

Static portfolio site. No build step, no dependencies to install.

## Publish on GitHub Pages

1. Create a new repository on GitHub (public), e.g. `portfolio`.
2. Upload every file and folder from this folder to the repository root —
   `index.html` must sit at the top level, not inside another folder.
3. Repository **Settings → Pages** → Source: **Deploy from a branch**,
   Branch: `main`, Folder: `/ (root)` → **Save**.
4. Your site goes live at `https://YOUR-USERNAME.github.io/portfolio/`
   (allow a minute or two for the first build).

Tip: naming the repository `YOUR-USERNAME.github.io` publishes it at
`https://YOUR-USERNAME.github.io/` instead.

## Two pages

    index.html   freelance / client version (Hire me)
    jobs.html    employer version for Saudi Arabia, the GCC and Europe

They link to each other in the top navigation and share the same CSS,
JavaScript and images. Send recruiters the `jobs.html` link directly:
`https://YOUR-USERNAME.github.io/portfolio/jobs.html`

## Files

    index.html        freelance version
    jobs.html         employer / recruiter version
    cv/               downloadable CV (PDF)
    css/style.css     styling, 3D coverflow, animations
    js/main.js        three.js hero scene, sliders, counters
    images/           photos and client review screenshots
    .nojekyll         tells GitHub Pages to serve files as-is

## Replacing the CV

The Download CV button does not link to the PDF. If it did, some browsers
would open the file in a viewer instead of saving it. Instead the PDF is
embedded in `js/cv-data.js` as base64 text and rebuilt in the browser, so
it always lands in the visitor's Downloads folder.

To swap in a new CV:

1. Put your new PDF at `cv/Muhammad-Asif-CV.pdf` (keep the same name).
2. Convert it to base64. On Windows PowerShell:

       [Convert]::ToBase64String([IO.File]::ReadAllBytes("cv\Muhammad-Asif-CV.pdf")) | Set-Clipboard

   On Mac or Linux:

       base64 -w0 cv/Muhammad-Asif-CV.pdf

3. Open `js/cv-data.js` and paste the result between the quotation marks,
   replacing the old text. Keep the line ending in `";`.

## Editing your WhatsApp number

The number appears in **three** places in `index.html` and **four** in `jobs.html` (hero button,
contact button, floating green button). Search for `wa.me` and replace
the digits after it. Format: country code + number, no `+`, no spaces.
Pakistan example: `923250918103`.

## Editing text

All text is plain HTML in `index.html`. Section order:
hero → stats → services → track record (Gantt) → credentials → client proof → contact.
