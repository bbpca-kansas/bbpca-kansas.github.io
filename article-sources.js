(() => {
  const list = document.querySelector("#article-sources-list");
  if (!(list instanceof HTMLElement) || !Array.isArray(window.articleSources)) return;

  const titles = new Map((window.campaignArticles || []).map((a) => [a.post, a.title]));
  const groups = window.articleSources
    .slice()
    .sort((a, b) => Number(a.post) - Number(b.post))
    .map(({ post, sources }) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const label = document.createElement("span");
      label.textContent = `Article ${post}`;
      summary.append(label, titles.get(post) || "");
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

      if (document.getElementById(`article-${post}`)) {
        const jump = document.createElement("a");
        jump.className = "read-article";
        jump.href = `#article-${post}`;
        jump.textContent = "Go to this article ↓";
        jump.addEventListener("click", () => {
          const card = document.getElementById(`article-${post}`);
          card.hidden = false;
          const body = card.querySelector("details");
          if (body) body.open = true;
        });
        details.append(jump);
      }
      return details;
    });

  list.replaceChildren(...groups);
})();
