# GitHub Actions 自动部署

这个项目已经配置了 `.github/workflows/deploy.yml`。之后只要推送到 `main` 分支，GitHub 会自动：

1. 检出代码。
2. 运行 `node --test tests/app-core.test.js`。
3. 打包 `index.html`、`assets/`、`docs/`。
4. 通过 SSH 上传到腾讯云服务器。
5. 解压到 Nginx 网站目录并 reload Nginx。

## 一次性服务器准备

先确保服务器已经安装并启动 Nginx：

```bash
apt update
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

创建网站目录：

```bash
mkdir -p /var/www/f9-space
chown -R www-data:www-data /var/www/f9-space
```

配置 Nginx：

```bash
nano /etc/nginx/sites-available/f9-space
```

写入：

```nginx
server {
    listen 80;
    server_name 43.160.215.184 f9aigc.icu www.f9aigc.icu;

    root /var/www/f9-space;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ai-news {
        proxy_pass https://aihot.virxact.com/api/public/items;
        proxy_ssl_server_name on;
        proxy_set_header Host aihot.virxact.com;
        proxy_set_header User-Agent "Mozilla/5.0";
        proxy_set_header Accept "application/json";
    }

    location /api/github-trending {
        proxy_pass https://api.github.com/search/repositories;
        proxy_ssl_server_name on;
        proxy_set_header Host api.github.com;
        proxy_set_header User-Agent "F9-Space";
        proxy_set_header Accept "application/vnd.github+json";
    }

    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|webp)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

启用配置：

```bash
ln -sf /etc/nginx/sites-available/f9-space /etc/nginx/sites-enabled/f9-space
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## GitHub Secrets

进入 GitHub 仓库：

`Settings -> Secrets and variables -> Actions -> New repository secret`

添加这些 secrets：

```text
TENCENT_HOST=43.160.215.184
TENCENT_USER=ubuntu
TENCENT_PORT=22
DEPLOY_PATH=/var/www/f9-space
TENCENT_SSH_KEY=<你的服务器 SSH 私钥完整内容>
```

`TENCENT_SSH_KEY` 要填私钥全文，包括：

```text
-----BEGIN ... PRIVATE KEY-----
...
-----END ... PRIVATE KEY-----
```

本地的 `.pem` 文件已经被 `.gitignore` 忽略，不要提交到 GitHub。

## 触发部署

推送到 main：

```bash
git add .
git commit -m "Add F9 Space site and auto deploy"
git push origin main
```

也可以在 GitHub 页面手动触发：

`Actions -> Deploy F9 Space -> Run workflow`

## 查看部署结果

部署完成后访问：

```text
http://43.160.215.184
```

如果已经配置域名和 HTTPS：

```text
https://f9aigc.icu
```
