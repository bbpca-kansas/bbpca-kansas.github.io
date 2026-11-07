(() => {
  const gallery = document.querySelector("#campaign-article-grid");
  if (!(gallery instanceof HTMLElement) || !Array.isArray(window.campaignArticles)) {
    throw new Error("Campaign article data or gallery container is missing.");
  }

  const fragment = document.createDocumentFragment();
  if (!Array.isArray(window.articleSources)) {
    console.error("Article source data is missing; article source links are unavailable.");
  }
  const sourcedPosts = new Set(Array.isArray(window.articleSources) ? window.articleSources.map(({ post }) => post) : []);
  const topics = {
    sb30: /SB ?30\b/i,
    history: /history|civil rights|Highlander|Tiffany/i,
    deregulation: /deregulat|sugaring|SB ?434/i,
    funding: /Koch|Policy Institute|Americans for Prosperity|lobby|Justice Institute|Opportunity Solutions/i,
    board: /Board of Cosmetology/i,
    safety: /safety|infection|injur|sanitation/i,
  };
  const topicLabels = {
    sb30: "SB 30",
    history: "History",
    deregulation: "Deregulation",
    funding: "Funding & lobbying",
    board: "Board of Cosmetology",
    safety: "Safety",
    other: "Industry & careers",
  };
  const searchText = new Map(window.campaignArticles.map((article) => [
    article.post,
    `${article.title} ${article.paragraphs.join(" ")}`.toLowerCase(),
  ]));
  const sentenceSegmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("en", { granularity: "sentence" })
    : null;

  const readableParagraphs = (paragraph) => {
    if (paragraph.length <= 700 || !sentenceSegmenter) return [paragraph];
    const sentences = Array.from(sentenceSegmenter.segment(paragraph), (part) => part.segment);
    const groups = [sentences[0]];
    let group = "";
    for (const sentence of sentences.slice(1)) {
      if (group && group.length + sentence.length > 350) {
        groups.push(group);
        group = "";
      }
      group += sentence;
    }
    if (group) groups.push(group);
    return groups;
  };

  for (const article of window.campaignArticles) {
    const card = document.createElement("article");
    card.className = "article-card";

    card.classList.add("article-card--text");
    card.id = `article-${article.post}`;
    if (Number(article.post) % 2 === 0) card.classList.add("article-card--sans-title");

    const content = document.createElement("div");
    content.className = "article-card-content";

    const topic = Object.entries(topics).find(([, pattern]) => pattern.test(searchText.get(article.post)));
    const topicKey = topic ? topic[0] : "other";
    const topicTag = document.createElement("p");
    topicTag.className = "article-topic-tag";
    topicTag.textContent = topicLabels[topicKey];
    content.append(topicTag);

    const meta = document.createElement("p");
    meta.className = "article-meta";
    meta.textContent = `Article ${article.post}`;
    content.append(meta);

    if (article.postedAt && article.postedLabel) {
      const date = document.createElement("time");
      date.className = "article-posted";
      date.dateTime = article.postedAt;
      date.textContent = article.postedLabel;
      content.append(date);
    }

    const title = document.createElement("h3");
    title.textContent = article.title;
    content.append(title);

    const preview = article.paragraphs.find((paragraph, index) =>
      !article.headings?.includes(index) && paragraph.trim() && !paragraph.trim().startsWith("•"),
    );
    if (preview) {
      const excerpt = document.createElement("p");
      excerpt.className = "article-excerpt";
      const trimmedPreview = preview.trim();
      excerpt.textContent = trimmedPreview.length > 200
        ? `${trimmedPreview.slice(0, 197).replace(/\s+\S*$/, "")}…`
        : trimmedPreview;
      content.append(excerpt);
    }

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
        for (const [index, paragraph] of article.paragraphs.entries()) {
          if (article.headings?.includes(index)) {
            const heading = document.createElement("h4");
            heading.className = "article-section-heading";
            heading.textContent = paragraph;
            body.append(heading);
            continue;
          }
          for (const part of readableParagraphs(paragraph)) {
            const text = document.createElement("p");
            text.textContent = part;
            if (!body.hasChildNodes() && part.trim().length <= 260) text.classList.add("article-lede");
            body.append(text);
          }
        }
      }
      details.append(body);
      details.addEventListener("toggle", () => card.classList.toggle("article-card--expanded", details.open));
      content.append(details);
    }
    if (sourcedPosts.has(article.post)) {
      const sourceLink = document.createElement("a");
      sourceLink.className = "article-source-link";
      sourceLink.href = `resources.html#sources-article-${article.post}`;
      sourceLink.textContent = "View sources";
      sourceLink.setAttribute("aria-label", `View sources for article ${article.post}: ${article.title}`);
      content.append(sourceLink);
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
  const searchInput = document.querySelector("#article-search");
  const topicSelect = document.querySelector("#article-topic");
  const statusLine = document.querySelector("#article-index-status");

  const matches = (article) => {
    const query = searchInput instanceof HTMLInputElement ? searchInput.value.trim().toLowerCase() : "";
    const topic = topicSelect instanceof HTMLSelectElement ? topics[topicSelect.value] : null;
    const text = searchText.get(article.post);
    return (!query || query.split(/\s+/).every((word) => text.includes(word))) && (!topic || topic.test(text));
  };
  const isFiltering = () =>
    (searchInput instanceof HTMLInputElement && searchInput.value.trim() !== "") ||
    (topicSelect instanceof HTMLSelectElement && topicSelect.value !== "");
  let renderIndex = () => {};

  if (indexList instanceof HTMLElement && sortSelect instanceof HTMLSelectElement) {
    const original = window.campaignArticles.map((article, position) => ({ article, position }));
    const sorters = {
      views: (a, b) => a.position - b.position,
      number: (a, b) => Number(a.article.post) - Number(b.article.post),
      az: (a, b) => a.article.title.localeCompare(b.article.title, undefined, { sensitivity: "base" }),
      za: (a, b) => b.article.title.localeCompare(a.article.title, undefined, { sensitivity: "base" }),
    };

    renderIndex = () => {
      const items = original.filter(({ article }) => matches(article)).sort(sorters[sortSelect.value] || sorters.views);
      if (statusLine instanceof HTMLElement) {
        statusLine.textContent = isFiltering()
          ? `${items.length} of ${original.length} articles match.`
          : "";
      }
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

  const articleByPost = new Map(window.campaignArticles.map((article) => [article.post, article]));
  let more = null;
  let status = null;
  let button = null;

  const update = () => {
    if (isFiltering()) {
      cards.forEach((card) => { card.hidden = !matches(articleByPost.get(card.dataset.post)); });
      if (more) more.hidden = true;
      return;
    }
    cards.forEach((card, i) => { card.hidden = i >= shown; });
    if (!more) return;
    const remaining = cards.length - shown;
    status.textContent = `Showing ${Math.min(shown, cards.length)} of ${cards.length} articles`;
    button.textContent = `Show ${Math.max(0, Math.min(PAGE_SIZE, remaining))} more`;
    more.hidden = false;
    button.hidden = remaining <= 0;
  };
  updatePaging = update;

  if (cards.length > PAGE_SIZE) {
    more = document.createElement("div");
    more.className = "article-more";

    status = document.createElement("p");
    status.setAttribute("role", "status");
    button = document.createElement("button");
    button.type = "button";
    button.className = "button button-dark";

    button.addEventListener("click", () => {
      shown += PAGE_SIZE;
      update();
    });

    more.append(status, button);
    gallery.after(more);
  }
  update();

  const onFilterChange = () => {
    renderIndex();
    update();
  };
  if (searchInput instanceof HTMLInputElement) searchInput.addEventListener("input", onFilterChange);
  if (topicSelect instanceof HTMLSelectElement) topicSelect.addEventListener("change", onFilterChange);

  const openLinkedArticle = () => {
    const match = location.hash.match(/^#article-(\d+)$/);
    if (!match) return;
    const card = cards.find((item) => item.dataset.post === match[1]);
    if (!card) return;
    if (searchInput instanceof HTMLInputElement) searchInput.value = "";
    if (topicSelect instanceof HTMLSelectElement) topicSelect.value = "";
    shown = Math.max(shown, cards.indexOf(card) + 1);
    renderIndex();
    update();
    const details = card.querySelector("details");
    if (details) details.open = true;
    card.scrollIntoView({ block: "start" });
  };
  window.addEventListener("hashchange", openLinkedArticle);
  openLinkedArticle();
})();
