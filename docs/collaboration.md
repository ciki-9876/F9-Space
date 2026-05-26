# F9 Space Collaboration Notes

## Port Ownership

F9 Space is currently served by Nginx on port `8877`:

```text
http://43.160.215.184:8877/
```

Codex-maintained deployments should only touch:

- `/var/www/f9-space`
- the Nginx server block that listens on `8877`
- F9 Space API proxy paths under that server block:
  - `/api/ai-news`
  - `/api/github-trending`

Do not modify other collaborators' ports or unrelated Nginx server blocks unless explicitly requested.

## Deployment Rule

For Codex changes:

1. Commit and push to `main`.
2. Let GitHub Actions deploy static files to `/var/www/f9-space`.
3. If Nginx changes are needed, keep them scoped to the `8877` server block and mirror the intended config in `deploy/`.

## Current Modules

- `AI Briefing`: proxied through `/api/ai-news`.
- `GitHub Radar`: proxied through `/api/github-trending`.
- `Chronicle Notes`: stored in browser `localStorage`.
