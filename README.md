# Shri Vallabh Sharanam

The Shri Vallabh Sharanam Pushtimarg website, rebuilt with a modern design. Every page carries the original text of shrivallabhsharanam.com exactly as written; only the layout, menus and styling are new.

It is hosted on Vercel at https://shrivallabhsharanam.vercel.app and connected to this GitHub repository. Whenever a file changes here, Vercel republishes the site within a minute or so.

## What is in the folder

| Path | What it is |
| --- | --- |
| `index.html` | Home page |
| `contents.html`, `sitemap.html` | Contents and site map |
| `*.html` | One file per page, named after the original page (for example `story29.html`, `ekadashi14.html`, `s6.html`) |
| `img/` | Pictures from the original site |
| `assets/css/style.css` | Styling, including light and dark mode |
| `assets/js/main.js` | Search, menus, quizzes, forms and share buttons |
| `assets/search.json` | Search index of all pages |
| `vercel.json` | Sends old addresses such as `/main/kultree.html` to the new pages |
| `MISSING-CONTENT.md` | Content that was not in the archive the site was built from |

## Editing a page

Open the page's file on GitHub, click the pencil icon, change the text inside `<article>`, and click **Commit changes**. The menus appear on every page, so adding or renaming pages is best done by regenerating the site.

## Write to us

The Feedback, Guru's Blessing and Queries forms open the visitor's email app addressed to shrivallabhsharanam@gmail.com. To change the address, edit `CONTACT_EMAIL` near the top of `assets/js/main.js`.
