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
installation or build step is required.

The **From the campaign** section displays articles and infographics newest first by default.
The index and cards can also be sorted by number or title, and page controls show nine entries per page.
Article 30 uses its first successful website deployment time because its original posting time is unconfirmed.
Cards can be opened or closed by clicking the card or using the control with a keyboard; selecting one in
the index opens it. Image cards place the image above the text. To add an image to an article, provide both
`image` (the image path) and `imageAlt` (a description of the image) in `campaign-articles-data.js`.
Long plain-text blocks are displayed in shorter paragraphs when sentence segmentation is available.
Existing specially formatted articles retain their markup. Articles with source lists link directly to
their sources and back.

The homepage shows selected news and resources. The complete searchable resource catalog and
article-by-article citations are on `resources.html`; the publisher filter applies to resource
cards, topic filtering narrows resource cards, and article filtering narrows article-source entries.
Search covers resource cards and article-source entries. The SB 30 fact sheet is available at
`fact-sheet.html` with links to primary sources.

Archived article images are kept out of the website in `archive/article-images/`, with the article-to-image
mapping in `archive/article-images.json`. The deploy workflow excludes `archive/`.

The site's fonts (DM Sans and Playfair Display) are self-hosted in `assets/fonts/`, so the page
does not load anything from Google Fonts.

Page views are measured with GoatCounter using the `bbpconsumeradvocates` site.

The site footer includes a legal disclaimer explaining that BBPCA provides general information,
not legal advice or legal services, and that visiting or contacting the group does not create an
attorney-client relationship.

## Contact and campaign links

- Email: [bbpconsumeradvocates@gmail.com](mailto:bbpconsumeradvocates@gmail.com)
- Advocacy Action Center: `advocacy-action-center.html` (four actions link to Google Forms; `petitions.html` redirects here)
- Facebook: [Kansas Beauty and Barber Professionals Consumer Advocates](https://www.facebook.com/people/Kansas-Beauty-and-Barber-Professionals/61594822378441/)
