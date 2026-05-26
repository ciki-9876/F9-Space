const storage = window.localStorage;

const demoNews = [
  {
    title: "AI HOT 精选情报待机",
    summary: "点击刷新情报会请求 AI HOT 公开接口。若网络或 CORS 受限，可通过同源代理读取。",
    source: "F9 Space",
    url: "https://aihot.virxact.com",
    category: "selected",
    publishedAt: new Date().toISOString()
  },
  {
    title: "长期维护建议：定时缓存新闻源",
    summary: "服务器定时拉取 AI HOT 精选数据，前端只读取稳定的 /api/ai-news。",
    source: "Architecture",
    url: "https://github.com/KKKKhazix/khazix-skills",
    category: "deployment",
    publishedAt: new Date().toISOString()
  }
];

const demoRepos = [
  {
    id: "demo-radar",
    name: "open-source/radar-placeholder",
    description: "GitHub Radar 会通过 /api/github-trending 查询近期新建、按 stars 排序的仓库，并过滤 500 stars 以下结果。",
    url: "https://github.com/trending",
    language: "Mixed",
    stars: 1024,
    forks: 128,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-proxy",
    name: "f9-space/server-proxy",
    description: "线上建议由 Nginx 或云函数代理 GitHub API，后续可以加缓存和 GitHub Token 提升限额。",
    url: "https://docs.github.com/rest/search/search",
    language: "Ops",
    stars: 512,
    forks: 32,
    createdAt: new Date().toISOString()
  }
];

let currentImage = "";
let currentRepos = [];

function formatDate(value) {
  if (!value) return "Unknown time";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}

function renderNews(items) {
  const grid = document.querySelector("#newsGrid");
  document.querySelector("#signalCount").textContent = String(items.length).padStart(2, "0");
  grid.innerHTML = items.map(function (item) {
    return `
      <article class="news-card">
        <div class="card-meta">
          <span>${escapeHtml(item.source)}</span>
          <time>${formatDate(item.publishedAt)}</time>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || "暂无摘要，打开来源继续阅读。")}</p>
        <a href="${item.url}" target="_blank" rel="noreferrer">打开来源</a>
      </article>
    `;
  }).join("");
}

