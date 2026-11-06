(() => {
  const search = document.querySelector("#resource-search");
  const topicSelect = document.querySelector("#resource-topic");
  const publisherSelect = document.querySelector("#resource-publisher");
  const articleSelect = document.querySelector("#resource-article");
  const cards = Array.from(document.querySelectorAll(".resource-card"));
  const sourceGroups = Array.from(document.querySelectorAll("#article-sources-list details"));
  const resourceStatus = document.querySelector("#resource-status");
  const sourceStatus = document.querySelector("#source-status");

  if (
    !(search instanceof HTMLInputElement) ||
    !(topicSelect instanceof HTMLSelectElement) ||
    !(publisherSelect instanceof HTMLSelectElement) ||
    !(articleSelect instanceof HTMLSelectElement)
  ) {
    throw new Error("Resource library controls are missing.");
  }

  const topicOf = (card) => {
    const source = card.querySelector(".resource-source")?.textContent || "";
    return source.split("·")[0].trim();
  };
  const publisherOf = (card) => {
    const source = card.querySelector(".resource-source")?.textContent || "";
    return source.split("·").pop().trim();
  };
  const articleNumberOf = (group) => group.querySelector("summary")?.textContent.match(/^Article (\d+)/)?.[1] || "";
  const topics = [...new Set(cards.map(topicOf))].sort((a, b) => a.localeCompare(b));
  const publishers = [...new Set(cards.map(publisherOf))].sort((a, b) => a.localeCompare(b));
  const articles = sourceGroups.map((group) => ({
    number: articleNumberOf(group),
    title: group.querySelector("summary")?.textContent.replace(/^Article \d+/, "").trim() || "",
  })).filter((article) => article.number);

  topicSelect.replaceChildren(
    new Option("All topics", ""),
    ...topics.map((topic) => new Option(topic, topic)),
  );
  publisherSelect.replaceChildren(
    new Option("All publishers", ""),
    ...publishers.map((publisher) => new Option(publisher, publisher)),
  );
  articleSelect.replaceChildren(
    new Option("All articles", ""),
    ...articles.map((article) => new Option(`Article ${article.number} — ${article.title}`, article.number)),
  );

  const update = () => {
    const query = search.value.trim().toLowerCase();
    const terms = query ? query.split(/\s+/) : [];
    const topic = topicSelect.value;
    const publisher = publisherSelect.value;
    const article = articleSelect.value;
    let visibleCards = 0;
    let visibleGroups = 0;

    for (const card of cards) {
      const matchesQuery = terms.every((term) => card.textContent.toLowerCase().includes(term));
      const matchesTopic = !topic || topicOf(card) === topic;
      const matchesPublisher = !publisher || publisherOf(card) === publisher;
      card.hidden = !matchesQuery || !matchesTopic || !matchesPublisher;
      if (!card.hidden) visibleCards += 1;
    }

    for (const group of sourceGroups) {
      const matchesQuery = terms.every((term) => group.textContent.toLowerCase().includes(term));
      group.hidden = !matchesQuery || (article !== "" && articleNumberOf(group) !== article);
      if (!group.hidden) visibleGroups += 1;
    }

    if (resourceStatus instanceof HTMLElement) {
      resourceStatus.textContent = `${visibleCards} of ${cards.length} resources shown.`;
    }
    if (sourceStatus instanceof HTMLElement) {
      sourceStatus.textContent = query || article
        ? `${visibleGroups} of ${sourceGroups.length} article source groups match.`
        : `${sourceGroups.length} article source groups. Search by article title, source, or claim.`;
    }
  };

  search.addEventListener("input", update);
  topicSelect.addEventListener("change", update);
  publisherSelect.addEventListener("change", update);
  articleSelect.addEventListener("change", update);
  update();

  const openLinkedSources = () => {
    const match = location.hash.match(/^#sources-article-(\d+)$/);
    if (!match) return;
    const group = sourceGroups.find((item) => item.id === `sources-article-${match[1]}`);
    if (!group) return;
    search.value = "";
    articleSelect.value = "";
    update();
    group.open = true;
    group.scrollIntoView({ block: "start" });
  };
  window.addEventListener("hashchange", openLinkedSources);
  openLinkedSources();
})();
