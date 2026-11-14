# Kansas Beauty and Barber Professionals Consumer Advocates

Static website for the Kansas Beauty and Barber Professionals Consumer Advocates.

## Publish with GitHub Pages

The `Deploy static site to GitHub Pages` workflow publishes the site whenever changes are
pushed to the `main` branch. In the repository settings, set **Pages → Build and deployment →
Source** to **GitHub Actions**. After the first successful workflow run, the public site is
available at:

`https://bbpca-kansas.github.io/`

## Local preview

Open `index.html` in a web browser. The site uses static HTML, CSS, and JavaScript; no package
installation or build step is required for the main pages.

The **From the campaign** section displays articles and infographics newest first by default.
The index and cards can also be sorted by number or title, and page controls show nine entries per page.
Article 30 uses its first successful website deployment time because its original posting time is unconfirmed.
Cards can be opened or closed by clicking the card or using the control with a keyboard; selecting one in
the index opens it. Image cards place the image above the text. To add an image to an article, provide both
`image` (the image path) and `imageAlt` (a description of the image) in `campaign-articles-data.js`.
Long plain-text blocks are displayed in shorter paragraphs when sentence segmentation is available.
Existing specially formatted articles retain their markup. Articles with source lists link directly to
their sources and back.

Each card has a copy-link button for sharing the article in Facebook, email, messages, or other
services. Infographic cards also offer an image download. Facebook and other services decide how
to display or cache previews.

The Pages workflow runs `node scripts/generate-share-pages.cjs _site` to create a separate preview
page for each card from `campaign-articles-data.js`. Article previews use the BBPCA social image;
infographic previews use their own image. Shared links point to the public site and open the
corresponding card. To generate preview pages locally, install Node.js and run
`node scripts/generate-share-pages.cjs`; the generated `share/` directory is ignored by Git.
Run `node --test tests/share-pages.test.cjs` to check preview generation.

The homepage shows selected news and resources. The complete searchable resource catalog and
article-by-article citations are on `resources.html`; the publisher filter applies to resource
cards, topic filtering narrows resource cards, and article filtering narrows article-source entries.
Search covers resource cards and article-source entries. The SB 30 fact sheet is available at
`fact-sheet.html` with links to primary sources.
`consumer-watch.html` is a manually maintained, dated legislative watch with links to its sources;
review its dates, bill statuses, and citations when updating it.

Archived article images are kept out of the website in `archive/article-images/`, with the article-to-image
mapping in `archive/article-images.json`. The deploy workflow excludes `archive/`.

The site's fonts (DM Sans and Playfair Display) are self-hosted in `assets/fonts/`, so the page
does not load anything from Google Fonts.

GoatCounter measures page views on the homepage, resource library, Consumer Watch, and Advocacy
Action Center. Events count article openings, copy-link clicks, action-button clicks, and external
resource-link clicks; action clicks do not confirm form submissions. Event names use public titles
and identifiers, not form entries or search terms. URLs with query strings are not tracked, and
page-view referrers are limited to their origin. Blockers or unavailable analytics can prevent counts.
Run `node --test tests/analytics.test.cjs` to check event tracking.

The site footer includes a legal disclaimer explaining that BBPCA provides general information,
not legal advice or legal services, and that visiting or contacting the group does not create an
attorney-client relationship.

## Contact and campaign links

- Email: [bbpconsumeradvocates@gmail.com](mailto:bbpconsumeradvocates@gmail.com)
- Advocacy Action Center: `advocacy-action-center.html` (four actions link to Google Forms; `petitions.html` redirects here)
- Facebook: [Kansas Beauty and Barber Professionals Consumer Advocates](https://www.facebook.com/people/Kansas-Beauty-and-Barber-Professionals/61594822378441/)
