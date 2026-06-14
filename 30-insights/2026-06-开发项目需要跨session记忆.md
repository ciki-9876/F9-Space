---
title: Vibe Coding 开发需要跨 session 记忆机制
date: 2026-06-12
type: insight
tags: [AI产品, 方法论]
status: reviewed
resolved: true
---

# 结论

当我开始用 AI 做 Vibe Coding 开发时，必须在项目启动阶段就搭建跨 session 记忆机制，否则每次新会话都是白纸——AI 不记得项目背景、设计决策、已踩的坑。

# 方案(Titan 沙箱可用)

纯 Markdown 文件方案，不依赖外部工具：

| 层 | 文件 | 内容 |
|---|---|---|
| 项目上下文 | 项目根目录 `CLAUDE.md` | 技术栈、架构决策、已完成模块、当前进度、已知 bug、下一步 |
| 操作历史 | `handover-YYYY-MM-DD.md` | 本次做了什么、改了哪些文件、遇到什么坑、未完成的事 |
| 设计决策 | `decisions/` 目录 | 为什么选 A 不选 B、权衡、哪些已废弃 |

新 session 启动时：AI 读 CLAUDE.md + 最近 handover → 立刻恢复上下文。

# 为什么这条值得记

我可能不会意识到自己需要这个——因为"开始写代码"时脑子里想的是产品功能，不是基础设施。所以这条认知的价值在于：**当我说"我要开始开发"时，AI 应主动提醒我搭这套机制**。

# 关联

- design informed by: [[40-sources/articles/2026-06-5天Vibecoding微信小游戏方法论.md]]（同一开发范式下的方法论）
- related: [[30-insights/2026-06-桌面宠物Agent产品构想.md]]（未来第一个可能用到此方案的项目）
