const assert = require("node:assert/strict");
const test = require("node:test");
const core = require("../assets/app-core.js");

function memoryStorage() {
  const state = new Map();
  return {
    getItem(key) {
      return state.has(key) ? state.get(key) : null;
    },
    setItem(key, value) {
      state.set(key, String(value));
    },
    removeItem(key) {
      state.delete(key);
    }
  };
}

test("saveNote creates, updates, searches, and deletes notes", () => {
  const storage = memoryStorage();
  const saved = core.saveNote(storage, {
    title: "First log",
    body: "OpenAI release watch",
    image: "data:image/png;base64,abc"
  })[0];

  assert.equal(core.listNotes(storage).length, 1);
  assert.equal(core.searchNotes(core.listNotes(storage), "release")[0].id, saved.id);

  core.saveNote(storage, {
    id: saved.id,
    title: "Updated log",
    body: "Anthropic and Google watch",
    image: ""
  });

  assert.equal(core.listNotes(storage)[0].title, "Updated log");
  assert.equal(core.searchNotes(core.listNotes(storage), "openai").length, 0);

  core.deleteNote(storage, saved.id);
  assert.equal(core.listNotes(storage).length, 0);
});

test("buildAiHotUrl defaults to selected AI HOT items and accepts filters", () => {
  const url = core.buildAiHotUrl({
    category: "ai-models",
    query: "OpenAI",
    since: "2026-05-25T00:00:00Z",
    take: 8
  });

  assert.equal(
    url,
    "https://aihot.virxact.com/api/public/items?mode=selected&take=8&category=ai-models&q=OpenAI&since=2026-05-25T00%3A00%3A00Z"
  );
});

test("buildAiNewsProxyUrl keeps AI news requests same-origin", () => {
  const url = core.buildAiNewsProxyUrl({
    category: "paper",
    query: "RAG",
    take: 6
  });

  assert.equal(url, "/api/ai-news?mode=selected&take=6&category=paper&q=RAG");
});

test("normalizeNewsItems maps AI HOT payloads into card data", () => {
  const items = core.normalizeNewsItems({
    items: [
      {
        title: "Model update",
        summary: "A concise signal",
        sourceName: "Lab Blog",
        sourceUrl: "https://example.com",
        publishedAt: "2026-05-26T00:00:00Z"
      }
    ]
  });

  assert.deepEqual(items[0], {
    id: "https://example.com",
    title: "Model update",
    summary: "A concise signal",
    source: "Lab Blog",
    url: "https://example.com",
    category: "selected",
    publishedAt: "2026-05-26T00:00:00Z"
  });
});
