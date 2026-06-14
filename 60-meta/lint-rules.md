---
title: Lint 规则草稿
type: meta
status: draft
---

> 这是 Lint 动作的规则集草稿。当前(2026-06)还在过往筛选阶段,库里文件少,**暂不实际跑 Lint**。
> 等库内文件 ≥ 20 篇后,用这份规则跑第一次 Lint。
> Lint 的执行模式:**Dry mode 优先**——LLM 只产出"建议改动清单",我审完后手动执行。

# Lint 检查规则集

## 规则 1:过期检查(优先级 ★★★)

扫描所有 `volatile: true` 的笔记,检查 `expires_at` 字段:

- 已过期(超过当前月份):
  - 输出文件路径
  - 建议:重新审视 → 更新 / 降级 status=archived / 移到 99-archive
- 距过期 ≤ 1 个月:
  - 输出文件路径,提示"即将过期"

## 规则 2:孤儿 inbox 检查(优先级 ★★)

扫描 `00-inbox/` 下文件:

- 修改时间 > 14 天:输出文件路径,提示"超 2 周未整理,建议处理或 archive"
- 修改时间 > 30 天:**强烈建议直接 archive**(否则违反 filter-checklist 的"延后最多 1 周"规则)

## 规则 3:tag 词典违规(优先级 ★★)

扫描所有笔记的 frontmatter `tags`:

- tag 不在 `60-meta/tag-schema.md` 词典内:
  - 列出违规文件 + 不合法的 tag
  - 建议:加入待审视区 / 替换为已有 tag / 删除

## 规则 4:主题聚集检测(优先级 ★★)

扫描 `40-sources/articles/` 当月新增,按 tag 聚类:

- 某主题 ≥ 3 篇文章:
  - 建议:可触发 topic 盘点,放进 `20-topics/`
  - 输出该主题的文件清单,作为盘点的素材池

## 规则 5:insight 冲突检测(优先级 ★)

扫描 `30-insights/` 和 `20-topics/`:

- LLM 判断有"互相矛盾"或"明显演化关系"的两条:
  - 标记冲突对
  - 建议:看是否需要合并、补充时间线、显式标记观点演化

## 规则 6:相近 insight 合并建议(优先级 ★)

扫描 `30-insights/` 内部:

- LLM 判断主题重合度高的两条:
  - 建议合并成一条,或提升为 topic
  - 不强制执行

## 规则 7:草稿停滞检测(优先级 ★)

扫描所有 `status: draft` 的笔记:

- date 字段距今 > 30 天:
  - 提醒:该升 reviewed 还是降 archive
  - 不能永远停在 draft

## 规则 8:孤立笔记检测(优先级 ★★)

扫描所有 `10-domain/`、`20-topics/`、`30-insights/`、`40-sources/`、`50-tools/` 内的笔记:

- 没有任何 incoming link(即没有其他笔记在「关联」段引用它)且自身也没有 outgoing link:
  - 输出文件路径
  - 建议:检查是否应补关联 / 是否主题孤立需要更多 source 支撑 / 是否应 archive
- 有 outgoing link 但零 incoming link(只引用别人但没人引用它):
  - 低优先级提示:可能是新录入的,观察一段时间

**设计来源**: LLM Wiki 的"知识缺口检测"——找出知识网络中的孤立节点和稀疏区域。

## 规则 9:开放问题停滞检测(优先级 ★★)

扫描所有 `resolved: false` 的 insight:

- date 字段距今 > 60 天,且期间没有新的 related source 录入:
  - 提示:"这个开放问题已 2 个月无新输入,是否需要主动搜索相关资料/降级为'暂不追踪'"
- date 字段距今 > 60 天,但期间有新 related source:
  - 提示:"有新素材可能推进此问题,建议重新审视是否可标记 resolved"

## 规则 10:archive 召回提示(优先级 低)

扫描 `99-archive/`:

- LLM 判断和当前活跃 insight / topic 主题相关的 archived 内容:
  - 提示"以前你也想过这个,要不要再看看"
  - 不强制执行

## 规则 11:格式合规性(优先级 低)

扫描所有笔记:

- 缺 frontmatter / type 缺失 / 必填字段为空 → 列出
- 文件名不符合 `YYYY-MM-中文关键词.md` → 列出

# Lint 执行频次建议

- **小库**(< 50 文件):每月 1 次
- **中库**(50-200 文件):每 2 周 1 次
- **大库**(> 200 文件):每周 1 次,但优先级高的规则(1-3)单独高频跑

# Lint 输出格式(建议)

```markdown
# Lint Report - YYYY-MM-DD

## 高优先级(建议本周处理)
- [文件路径]: [问题] - [建议动作]

## 中优先级
- ...

## 低优先级
- ...

## 跨笔记综合建议
- 主题 X 已聚集 N 篇,建议触发 topic 盘点
- ...
```

# 阶段性升级计划

## ≥ 20 篇:启用 Lint

- [ ] 跑第一次 Lint(dry mode),验证规则的实用性
- [ ] 第一次 Lint 后,根据实际情况增减规则

## ≥ 50 篇:搭建向量检索层

**目的**: Grep 只能匹配关键词,50+ 篇后需要"语义搜索"——找到意思相关但用词不同的笔记。

**执行步骤(由当时的 AI 会话负责实施,库主人无需提前了解技术细节)**:

1. 探测 Titan 沙箱可用的 embedding 接口:
   - 优先:公司内部 AI 网关(如 AthenAI)是否提供 embedding endpoint
   - 备选:pip install sentence-transformers,用本地小模型(~400MB)
   - 最简方案:用 LLM 自身生成摘要关键词做 TF-IDF 相似度(零额外依赖)
2. 在 `zhishiku/.scripts/vector_index.py` 实现:
   - `scan`: 扫描所有 .md → 提取 title + 一句话摘要 + tags → embedding → 存入本地向量库(LanceDB 或简单 JSON)
   - `query "文本"`: 返回 top-N 最相关笔记路径 + 相似度分数
   - `update`: 增量更新(只处理新增/修改文件)
   - `orphans`: 找语义上和全库都不相关的笔记
3. 集成到工作流:
   - 录入时: AI 跑 query 找关联候选(替代纯 Grep)
   - 回答问题时: AI 先 vector query 再读内容
   - Lint 时: 跑 orphans 找孤立笔记
4. 存储位置: `zhishiku/.vector/`(随 KB 数据持久化)

**前置条件(当时确认即可)**:
- [ ] Titan 沙箱能调什么 embedding 接口
- [ ] pip install lancedb 是否可行(或用更轻量替代)

# 待办

- [ ] 确定 Lint 用哪个工具跑(当前环境:Titan Agent + Claude Opus 4.6,可直接在对话中执行)
