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

The **From the campaign** section lists 61 BBPCA articles and one infographic. The three newest entries appear first,
followed by the earlier reviewed articles ordered by Facebook views (most viewed first).
It opens with an **articles and infographics index** that can be sorted (newest then most viewed, number, title A–Z or
Z–A) and links to each entry. Its numbers match the article or infographic numbers. Nine entries show at first and a **Show more** button loads the
rest. Articles with matched publication records show their posting dates and times; article 30
has no confirmed match and remains undated. Infographic 49 displays its image and accompanying comment;
articles do not display images. Entry text is stored in `campaign-articles-data.js`.
Article cards cycle through 20 color themes; long plain-text blocks are displayed in shorter
paragraphs when sentence segmentation is available. Existing specially formatted articles retain
their markup. Articles with source lists link directly to their sources and back.

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
