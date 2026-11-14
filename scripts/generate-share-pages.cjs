const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const site = "https://bbpca-kansas.github.io/";
const defaultImage = "assets/bbpca-social-card.jpg";
const siteName = "Kansas Beauty and Barber Professionals Consumer Advocates";

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function readArticles() {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "campaign-articles-data.js"), "utf8"), context);
  if (!Array.isArray(context.window.campaignArticles)) throw new Error("Campaign article data is missing.");
  return context.window.campaignArticles;
}

function renderSharePage(article) {
  if (typeof article.post !== "string" || !/^[1-9]\d*$/.test(article.post)
      || typeof article.title !== "string" || !article.title.trim()
      || !Array.isArray(article.paragraphs)) {
    throw new Error("An article is missing a valid post number, title, or paragraphs.");
  }
  const paragraph = article.paragraphs.find((text, index) =>
    typeof text === "string" && !article.headings?.includes(index)
      && text.trim() && !text.trim().startsWith("•"),
  );
  if (!paragraph) throw new Error(`Article ${article.post} has no preview text.`);
  const description = paragraph.trim().replace(/\s+/g, " ");
  const excerpt = description.length > 200 ? `${description.slice(0, 197).replace(/\s+\S*$/, "")}…` : description;
  const image = article.type === "infographic" ? article.image : defaultImage;
  if (typeof image !== "string" || !/^assets\/[a-zA-Z0-9._/-]+$/.test(image)
      || image.split("/").includes("..") || !fs.existsSync(path.join(root, image))) {
    throw new Error(`Article ${article.post} has an invalid or missing share image.`);
  }
  const imageAlt = article.type === "infographic" ? article.imageAlt : siteName;
  if (typeof imageAlt !== "string" || !imageAlt.trim()) {
    throw new Error(`Article ${article.post} has no share image description.`);
  }
  const url = `${site}share/${article.post}.html`;
  const destination = `../index.html#article-${article.post}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.title)} | ${escapeHtml(siteName)}</title>
  <meta name="description" content="${escapeHtml(excerpt)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(excerpt)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}${image}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${url}">
  <script>location.replace("${destination}");</script>
</head>
<body>
  <p>Opening ${escapeHtml(article.title)}. <a href="${destination}">Continue to the article</a>.</p>
</body>
</html>
`;
}

function generatePages(outputRoot) {
  const articles = readArticles();
  const seen = new Set();
  const pages = articles.map((article) => {
    const html = renderSharePage(article);
    if (seen.has(article.post)) throw new Error(`Duplicate article number: ${article.post}`);
    seen.add(article.post);
    return { post: article.post, html };
  });
  const directory = path.join(outputRoot, "share");
  fs.mkdirSync(directory, { recursive: true });
  for (const page of pages) fs.writeFileSync(path.join(directory, `${page.post}.html`), page.html);
  console.log(`Generated ${pages.length} share pages in ${directory}`);
}

if (require.main === module) generatePages(path.resolve(process.argv[2] || root));

module.exports = { readArticles, renderSharePage };
