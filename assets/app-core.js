(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.F9Core = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const NOTES_KEY = "f9-space.notes.v1";
  const NEWS_KEY = "f9-space.ai-news-cache.v1";

  function createId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function readJson(storage, key, fallback) {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    storage.setItem(key, JSON.stringify(value));
    return value;
  }

  function normalizeNote(input, existing) {
    const now = new Date().toISOString();
    const title = String(input.title || "").trim() || "Untitled entry";
    const body = String(input.body || "").trim();
    const image = input.image || "";
    return {
      id: existing && existing.id ? existing.id : createId("note"),
      title,
      body,
      image,
      createdAt: existing && existing.createdAt ? existing.createdAt : now,
      updatedAt: now
    };
  }

  function listNotes(storage) {
    return readJson(storage, NOTES_KEY, []).sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }

  function saveNote(storage, input) {
    const notes = listNotes(storage);
    const existing = input.id ? notes.find(function (note) { return note.id === input.id; }) : null;
    const next = normalizeNote(input, existing);
    const withoutCurrent = notes.filter(function (note) { return note.id !== next.id; });
    return writeJson(storage, NOTES_KEY, [next].concat(withoutCurrent));
  }

  function deleteNote(storage, id) {
    const notes = listNotes(storage).filter(function (note) { return note.id !== id; });
    return writeJson(storage, NOTES_KEY, notes);
  }

  function searchNotes(notes, query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter(function (note) {
      return `${note.title} ${note.body}`.toLowerCase().includes(needle);
    });
  }

  function buildAiHotUrl(options) {
    const params = new URLSearchParams();
    params.set("mode", options && options.mode ? options.mode : "selected");
    params.set("take", String(options && options.take ? options.take : 12));
    if (options && options.category && options.category !== "all") params.set("category", options.category);
    if (options && options.query) params.set("q", options.query);
    if (options && options.since) params.set("since", options.since);
    return `https://aihot.virxact.com/api/public/items?${params.toString()}`;
  }

  function normalizeNewsItems(payload) {
    const items = payload && Array.isArray(payload.items) ? payload.items : [];
    return items.map(function (item, index) {
      return {
        id: item.id || item.url || item.sourceUrl || `news-${index}`,
        title: item.titleZh || item.title || "Untitled signal",
        summary: item.summaryZh || item.summary || item.description || "",
        source: item.sourceName || item.source || "AI HOT",
        url: item.url || item.sourceUrl || "https://aihot.virxact.com",
        category: item.category || "selected",
        publishedAt: item.publishedAt || item.createdAt || ""
      };
    });
  }

  function cacheNews(storage, items) {
    return writeJson(storage, NEWS_KEY, {
      fetchedAt: new Date().toISOString(),
      items: items
    });
  }

  function readCachedNews(storage) {
    return readJson(storage, NEWS_KEY, { fetchedAt: "", items: [] });
  }

  return {
    NOTES_KEY,
    NEWS_KEY,
    buildAiHotUrl,
    cacheNews,
    deleteNote,
    listNotes,
    normalizeNewsItems,
    readCachedNews,
    saveNote,
    searchNotes
  };
});
