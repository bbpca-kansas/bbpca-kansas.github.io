(() => {
  const list = document.querySelector("#article-sources-list");
  if (!(list instanceof HTMLElement) || !Array.isArray(window.articleSources)) return;

  const titles = new Map((window.campaignArticles || []).map((a) => [a.post, a.title]));
  const groups = window.articleSources
    .slice()
    .sort((a, b) => Number(a.post) - Number(b.post))
    .map(({ post, sources }) => {
      const details = document.createElement("details");
      details.id = `sources-article-${post}`;
      const summary = document.createElement("summary");
      const label = document.createElement("span");
      label.textContent = `Article ${post}`;
      summary.append(label, titles.has(post) ? ` ${titles.get(post)}` : "");
      details.append(summary);

      const ul = document.createElement("ul");
      for (const source of sources) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = source.name;
        li.append(link);
        if (source.supports) {
          const note = document.createElement("p");
          note.textContent = source.supports;
          li.append(note);
        }
        ul.append(li);
      }
      details.append(ul);

      if (titles.has(post)) {
        const jump = document.createElement("a");
        jump.className = "read-article";
        jump.href = `index.html#article-${post}`;
        jump.textContent = "Read this article";
        jump.setAttribute("aria-label", `Read article ${post}: ${titles.get(post)}`);
        details.append(jump);
      }
      return details;
    });

  list.replaceChildren(...groups);
})();
