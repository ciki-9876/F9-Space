---
title: Karpathy 的 markdown 知识库方案("杀死 RAG")
date: 2026-06-05
type: source
tags: [AI产品, 产品方法论, 方法论]
url:
publish_date: 2026-04-04
author: Andrej Karpathy(原 Gist 作者)/ 微信公众号(二手转述,作者待补)
status: reviewed
---

# 一句话摘要

Karpathy 4 月 4 日发布 5000 字纯文本方案 `llm-wiki.md`,主张用三目录(`raw/` + `wiki/` + `CLAUDE.md`)+ 三动作(Ingest / Query / Lint)替代向量 RAG 流水线,两周内 5000 star、X 浏览量 1700 万,中文圈包装为"杀死 RAG"。

# 关键观点

1. **三个目录**
   - `raw/`:原始素材,只加不改
   - `wiki/`:由 LLM 持续维护
   - `CLAUDE.md`:schema 文件,规定怎么思考、怎么写、何时合并页面

2. **三个动作**
   - **Ingest**(录入新素材)
   - **Query**(基于库提问)
   - **Lint**(让 LLM 整理 wiki)

3. **核心比喻**:Obsidian 是 IDE,LLM 是程序员,wiki 是代码库

4. **本质差异**:
   - 向量 RAG → 每次回答是一次性事件
   - LLM Wiki → 每次回答都变成对知识库的一次贡献(库是会增长的)

5. **"杀死 RAG"是媒体加的戏**:检索没消失,消失的只是 chunking + HNSW + 余弦相似度那套机械流水线

6. **分发节奏的隐喻**:从 Gist 发布到首批可跑 repo 只花 48 小时;Karpathy 真正示范的是"AI 时代最稀缺的不是代码,而是把事情想清楚的能力"

# 我认同的

(待你填——建议至少写一条,这是逼自己提炼的关键步骤)

-

# 我有疑问 / 不认同的

(待你填)

-

# 对我有用的部分

(精确摘录原文金句,加引号;不必多,1-3 句即可)

> ""

# 我的反思 prompts(AI 转入时附加,你审后可保留或删)

这篇直接打你正在搭的知识库一个反问。建议想完后写一条 insight,这里只列 prompts:

- Karpathy 用 3 目录 + LLM 维护 wiki,我现在 8 目录全人工分,是否过度结构化?
- "原始素材只加不改 + LLM 持续维护 wiki" vs "按 type 分目录",哪个更轻?
- 我的方案 A 算不算"每次回答都对知识库做贡献"?(目前不算——AI 只在新素材时介入,没有 Lint 这个周期性动作)
- **Lint 这个动作我没有**,要不要加?如何落地?(比如月底让 Claude Code 跑一次"整库审查")

# 关联

- related insight: (待你写完反思后链接到 30-insights/...)
- 原 Gist 链接:(待你补 URL)
- 这篇是知识库设计的元素材——可能触发 [60-meta/](../../60-meta/) 下规则文件的修订
