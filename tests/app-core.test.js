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

test("buildGithubTrendingUrl creates a same-origin GitHub search request", () => {
  const url = core.buildGithubTrendingUrl({
    language: "JavaScript",
    days: 3,
    take: 10
  });

  assert.match(url, /^\/api\/github-trending\?/);
  assert.match(url, /sort=stars/);
  assert.match(url, /order=desc/);
  assert.match(url, /per_page=10/);
  assert.match(decodeURIComponent(url), /language:JavaScript/);
});

test("normalizeGithubRepos maps GitHub API repos into card data", () => {
  const repos = core.normalizeGithubRepos({
    items: [
      {
        id: 1,
        full_name: "octo/example",
        description: "Example repo",
        html_url: "https://github.com/octo/example",
        language: "TypeScript",
        stargazers_count: 99,
        forks_count: 12,
        created_at: "2026-05-20T00:00:00Z",
        owner: { avatar_url: "https://example.com/avatar.png" }
      }
    ]
  });

  assert.equal(repos[0].id, 1);
  assert.equal(repos[0].name, "octo/example");
  assert.equal(repos[0].description, "Example repo");
  assert.equal(repos[0].url, "https://github.com/octo/example");
  assert.equal(repos[0].language, "TypeScript");
  assert.equal(repos[0].stars, 99);
  assert.equal(repos[0].forks, 12);
  assert.equal(repos[0].createdAt, "2026-05-20T00:00:00Z");
  assert.equal(repos[0].ownerAvatar, "https://example.com/avatar.png");
});

test("filterGithubReposByStars removes repositories below the minimum", () => {
  const repos = [
    { name: "low/star", stars: 499 },
    { name: "high/star", stars: 500 },
    { name: "higher/star", stars: 1200 }
  ];

  assert.deepEqual(
    core.filterGithubReposByStars(repos, 500).map((repo) => repo.name),
    ["high/star", "higher/star"]
  );
});

test("save and read AI config from storage", () => {
  const storage = memoryStorage();
  core.saveAiConfig(storage, {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "sk-test",
    model: "gpt-4.1-mini"
  });

  assert.deepEqual(core.readAiConfig(storage), {
    baseUrl: "https://api.openai.com/v1",
    apiKey: "sk-test",
    model: "gpt-4.1-mini"
  });
});

test("buildRepoAnalysisRequest creates an OpenAI-compatible request", () => {
  const request = core.buildRepoAnalysisRequest(
    {
      name: "octo/example",
      description: "Example repo",
      language: "TypeScript",
      stars: 800,
      forks: 30,
      url: "https://github.com/octo/example"
    },
    {
      baseUrl: "https://api.openai.com/v1/",
      apiKey: "sk-test",
      model: "gpt-4.1-mini"
    }
  );

  assert.equal(request.url, "https://api.openai.com/v1/chat/completions");
  assert.equal(request.headers.Authorization, "Bearer sk-test");
  assert.equal(request.body.model, "gpt-4.1-mini");
  assert.match(request.body.messages[1].content, /用中文分析这个 GitHub 仓库/);
  assert.match(request.body.messages[1].content, /octo\/example/);
});
