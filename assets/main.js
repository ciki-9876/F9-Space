const storage = window.localStorage;
const demoNews = [
  {
    title: "AI HOT 精选情报待机",
    summary: "点击刷新情报会请求 aihot.virxact.com 的公开接口。若本地网络或 CORS 受限，可先使用腾讯云函数代理。",
    source: "F9 Space",
    url: "https://aihot.virxact.com",
    category: "selected",
    publishedAt: new Date().toISOString()
  },
  {
    title: "长期维护建议：定时缓存，不让浏览器直连所有上游",
    summary: "云函数每天定时拉取 AI HOT 精选数据，写入 COS 或数据库，前端只读你的稳定 API。",
    source: "Architecture",
    url: "https://github.com/KKKKhazix/khazix-skills",
    category: "deployment",
    publishedAt: new Date().toISOString()
  }
];

let currentImage = "";

function formatDate(value) {
  if (!value) return "Unknown time";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function renderNews(items) {
  const grid = document.querySelector("#newsGrid");
  document.querySelector("#signalCount").textContent = String(items.length).padStart(2, "0");
  grid.innerHTML = items.map(function (item) {
    return `
      <article class="news-card">
        <div class="card-meta">
          <span>${item.source}</span>
          <time>${formatDate(item.publishedAt)}</time>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || "暂无摘要，打开来源继续阅读。")}</p>
        <a href="${item.url}" target="_blank" rel="noreferrer">打开来源</a>
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

async function fetchNews(event) {
  event.preventDefault();
  const status = document.querySelector("#newsStatus");
  const category = document.querySelector("#newsCategory").value;
  const query = document.querySelector("#newsQuery").value.trim();
  const since = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
  const url = F9Core.buildAiHotUrl({ category, query, since, take: 12 });
  status.textContent = "正在连接 AI HOT 情报源...";

  try {
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = F9Core.normalizeNewsItems(payload);
    F9Core.cacheNews(storage, items);
    renderNews(items);
    status.textContent = `已同步 ${items.length} 条情报。`;
  } catch (error) {
    const cached = F9Core.readCachedNews(storage);
    if (cached.items.length) {
      renderNews(cached.items);
      status.textContent = `远端暂不可用，显示缓存：${error.message}`;
    } else {
      renderNews(demoNews);
      status.textContent = `远端暂不可用，已载入演示：${error.message}`;
    }
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
document.querySelector("#useDemoNews").addEventListener("click", function () {
  F9Core.cacheNews(storage, demoNews);
  renderNews(demoNews);
  document.querySelector("#newsStatus").textContent = "已载入演示情报。";
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

startStarfield();
renderNews(F9Core.readCachedNews(storage).items.length ? F9Core.readCachedNews(storage).items : demoNews);
renderNotes();
