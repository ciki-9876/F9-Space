(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.F9Core = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const NOTES_KEY = "f9-space.notes.v1";
  const NEWS_KEY = "f9-space.ai-news-cache.v1";
  const AI_CONFIG_KEY = "f9-space.ai-config.v1";

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
    var mode = options && options.mode ? options.mode : "trending";
    var language = options && options.language ? options.language : "all";
    var days = options && options.days ? Number(options.days) : 7;
    var sortMode = options && options.sortMode ? options.sortMode : "stars";
    var take = options && options.take ? Number(options.take) : 12;

    var since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    var langFilter = (language && language !== "all") ? " language:" + language : "";
    var q;

    if (mode === "quality") {
      q = "created:>" + since + langFilter + " stars:>=50 fork:false";
    } else if (mode === "new") {
      q = "created:>" + since + langFilter + " fork:false";
    } else if (mode === "fastest") {
      q = "created:>" + since + langFilter + " stars:>=10 fork:false";
      sortMode = "stars";
    } else {
      q = "created:>" + since + langFilter + " stars:>=5 fork:false";
    }

    var params = new URLSearchParams();
    params.set("q", q);
    params.set("sort", sortMode === "stars" ? "stars" : sortMode === "forks" ? "forks" : "updated");
    params.set("order", "desc");
    params.set("per_page", String(take));
    return "/api/github-trending?" + params.toString();
  }

  function normalizeGithubRepos(payload) {
    var items = payload && Array.isArray(payload.items) ? payload.items : [];
    return items.map(function (repo) {
      var topics = (repo.topics && Array.isArray(repo.topics)) ? repo.topics : [];
      var license = (repo.license && repo.license.spdx_id) ? repo.license.spdx_id : "";
      return {
        id: repo.id || repo.full_name,
        name: repo.full_name || repo.name || "unknown/repo",
        description: repo.description || "No description yet.",
        url: repo.html_url || "https://github.com",
        language: repo.language || "Unknown",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        openIssues: repo.open_issues_count || 0,
        watchers: repo.watchers_count || 0,
        createdAt: repo.created_at || "",
        updatedAt: repo.updated_at || "",
        pushedAt: repo.pushed_at || "",
        ownerAvatar: repo.owner && repo.owner.avatar_url ? repo.owner.avatar_url : "",
        ownerUrl: repo.owner && repo.owner.html_url ? repo.owner.html_url : "",
        topics: topics,
        license: license,
        isFork: repo.fork || false,
        homepage: repo.homepage || "",
        defaultBranch: repo.default_branch || "main"
      };
    });
  }

  function filterGithubReposByStars(repos, minimumStars) {
    const threshold = Number(minimumStars || 0);
    return repos.filter(function (repo) {
      return Number(repo.stars || 0) >= threshold;
    });
  }

  function normalizeAiConfig(input) {
    return {
      baseUrl: String(input && input.baseUrl ? input.baseUrl : "").trim().replace(/\/+$/, ""),
      apiKey: String(input && input.apiKey ? input.apiKey : "").trim(),
      model: String(input && input.model ? input.model : "gpt-4.1-mini").trim()
    };
  }

  function readAiConfig(storage) {
    return normalizeAiConfig(readJson(storage, AI_CONFIG_KEY, {
      baseUrl: "",
      apiKey: "",
      model: "gpt-4.1-mini"
    }));
  }

  function saveAiConfig(storage, input) {
    return writeJson(storage, AI_CONFIG_KEY, normalizeAiConfig(input));
  }

  function buildRepoAnalysisPrompt(repo) {
    return [
      "用中文分析这个 GitHub 仓库，面向个人技术雷达用户。",
      "请输出：1. 一句话判断；2. 它解决什么问题；3. 为什么近期值得关注；4. 适合谁使用；5. 潜在风险或噪音。",
      "",
      `仓库：${repo.name}`,
      `描述：${repo.description || "无"}`,
      `语言：${repo.language || "Unknown"}`,
      `Stars：${repo.stars || 0}`,
      `Forks：${repo.forks || 0}`,
      `地址：${repo.url}`
    ].join("\n");
  }

  function buildRepoAnalysisRequest(repo, config) {
    const normalized = normalizeAiConfig(config);
    return {
      url: `${normalized.baseUrl}/chat/completions`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${normalized.apiKey}`
      },
      body: {
        model: normalized.model,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "你是一个谨慎的中文技术分析助手，专长是快速评估开源仓库的实际价值。"
          },
          {
            role: "user",
            content: buildRepoAnalysisPrompt(repo)
          }
        ]
      }
    };
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
    AI_CONFIG_KEY,
    buildAiNewsProxyUrl,
    buildAiHotUrl,
    buildGithubTrendingUrl,
    buildRepoAnalysisRequest,
    cacheNews,
    deleteNote,
    filterGithubReposByStars,
    listNotes,
    normalizeGithubRepos,
    normalizeNewsItems,
    readAiConfig,
    readCachedNews,
    saveAiConfig,
    saveNote,
    searchNotes
  };
});
