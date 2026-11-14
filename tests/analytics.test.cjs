const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "..", "analytics.js"), "utf8");

class Element {
  constructor(options = {}) {
    Object.assign(this, options);
  }
  matches(selector) {
    return this.selector === selector;
  }
  closest(selector) {
    return this.ancestors?.[selector] || null;
  }
  querySelector(selector) {
    return this.children?.[selector] || null;
  }
}
class HTMLDetailsElement extends Element {}

function setup(search = "") {
  const listeners = {};
  const events = [];
  const window = { location: { pathname: "/index.html", search, origin: "https://example.test" } };
  const document = {
    addEventListener(type, handler) {
      (listeners[type] ||= []).push(handler);
    },
  };
  vm.runInNewContext(script, { window, document, Element, HTMLDetailsElement, URL, console });
  const dispatch = (type, target) => (listeners[type] || []).forEach((handler) => handler({ target }));
  const load = () => {
    window.goatcounter.count = (event) => events.push(event);
    dispatch("load", new Element({ selector: "script[data-goatcounter]" }));
  };
  return { window, dispatch, load, events };
}

function article(post, title) {
  const card = new Element({ dataset: { post }, children: { h3: { textContent: title } } });
  const ancestors = { ".article-card": card };
  return {
    details: new HTMLDetailsElement({ selector: ".article-body-details", open: true, ancestors }),
    copy: new Element({ ancestors }),
  };
}

test("tracks article opens and copy clicks, including events before GoatCounter loads", () => {
  const { dispatch, load, events } = setup();
  const { details, copy } = article("69", "Example article");
  const buttonTarget = new Element({ ancestors: { ".article-share-actions button": copy } });
  dispatch("toggle", details);
  dispatch("click", buttonTarget);
  details.open = false;
  dispatch("toggle", details);
  assert.equal(events.length, 0);
  load();
  assert.deepEqual(events.map((event) => event.path), ["article-open-69", "article-copy-69"]);
  assert.equal(events[0].title, "Article 69: Example article");
  assert.ok(events.every((event) => event.event && event.no_session && event.referrer === ""));
});

test("tracks action and public resource links without tracking unrelated inputs", () => {
  const { dispatch, load, events } = setup();
  load();
  const actionCard = new Element({ id: "repeal-sb-30", children: { h3: { textContent: "Repeal SB 30" } } });
  const action = new Element({ ancestors: { ".action-card": actionCard } });
  dispatch("click", new Element({ ancestors: { ".action-card .action-button": action } }));

  const resourceCard = new Element({ children: { h3: { textContent: "Official record" } } });
  const link = new Element({
    protocol: "https:", origin: "https://source.example", href: "https://source.example/record?private=value",
    ancestors: { ".resource-card": resourceCard },
  });
  const target = new Element({ ancestors: { ".resource-card a, #article-sources-list a, .watch-section a": link } });
  dispatch("click", target);
  dispatch("auxclick", target);
  dispatch("click", new Element({ value: "private search terms" }));
  assert.equal(events[0].path, "action-repeal-sb-30");
  assert.match(events[1].path, /^resource-official-record-[a-z0-9]+$/);
  assert.equal(events[1].title, "Resource: Official record");
  assert.equal(events[2].path, events[1].path);
  assert.equal(events.length, 3);
  assert.ok(!JSON.stringify(events).includes("private"));
});

test("does not send page views or events from URLs with query strings", () => {
  const state = setup("?search=private");
  state.load();
  const { details } = article("69", "Example article");
  state.dispatch("toggle", details);
  assert.equal(state.window.goatcounter.path(), null);
  assert.equal(state.events.length, 0);
  assert.equal(state.window.goatcounter.referrer("https://source.example/path?name=private"), "https://source.example");
});

test("discards queued events if a query string appears before analytics loads", () => {
  const state = setup();
  state.dispatch("toggle", article("69", "Example article").details);
  state.window.location.search = "?name=private";
  state.load();
  assert.equal(state.events.length, 0);
});

test("does not disrupt interactions when the counting API fails to load", () => {
  const state = setup();
  state.dispatch("toggle", article("69", "Example article").details);
  state.dispatch("error", new Element({ selector: "script[data-goatcounter]" }));
  state.load();
  state.dispatch("toggle", article("70", "Another article").details);
  assert.equal(state.events.length, 0);
});
