(() => {
  const pending = [];
  let unavailable = false;
  window.goatcounter = window.goatcounter || {};
  window.goatcounter.path = () => window.location.search ? null : window.location.pathname;
  window.goatcounter.referrer = (referrer) => referrer ? new URL(referrer).origin : "";

  const send = (path, title) => {
    if (window.location.search || unavailable) return;
    const event = { path, title, event: true, no_session: true, referrer: "" };
    if (typeof window.goatcounter.count === "function") {
      window.goatcounter.count(event);
    } else {
      pending.push(event);
    }
  };

  document.addEventListener("load", (event) => {
    if (!(event.target instanceof Element) || !event.target.matches("script[data-goatcounter]")) return;
    const queued = pending.splice(0);
    if (typeof window.goatcounter.count !== "function") {
      unavailable = true;
      console.warn("GoatCounter loaded without its counting API; analytics events will not be recorded.");
    } else if (!window.location.search) {
      for (const item of queued) window.goatcounter.count(item);
    }
  }, true);
  document.addEventListener("error", (event) => {
    if (!(event.target instanceof Element) || !event.target.matches("script[data-goatcounter]")) return;
    unavailable = true;
    pending.length = 0;
    console.warn("GoatCounter could not be loaded; analytics events will not be recorded.");
  }, true);

  const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  const hash = (text) => {
    let value = 2166136261;
    for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
    return (value >>> 0).toString(36);
  };

  document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.matches(".article-body-details") || !details.open) return;
    const card = details.closest(".article-card");
    if (!card || !card.dataset.post) return;
    const title = card.querySelector("h3").textContent;
    send(`article-open-${card.dataset.post}`, `Article ${card.dataset.post}: ${title}`);
  }, true);

  const trackClick = (event) => {
    if (!(event.target instanceof Element)) return;
    const copy = event.target.closest(".article-share-actions button");
    if (copy) {
      const card = copy.closest(".article-card");
      if (card && card.dataset.post) {
        send(`article-copy-${card.dataset.post}`, `Copy link: ${card.querySelector("h3").textContent}`);
      }
      return;
    }

    const action = event.target.closest(".action-card .action-button");
    if (action) {
      const card = action.closest(".action-card");
      if (card && card.id) send(`action-${card.id}`, `Action: ${card.querySelector("h3").textContent}`);
      return;
    }

    const link = event.target.closest(".resource-card a, #article-sources-list a, .watch-section a");
    if (!link || link.protocol !== "https:" && link.protocol !== "http:") return;
    if (link.origin === window.location.origin) return;
    const card = link.closest(".resource-card");
    const title = card ? card.querySelector("h3").textContent : link.textContent.trim();
    send(`resource-${slug(title)}-${hash(link.href)}`, `Resource: ${title}`);
  };
  document.addEventListener("click", trackClick);
  document.addEventListener("auxclick", trackClick);
})();
