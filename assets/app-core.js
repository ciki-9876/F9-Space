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

  function buildAiNewsProxyUrl(options) {
    const params = new URLSearchParams();
    params.set("mode", options && options.mode ? options.mode : "selected");
    params.set("take", String(options && options.take ? options.take : 12));
    if (options && options.category && options.category !== "all") params.set("category", options.category);
    if (options && options.query) params.set("q", options.query);
    if (options && options.since) params.set("since", options.since);
    return `/api/ai-news?${params.toString()}`;
  }

  function buildGithubTrendingUrl(options) {
    const params = new URLSearchParams();
    const language = options && options.language && options.language !== "all" ? ` language:${options.language}` : "";
    const days = options && options.days ? Number(options.days) : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    params.set("q", `created:>${since}${language}`);
    params.set("sort", "stars");
    params.set("order", "desc");
    params.set("per_page", String(options && options.take ? options.take : 12));
    return `/api/github-trending?${params.toString()}`;
  }

  function normalizeGithubRepos(payload) {
    const items = payload && Array.isArray(payload.items) ? payload.items : [];
    return items.map(function (repo) {
      return {
        id: repo.id || repo.full_name,
        name: repo.full_name || repo.name || "unknown/repo",
        description: repo.description || "No description yet.",
        url: repo.html_url || "https://github.com",
        language: repo.language || "Unknown",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        createdAt: repo.created_at || "",
        ownerAvatar: repo.owner && repo.owner.avatar_url ? repo.owner.avatar_url : ""
      };
    });
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
    buildAiNewsProxyUrl,
    buildAiHotUrl,
    buildGithubTrendingUrl,
    cacheNews,
    deleteNote,
    listNotes,
    normalizeGithubRepos,
    normalizeNewsItems,
    readCachedNews,
    saveNote,
    searchNotes
  };
});
