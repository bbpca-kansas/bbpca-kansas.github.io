(() => {
  const gallery = document.querySelector("#campaign-article-grid");
  if (!(gallery instanceof HTMLElement) || !Array.isArray(window.campaignArticles)) {
    throw new Error("Campaign article data or gallery container is missing.");
  }

  const fragment = document.createDocumentFragment();

  for (const article of window.campaignArticles) {
    const card = document.createElement("article");
    card.className = "article-card";

    card.classList.add("article-card--text");
    card.id = `article-${article.post}`;

    const content = document.createElement("div");
    content.className = "article-card-content";

    const meta = document.createElement("p");
    meta.className = "article-meta";
    meta.textContent = `Article ${article.post}`;
    content.append(meta);

    const title = document.createElement("h3");
    title.textContent = article.title;
    content.append(title);

    const details = document.createElement("details");
    if (article.paragraphs.length) {
      const summary = document.createElement("summary");
      summary.textContent = "Read full article";
      details.append(summary);

      const body = document.createElement("div");
      body.className = "article-copy";
      if (article.html) {
        // Trusted, site-authored markup that keeps the article's original formatting.
        body.classList.add("article-rich");
        body.innerHTML = article.html;
      } else {
        for (const paragraph of article.paragraphs) {
          const text = document.createElement("p");
          text.textContent = paragraph;
          body.append(text);
        }
      }
      details.append(body);
      content.append(details);
    }
    card.append(content);
    card.dataset.post = article.post;
    fragment.append(card);
  }

  gallery.replaceChildren(fragment);
  const PAGE_SIZE = 9;
  const cards = Array.from(gallery.children);
  let shown = PAGE_SIZE;
  let updatePaging = () => {};

  const indexList = document.querySelector("#article-index-list");
  const sortSelect = document.querySelector("#article-sort");
  if (indexList instanceof HTMLElement && sortSelect instanceof HTMLSelectElement) {
    const original = window.campaignArticles.map((article, position) => ({ article, position }));
    const sorters = {
      views: (a, b) => a.position - b.position,
      number: (a, b) => Number(a.article.post) - Number(b.article.post),
      az: (a, b) => a.article.title.localeCompare(b.article.title, undefined, { sensitivity: "base" }),
      za: (a, b) => b.article.title.localeCompare(a.article.title, undefined, { sensitivity: "base" }),
    };

    const renderIndex = () => {
      const items = original.slice().sort(sorters[sortSelect.value] || sorters.views);
      indexList.replaceChildren(...items.map(({ article }) => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#article-${article.post}`;
        link.textContent = article.title;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const card = cards.find((c) => c.dataset.post === article.post);
          if (!card) return;
          shown = Math.max(shown, cards.indexOf(card) + 1);
          updatePaging();
          const details = card.querySelector("details");
          if (details) details.open = true;
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        item.append(link);
        return item;
      }));
    };

    sortSelect.addEventListener("change", renderIndex);
    renderIndex();
  }

  gallery.replaceChildren(...cards);
  gallery.className = "article-grid";

  if (cards.length > PAGE_SIZE) {
    const more = document.createElement("div");
    more.className = "article-more";

    const status = document.createElement("p");
    status.setAttribute("role", "status");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button button-dark";

    const update = () => {
      cards.forEach((card, i) => { card.hidden = i >= shown; });
      const remaining = cards.length - shown;
      status.textContent = `Showing ${Math.min(shown, cards.length)} of ${cards.length} articles`;
      button.textContent = `Show ${Math.max(0, Math.min(PAGE_SIZE, remaining))} more`;
      more.hidden = false;
      button.hidden = remaining <= 0;
    };

    updatePaging = update;
    button.addEventListener("click", () => {
      shown += PAGE_SIZE;
      update();
    });

    more.append(status, button);
    gallery.after(more);
    update();
  }
})();
