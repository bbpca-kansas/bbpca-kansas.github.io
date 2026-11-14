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

  const makeShareControls = (article, isInfographic) => {
    const url = `https://bbpca-kansas.github.io/share/${article.post}.html`;
    const share = document.createElement("div");
    share.className = "article-share";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "article-share-toggle";
    toggle.textContent = "Share";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `Share ${article.title}`);
    const panel = document.createElement("div");
    panel.className = "article-share-panel";
    panel.hidden = true;
    panel.id = `share-options-${article.post}`;
    toggle.setAttribute("aria-controls", panel.id);

    const links = document.createElement("div");
    links.className = "article-share-actions";
    const addLink = (label, href, newTab = false) => {
      const link = document.createElement("a");
      link.textContent = label;
      link.href = href;
      if (newTab) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      links.append(link);
      return link;
    };
    const addButton = (label, action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", action);
      links.append(button);
      return button;
    };
    const status = document.createElement("p");
    status.className = "article-share-status";
    status.setAttribute("role", "status");
    const manualLink = document.createElement("input");
    manualLink.type = "text";
    manualLink.readOnly = true;
    manualLink.value = url;
    manualLink.hidden = true;
    manualLink.setAttribute("aria-label", `Share link for ${article.title}`);

    addLink("Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, true);
    addLink("Email", `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`${article.title}\n${url}`)}`);
    addLink("Text", `sms:?body=${encodeURIComponent(`${article.title}\n${url}`)}`);
    addButton("Copy link", async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
        await navigator.clipboard.writeText(url);
        manualLink.hidden = true;
        status.textContent = "Link copied.";
      } catch (error) {
        console.error("Could not copy the share link:", error);
        manualLink.hidden = false;
        manualLink.select();
        status.textContent = "Could not copy automatically. Select and copy the link below.";
      }
    });

    const shareError = (error) => {
      if (error.name === "AbortError") {
        status.textContent = "Sharing canceled.";
      } else {
        console.error("Could not open device sharing:", error);
        status.textContent = "Could not open device sharing. Try another sharing option.";
      }
    };
    if (typeof navigator.share === "function") {
      addButton("More sharing options", async () => {
        try {
          await navigator.share({ title: article.title, url });
        } catch (error) {
          shareError(error);
        }
      });
    }

    let prepareImage;
    if (isInfographic) {
      const download = addLink("Download image", article.image);
      download.download = "";
      if (typeof navigator.share === "function" && typeof navigator.canShare === "function"
          && typeof File === "function") {
        let imageFile;
        let loading = false;
        const imageButton = addButton("Share image", async () => {
          try {
            await navigator.share({ files: [imageFile], title: article.title });
          } catch (error) {
            shareError(error);
          }
        });
        imageButton.hidden = true;
        prepareImage = async () => {
          if (loading || imageFile) return;
          loading = true;
          try {
            const response = await fetch(article.image);
            if (!response.ok) throw new Error(`Image request failed (${response.status}).`);
            const blob = await response.blob();
            const file = new File([blob], article.image.split("/").pop(), { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
              imageFile = file;
              imageButton.hidden = false;
            }
          } catch (error) {
            console.error("Could not prepare the infographic for sharing:", error);
            status.textContent = "Could not prepare image sharing. Use Download image instead.";
          } finally {
            loading = false;
          }
        };
      }
    }
    const note = document.createElement("p");
    note.className = "article-share-note";
    note.textContent = isInfographic
      ? "For Instagram, use device sharing if available or download the image."
      : "Instagram sharing depends on your device and app.";
    panel.append(links, note, status, manualLink);
    toggle.addEventListener("click", () => {
      panel.hidden = !panel.hidden;
      toggle.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden && prepareImage) prepareImage();
    });
    share.append(toggle, panel);
    return share;
  };

  for (const article of window.campaignArticles) {
    const card = document.createElement("article");
    card.className = "article-card";

    card.classList.add("article-card--text");
    const isInfographic = article.type === "infographic";
    const hasImage = isInfographic || article.image !== undefined || article.imageAlt !== undefined;
    if (hasImage) card.classList.add("article-card--with-image");
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
    meta.textContent = `${isInfographic ? "Infographic" : "Article"} ${article.post}`;
    content.append(meta);

    if (article.postedAt && article.postedLabel) {
      const date = document.createElement("time");
      date.className = "article-posted";
      date.dateTime = article.postedAt;
      date.textContent = article.postedLabel;
      content.append(date);
    } else {
      const date = document.createElement("p");
      date.className = "article-posted";
      date.textContent = "Posting date unavailable";
      content.append(date);
    }

    const title = document.createElement("h3");
    title.textContent = article.title;
    content.append(title);

    let textContent = content;
    if (hasImage) {
      if (typeof article.image !== "string" || !article.image.trim()
          || typeof article.imageAlt !== "string" || !article.imageAlt.trim()) {
        throw new Error(`Article or infographic ${article.post} is missing its image or alt text.`);
      }
      const layout = document.createElement("div");
      layout.className = "article-image-layout";
      const image = document.createElement("img");
      const updateImageOrientation = () => {
        if (image.naturalWidth && image.naturalHeight) {
          const isLandscape = image.naturalWidth > image.naturalHeight;
          card.classList.toggle("article-card--landscape", isLandscape);
          card.classList.toggle("article-card--portrait", image.naturalHeight > image.naturalWidth);
        }
      };
      image.addEventListener("load", updateImageOrientation, { once: true });
      image.src = article.image;
      image.alt = article.imageAlt;
      image.loading = "lazy";
      if (image.complete) updateImageOrientation();
      textContent = document.createElement("div");
      textContent.className = "article-image-text";
      layout.append(image, textContent);
      content.append(layout);
    }

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
      textContent.append(excerpt);
    }

    const details = document.createElement("details");
    details.className = "article-body-details";
    if (article.paragraphs.length) {
      const summary = document.createElement("summary");
      const summaryText = document.createTextNode("See more");
      summary.append(summaryText);
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
      details.addEventListener("toggle", () => {
        card.classList.toggle("article-card--expanded", details.open);
        summaryText.textContent = details.open
          ? (isInfographic ? "Close the comment" : "Close the article")
          : "See more";
        card.scrollIntoView({ block: "start" });
      });
      card.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) return;
        if (event.target.closest("a, button, summary, input, select, textarea, .article-share, [contenteditable='true']")) return;
        if (window.getSelection()?.toString()) return;
        details.open = !details.open;
      });
      textContent.append(details);
    }
    if (sourcedPosts.has(article.post)) {
      const sourceLink = document.createElement("a");
      sourceLink.className = "article-source-link";
      sourceLink.href = `resources.html#sources-article-${article.post}`;
      sourceLink.textContent = "View sources";
      sourceLink.setAttribute("aria-label", `View sources for article ${article.post}: ${article.title}`);
      content.append(sourceLink);
    }
    content.append(makeShareControls(article, isInfographic));
    card.append(content);
    card.dataset.post = article.post;
    fragment.append(card);
  }

  gallery.replaceChildren(fragment);
  const PAGE_SIZE = 9;
  const cards = Array.from(gallery.children);
  const articleByPost = new Map(window.campaignArticles.map((article) => [article.post, article]));
  let currentPage = 1;
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
    const sorters = {
      newest: (a, b) => {
        if (!a.postedAt) return b.postedAt ? 1 : 0;
        if (!b.postedAt) return -1;
        return b.postedAt.localeCompare(a.postedAt);
      },
      number: (a, b) => Number(a.post) - Number(b.post),
      az: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
      za: (a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }),
    };

    const sortCards = () => {
      const compare = sorters[sortSelect.value] || sorters.newest;
      cards.sort((a, b) => compare(articleByPost.get(a.dataset.post), articleByPost.get(b.dataset.post)));
      gallery.replaceChildren(...cards);
    };

    renderIndex = () => {
      const items = cards.map((card) => articleByPost.get(card.dataset.post)).filter(matches);
      if (statusLine instanceof HTMLElement) {
        statusLine.textContent = isFiltering()
          ? `${items.length} of ${cards.length} articles and infographics match.`
          : "";
      }
      indexList.replaceChildren(...items.map((article) => {
        const item = document.createElement("li");
        item.value = Number(article.post);
        const link = document.createElement("a");
        link.href = `#article-${article.post}`;
        link.textContent = article.title;
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const card = cards.find((c) => c.dataset.post === article.post);
          if (!card) return;
          const matchingCards = cards.filter((c) => matches(articleByPost.get(c.dataset.post)));
          currentPage = Math.floor(matchingCards.indexOf(card) / PAGE_SIZE) + 1;
          updatePaging();
          const details = card.querySelector(".article-body-details");
          if (details) details.open = true;
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        item.append(link);
        return item;
      }));
    };

    sortSelect.addEventListener("change", () => {
      currentPage = 1;
      sortCards();
      renderIndex();
      updatePaging();
    });
    sortCards();
    renderIndex();
  }

  gallery.replaceChildren(...cards);
  gallery.className = "article-grid";

  const pagination = document.createElement("div");
  pagination.className = "article-more";
  const status = document.createElement("p");
  status.setAttribute("role", "status");
  const navigation = document.createElement("nav");
  navigation.className = "article-pagination";
  navigation.setAttribute("aria-label", "Article and infographic pages");

  const makePageButton = (label, page, accessibleLabel) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    button.addEventListener("click", () => {
      currentPage = typeof page === "function" ? page() : page;
      update();
      gallery.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  };
  const previous = makePageButton("Previous", () => currentPage - 1, "Previous page");
  const next = makePageButton("Next", () => currentPage + 1, "Next page");
  const pageButtons = Array.from({ length: Math.ceil(cards.length / PAGE_SIZE) }, (_, index) =>
    makePageButton(String(index + 1), index + 1, `Page ${index + 1}`),
  );
  navigation.append(previous, ...pageButtons, next);
  pagination.append(status, navigation);
  gallery.after(pagination);

  const update = () => {
    const matchingCards = cards.filter((card) => matches(articleByPost.get(card.dataset.post)));
    const totalPages = Math.ceil(matchingCards.length / PAGE_SIZE);
    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    const start = (currentPage - 1) * PAGE_SIZE;
    const visibleCards = new Set(matchingCards.slice(start, start + PAGE_SIZE));
    cards.forEach((card) => { card.hidden = !visibleCards.has(card); });
    status.textContent = matchingCards.length
      ? `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, matchingCards.length)} of ${matchingCards.length} articles and infographics · Page ${currentPage} of ${totalPages}`
      : "No articles or infographics match.";
    navigation.hidden = totalPages <= 1;
    previous.disabled = currentPage === 1;
    next.disabled = currentPage >= totalPages;
    pageButtons.forEach((button, index) => {
      button.hidden = index >= totalPages;
      if (index + 1 === currentPage) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
  };
  updatePaging = update;
  update();

  const onFilterChange = () => {
    currentPage = 1;
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
    currentPage = Math.floor(cards.indexOf(card) / PAGE_SIZE) + 1;
    renderIndex();
    update();
    const details = card.querySelector(".article-body-details");
    if (details && !card.classList.contains("article-card--with-image")) details.open = true;
    card.scrollIntoView({ block: "start" });
  };
  window.addEventListener("hashchange", openLinkedArticle);
  openLinkedArticle();
})();
