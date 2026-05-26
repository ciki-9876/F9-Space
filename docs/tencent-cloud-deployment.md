# F9 Space 腾讯云部署建议

## 推荐长期架构

这个项目适合拆成三层：

1. 静态前端：`index.html`、`assets/` 部署到腾讯云 COS 静态网站或 EdgeOne Pages。
2. AI 新闻 API：腾讯云函数 SCF 定时调用 AI HOT，再把结果缓存到 COS、TDSQL-C、PostgreSQL 或 CloudBase 数据库。
3. 笔记数据：首版使用浏览器 `localStorage`。长期使用建议迁移到 CloudBase 数据库或自己的后端 API，并加登录鉴权。

这样维护成本最低：前端可以频繁改视觉，新闻抓取和笔记同步都在云端演进。

## 静态前端部署

1. 在腾讯云 COS 创建一个存储桶。
2. 开启“静态网站”能力，入口文件填 `index.html`。
3. 上传以下内容：
   - `index.html`
   - `assets/app-core.js`
   - `assets/main.js`
   - `assets/styles.css`
4. 绑定自定义域名并开启 HTTPS。
5. 如果使用 EdgeOne/CDN，把 COS 静态网站源站接入 CDN，并开启缓存。

## AI 新闻后端

首版页面会直接请求：

```text
https://aihot.virxact.com/api/public/items?mode=selected&take=12
```

长期维护建议改为：

```text
GET https://你的域名/api/ai-news
```

腾讯云函数逻辑：

1. 每天 08:05、12:05、18:05 定时触发。
2. 请求 AI HOT：

```bash
curl -H "User-Agent: Mozilla/5.0" "https://aihot.virxact.com/api/public/items?mode=selected&take=50"
```

3. 将返回 JSON 归一化后写入缓存。
4. 前端读取你的缓存 API，避免浏览器跨域、上游波动、限流问题。

## 笔记后端演进

首版笔记保存在当前浏览器，适合单设备试用。长期建议：

1. 增加登录：腾讯云 CloudBase Auth、微信登录或你自己的账号系统。
2. 存文本：CloudBase 数据库或 PostgreSQL。
3. 存图片：COS。
4. 前端把 `F9Core.saveNote/listNotes/deleteNote` 替换为异步 API 调用。
5. 服务端校验图片大小、文件类型和用户权限。

## 部署前检查

```bash
node --test tests/app-core.test.js
```

如果未来引入打包工具，再增加：

```bash
npm run build
npm run lint
```
