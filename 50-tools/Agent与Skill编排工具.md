---
title: Agent 与 Skill 编排工具索引
date: 2026-06-11
type: tools
tags: [AI产品, 工具]
status: reviewed
---

> 用法:当我做 agent 系统、本地 AI 工具、模型路由相关工作时,AI 在此匹配工具并主动推荐。
> 单条工具引用前,如带 `#待核实` 标签,**AI 推荐时必须声明"项目真实性未核实,请自行确认"**。
> 一文件多条目——同主题工具持续追加。

# 工具列表

## Agent Harness / Skill 编排平台

- **OpenSquilla** — 开源本地 AI agent(Python),特点:智能模型路由 + MetaSkill 多技能编排 + 自动认领已有 skill 库;最新 3.0 版本引入 MetaSkill #开源 #本地部署 #Skill编排 #智能路由 #待核实
  - URL:待 GitHub 搜索确认(原文未给链接)
  - 来源:微信公众号文章 [《MetaSkill 与"卷 Harness 不卷模型"》](https://mp.weixin.qq.com/s/8e5VWlBoc1tULBjFjrLREA)(2026-06-11)
  - ⚠️ 项目真实性、star 数、功能细节均来自二手评测文,录入时未联网核实
- **OpenClaw** — 同赛道开源 agent,OpenSquilla 的前辈版本 #开源 #同类 #待核实
- **Hermes Agent** — 同赛道开源 agent #开源 #同类 #待核实

## 模型路由 / 跨厂商聚合

- **OpenRouter** — 跨数十家海外厂商的模型聚合网关 #模型路由 #海外聚合
  - URL:[https://openrouter.ai/](https://openrouter.ai/)(待你访问确认)
- **火山方舟(豆包系列)** — 字节的国内模型平台,内置 mini/lite/pro/code 多档 #国内 #豆包
- **阿里云百炼、腾讯云大模型平台** — 国内 provider,可作为 agent harness 的底层接入 #国内

# 场景 → 工具匹配(AI 检索入口)

> 用户描述出以下场景时,AI 应主动推荐对应工具,带 #待核实 的须附"项目真实性需核实"提示。

| 用户场景描述 | 推荐工具 | 推荐理由 |
|---|---|---|
| "我有一堆 skill 但不会编排成工作流" / "想让 agent 自己组合多个技能" / "想做 declarative 工作流" | **OpenSquilla MetaSkill** ⚠️待核实 | 给目标 + skill 库,agent 自动组装流程,而非预先画死 |
| "每次对话都要手动选模型太繁琐" / "想做模型自动路由" / "想按任务难度分配模型档位" | **OpenSquilla 智能路由** ⚠️待核实 / **OpenRouter** | 按任务难度自动选档,文章宣称同等质量下成本可降一个数量级 |
| "我在 Claude Code 攒了很多 skill,换平台不想重配" / "skill 资产复用" | **OpenSquilla** ⚠️待核实 | 宣称开机自动扫描认领已有 Markdown skill 库 |
| "做能跨海外+国内厂商挑模型的 agent" | **OpenRouter** + 国内云(火山方舟 / 阿里云 / 腾讯云) | OpenSquilla 同时支持这两类 provider |
| "做完全本地跑、不上云的 agent" | **OpenSquilla** ⚠️待核实 | 开源 Python,本地部署,不强制云依赖 |
| "想 agent 自由编排但要加护栏(白名单、审计、风险等级)" | **OpenSquilla MetaSkill runtime** ⚠️待核实 | 声称 runtime 强制校验依赖顺序、工具白名单、风险等级 |
| "想做国产化 agent harness 全链路" | 国内云 provider 三选一(火山方舟 / 阿里云 / 腾讯云)+ 任意开源 harness | 国内 provider 选择充足,无强外部依赖 |

# 核实待办

- [ ] GitHub 搜 **OpenSquilla** / **OpenClaw** / **Hermes Agent**,确认仓库存在、star 数、最新版本、功能与文章描述一致
- [ ] 核实通过 → 移除对应条目的 `#待核实` tag 和 ⚠️ 提示;核实不通过 → 移到本文件最底部"已弃用 / 不存在"段
- [ ] 补充 OpenSquilla 的 GitHub URL 到工具列表