function renderRepos(repos) {
  const grid = document.querySelector("#repoGrid");
  currentRepos = F9Core.filterGithubReposByStars(repos, 500);
  if (!currentRepos.length) {
    grid.innerHTML = '<div class="empty-state">没有找到 500 stars 以上的近期仓库。换个时间窗口或语言试试。</div>';
    return;
  }

  grid.innerHTML = currentRepos.map(function (repo) {
    return `
      <article class="repo-card" data-repo-id="${escapeHtml(String(repo.id))}">
        <div class="card-meta">
          <span>${escapeHtml(repo.language)}</span>
          <time>${formatDate(repo.createdAt)}</time>
        </div>
        <h3>${escapeHtml(repo.name)}</h3>
        <p>${escapeHtml(repo.description)}</p>
        <div class="repo-stats">
          <span>${Number(repo.stars).toLocaleString()} stars</span>
          <span>${Number(repo.forks).toLocaleString()} forks</span>
        </div>
        <div class="repo-actions">
          <button type="button" data-action="analyze">分析仓库</button>
          <a href="${repo.url}" target="_blank" rel="noreferrer">访问仓库</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderNotes() {
  const notes = F9Core.searchNotes(F9Core.listNotes(storage), document.querySelector("#noteSearch").value);
  const list = document.querySelector("#noteList");
  document.querySelector("#noteCount").textContent = String(F9Core.listNotes(storage).length);
  if (!notes.length) {
    list.innerHTML = '<div class="empty-state">还没有匹配的笔记。写下一条，星港会记住它。</div>';
    return;
  }
  list.innerHTML = notes.map(function (note) {
    const image = note.image ? `<img src="${note.image}" alt="">` : "";
    return `
      <article class="note-card" data-id="${note.id}">
        ${image}
        <div>
          <time>${formatDate(note.updatedAt)}</time>
          <h3>${escapeHtml(note.title)}</h3>
          <p>${escapeHtml(note.body || "空白记录")}</p>
          <div class="note-actions">
            <button type="button" data-action="edit">编辑</button>
            <button type="button" data-action="delete">删除</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

async function fetchFirstJson(urls) {
  const errors = [];
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!response.ok) throw new Error(`${url} HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join("; "));
}

async function fetchNews(event) {
  event.preventDefault();
  const status = document.querySelector("#newsStatus");
  const category = document.querySelector("#newsCategory").value;
  const query = document.querySelector("#newsQuery").value.trim();
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const options = { category, query, since, take: 12 };
  const urls = [F9Core.buildAiNewsProxyUrl(options), F9Core.buildAiHotUrl(options)];
  status.textContent = "正在连接同源情报代理...";

  try {
    const payload = await fetchFirstJson(urls);
    const items = F9Core.normalizeNewsItems(payload);
    F9Core.cacheNews(storage, items);
    renderNews(items);
    status.textContent = `已同步 ${items.length} 条情报。`;
  } catch (error) {
    const cached = F9Core.readCachedNews(storage);
    if (cached.items.length) {
      renderNews(cached.items);
      status.textContent = `情报代理暂不可用，显示缓存：${error.message}`;
    } else {
      renderNews(demoNews);
      status.textContent = "情报代理暂不可用，已载入演示。需要在服务器配置 /api/ai-news 代理。";
    }
  }
}

async function fetchGithubTrending(event) {
  event.preventDefault();
  const status = document.querySelector("#githubStatus");
  const language = document.querySelector("#githubLanguage").value;
  const days = document.querySelector("#githubDays").value;
  const url = F9Core.buildGithubTrendingUrl({ language, days, take: 24 });
  status.textContent = "正在扫描 GitHub 热门仓库...";

  try {
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const repos = F9Core.filterGithubReposByStars(F9Core.normalizeGithubRepos(payload), 500);
    renderRepos(repos);
    status.textContent = `已扫描 ${repos.length} 个 500 stars 以上的近期热门仓库。`;
  } catch (error) {
    renderRepos(demoRepos);
    status.textContent = "GitHub Radar 暂不可用，已载入演示。需要配置 /api/github-trending 代理。";
  }
}

function loadAiConfigForm() {
  const config = F9Core.readAiConfig(storage);
  document.querySelector("#aiBaseUrl").value = config.baseUrl;
  document.querySelector("#aiApiKey").value = config.apiKey;
  document.querySelector("#aiModel").value = config.model;
}

function saveAiConfigForm(event) {
  event.preventDefault();
  F9Core.saveAiConfig(storage, {
    baseUrl: document.querySelector("#aiBaseUrl").value,
    apiKey: document.querySelector("#aiApiKey").value,
    model: document.querySelector("#aiModel").value
  });
  document.querySelector("#aiConfigStatus").textContent = "AI API 配置已保存在当前浏览器。";
}

async function analyzeRepository(repo) {
  const dialog = document.querySelector("#analysisDialog");
  const body = document.querySelector("#analysisBody");
  const title = document.querySelector("#analysisTitle");
  const repoLink = document.querySelector("#analysisRepoLink");
  const config = F9Core.readAiConfig(storage);
  title.textContent = repo.name;
  repoLink.href = repo.url;
  body.textContent = "正在请求 AI 分析...";
  dialog.showModal();

  if (!config.baseUrl || !config.apiKey || !config.model) {
    body.textContent = "请先在 AI API Config 中填写 Base URL、API Key 和模型。";
    return;
  }

  try {
    const request = F9Core.buildRepoAnalysisRequest(repo, config);
    const response = await fetch(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(request.body)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    body.textContent = payload.choices && payload.choices[0] && payload.choices[0].message
      ? payload.choices[0].message.content
      : "AI 返回了空分析结果。";
  } catch (error) {
    body.textContent = `分析失败：${error.message}`;
  }
}

function saveCurrentNote(event) {
  event.preventDefault();
  F9Core.saveNote(storage, {
    id: document.querySelector("#noteId").value,
    title: document.querySelector("#noteTitle").value,
    body: document.querySelector("#noteBody").value,
    image: currentImage
  });
  resetEditor();
  renderNotes();
}

function editNote(id) {
  const note = F9Core.listNotes(storage).find(function (item) { return item.id === id; });
  if (!note) return;
  document.querySelector("#noteId").value = note.id;
  document.querySelector("#noteTitle").value = note.title;
  document.querySelector("#noteBody").value = note.body;
  currentImage = note.image || "";
  updateImagePreview();
  document.querySelector("#noteTitle").focus();
}

function resetEditor() {
  document.querySelector("#noteForm").reset();
  document.querySelector("#noteId").value = "";
  currentImage = "";
  updateImagePreview();
}

function updateImagePreview() {
  const wrap = document.querySelector("#imagePreviewWrap");
  const image = document.querySelector("#imagePreview");
  if (!currentImage) {
    wrap.hidden = true;
    image.removeAttribute("src");
    return;
  }
  image.src = currentImage;
  wrap.hidden = false;
}

function startStarfield() {
  const canvas = document.querySelector("#starfield");
  const context = canvas.getContext("2d");
  const stars = Array.from({ length: 120 }, function () {
    return { x: Math.random(), y: Math.random(), z: Math.random() * 1.8 + 0.2 };
  });

  function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(237, 255, 249, .8)";
    stars.forEach(function (star) {
      star.y += 0.0008 * star.z;
      if (star.y > 1) star.y = 0;
      const x = star.x * canvas.width;
      const y = star.y * canvas.height;
      context.globalAlpha = 0.28 + star.z * 0.25;
      context.beginPath();
      context.arc(x, y, star.z * 1.1, 0, Math.PI * 2);
      context.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

document.querySelector("#newsForm").addEventListener("submit", fetchNews);
document.querySelector("#githubForm").addEventListener("submit", fetchGithubTrending);
document.querySelector("#aiConfigForm").addEventListener("submit", saveAiConfigForm);
document.querySelector("#useDemoNews").addEventListener("click", function () {
  F9Core.cacheNews(storage, demoNews);
  renderNews(demoNews);
  document.querySelector("#newsStatus").textContent = "已载入演示情报。";
});
document.querySelector("#repoGrid").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  const card = event.target.closest(".repo-card");
  if (!button || !card || button.dataset.action !== "analyze") return;
  const repo = currentRepos.find(function (item) { return String(item.id) === card.dataset.repoId; });
  if (repo) analyzeRepository(repo);
});
document.querySelector("#closeAnalysis").addEventListener("click", function () {
  document.querySelector("#analysisDialog").close();
});
document.querySelector("#noteForm").addEventListener("submit", saveCurrentNote);
document.querySelector("#resetNote").addEventListener("click", resetEditor);
document.querySelector("#clearImage").addEventListener("click", function () {
  currentImage = "";
  updateImagePreview();
});
document.querySelector("#noteSearch").addEventListener("input", renderNotes);
document.querySelector("#noteImage").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    currentImage = reader.result;
    updateImagePreview();
  };
  reader.readAsDataURL(file);
});
document.querySelector("#noteList").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  const card = event.target.closest(".note-card");
  if (!button || !card) return;
  if (button.dataset.action === "edit") editNote(card.dataset.id);
  if (button.dataset.action === "delete") {
    F9Core.deleteNote(storage, card.dataset.id);
    renderNotes();
  }
});

loadAiConfigForm();
startStarfield();
renderNews(F9Core.readCachedNews(storage).items.length ? F9Core.readCachedNews(storage).items : demoNews);
renderRepos(demoRepos);
renderNotes();
