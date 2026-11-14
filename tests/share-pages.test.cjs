const test = require("node:test");
const assert = require("node:assert/strict");
const { readArticles, renderSharePage } = require("../scripts/generate-share-pages.cjs");

test("each article has a distinct preview and the correct share image", () => {
  const articles = readArticles();
  const urls = articles.map((article) => {
    const page = renderSharePage(article);
    const url = `https://bbpca-kansas.github.io/share/${article.post}.html`;
    assert.ok(page.includes(`property="og:url" content="${url}"`));
    assert.ok(page.includes(`../index.html#article-${article.post}`));
    const image = article.type === "infographic" ? article.image : "assets/bbpca-social-card.jpg";
    assert.ok(page.includes(`property="og:image" content="https://bbpca-kansas.github.io/${image}"`));
    return url;
  });
  assert.equal(new Set(urls).size, articles.length);
});

test("preview metadata escapes text and skips headings and bullets", () => {
  const page = renderSharePage({
    post: "123",
    title: `A "title" & <script>`,
    headings: [0],
    paragraphs: ["Heading", "• A bullet", `It's <safe> & "readable".`],
  });
  assert.ok(page.includes('property="og:title" content="A &quot;title&quot; &amp; &lt;script&gt;"'));
  assert.ok(page.includes('property="og:description" content="It&#39;s &lt;safe&gt; &amp; &quot;readable&quot;."'));
  assert.ok(!page.includes('A "title" & <script>'));
});

test("invalid post numbers and missing infographic images fail generation", () => {
  assert.throws(() => renderSharePage({ post: "../1", title: "Title", paragraphs: ["Text"] }), /valid post/);
  assert.throws(() => renderSharePage({
    post: "1", title: "Title", paragraphs: ["Text"], type: "infographic", image: "assets/missing.jpg",
  }), /invalid or missing share image/);
});
