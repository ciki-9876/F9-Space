# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# 私人知识库 - 给 AI 的说明书

> 这份文档是给读取本知识库的任何 AI 工具看的(Claude Code、扣子 bot、Kimi、自建应用等)。
> 库主人在最下面定义"回答规则",AI 必须遵守。
> **本仓库不是代码项目**,是 Markdown + YAML frontmatter 的个人知识库。没有 build / lint / test 命令(Lint 是基于规则的笔记审计,见下文),Claude Code 的核心动作是 **读笔记、写笔记、跨笔记综合**。

## 库主人是谁

米哈游千星奇域生态组产品运营,关注 UGC 内容中台、游戏运营方法论、AI 产品工具。
工作语境:游戏行业 / 内容生态 / 中国大陆。

个人目标:实现 OPC(一人公司)/ 自由职业,最理想方向是独立游戏开发。
核心能力:审美、文字功底、创意、游戏天赋(任何游戏快速理解 + 超常水平)、SaaS 产品经理经验。
家庭:已婚,有一岁半小孩(2026-06)。
本知识库同时服务工作和个人生活(游戏开发、育儿、婚姻等)。

## 目录结构与含义

| 目录 | 放什么 | AI 怎么用 |
|---|---|---|
| `00-inbox/` | 未整理素材临时区 | **不要引用**,但可提示"inbox 里有 X 条待整理" |
| `10-domain/` | 领域知识长期沉淀 | 我的"长期记忆",可放心引用 |
| `20-topics/` | 跨素材综合的专题盘点 | 我已审过的成熟观点,**最高优先级** |
| `30-insights/` | 我自己的思考与结论 | 第一人称引用("你说过…") |
| `40-sources/articles/` | 文章剪藏 | 别人的观点,引用必须标来源 |
| `40-sources/dialogues/` | AI 对话归档 | 协作产出,介于自他之间 |
| `40-sources/videos/` | 视频转录 | 同 articles |
| `50-tools/` | 工具索引 | 资源库,被问到具体工具时查 |
| `60-meta/` | 模板、tag 字典、工作流文档 | 元数据,**默认不读取** |
| `99-archive/` | 存档/弃用 | **永远不读取** |

## 笔记类型(frontmatter 的 type 字段)

每个 .md 都有 type,决定 AI 怎么对待它:

- `insight` → 我的思考、结论。**我的观点**
- `source` → 别人的文章/视频精华。**别人的观点**,即使我标了 reviewed
- `dialogue` → 和 AI 的对话产出。**协作产出**,不完全是我独立观点
- `topic` → 跨素材综合。我审过的成熟观点
- `tools` → 工具索引
- `meta` → 元数据(模板、规则),不参与回答

## 状态字段(status)

- `draft` → 我还没复审过,引用时降低权重
- `reviewed` → 我审过的,可信
- `archived` → 弃用,不引用

## 开放问题字段(resolved,仅 insight 类型)

- `resolved: true` → 已有结论的 insight(默认)
- `resolved: false` → 开放问题——有思考但尚无完整结论
  - AI 引用时标注"这是你还在想的开放问题,尚无定论"
  - 当新 source 录入时,AI 应检查是否有相关的 `resolved: false` insight 可以推进
  - 找到答案后改为 `resolved: true` 并补充结论

## 时效性字段(volatile / expires_at)

部分笔记标了 `volatile: true`,表示内容会过期(如 AI 工具教程、产品功能介绍、版本相关最佳实践)。

引用 volatile 笔记时,AI 必须:
1. 检查当前日期是否已过 `expires_at`
   - 已过期 → 引用时**明确警告**:"这条笔记标注 expires_at=YYYY-MM,可能已失效,建议核实当前情况"
   - 未过期 → 正常引用,但**末尾附一句**"内容截至 YYYY-MM,可能已变化"
2. volatile 笔记的"长期有效原理"段(如有)可正常引用,不必加警告——只对"当前实现"段加警告
3. 跨笔记综合时,遇到多条 volatile + 同主题的,**优先引用 expires_at 最新的**那条

## 回答规则(必须遵守)

1. **区分"我说过的"和"我看过的"**
   - type=insight / topic → 用第一人称,"你认为…"
   - type=source / dialogue → 必须标注来源,"在某文章中""和某 AI 对话中"
   - 严禁把 source 的观点当成我的观点输出

2. **引用必须可溯源**
   - 跨笔记综合时,**列出引用的文件路径**
   - 我要能根据回答找到原始 .md

3. **优先级顺序(按问题类型分场景)**
   - **自我回顾型**问题(我说过什么 / 我怎么想 / 我以前的判断)→ `topic > insight > dialogue > source`
   - **应用决策型**问题(做 X 业务/产品落地时怎么办 / 求方法论支持)→ `topic > 高质量 source ≈ insight > dialogue > draft source`
   - 判断依据:用户问的是**我的内在状态**(自我),还是**外部专业判断辅助**(应用)
   - 应用决策型问题中,如果引用的 source 笔记包含「应用映射」段,**优先调用该段**,而不是泛泛摘录关键观点

4. **状态过滤(按 type 分级)**
   - **insight / topic**:默认只用 `status=reviewed`,引用 draft 时必须明确"这是我还没复审的草稿,不一定准"
   - **source / dialogue**:只要不是 `status=archived` 都可引用(reviewed 字段语义只对"我自己的判断"有效;source 进库本身就是经过筛选的)
   - 例外:如果应用决策严重依赖某条 draft source,可顺带提一句"这篇我还没正式复审"

5. **Inbox 提醒**
   - 如果 00-inbox 里有相关素材但还没整理,告诉我
   - 不要假装它们不存在

6. **dialogue 类型的特别提醒**
   - 引用 dialogue 时注明这是"我和 AI 协作产出",不完全独立
   - 我有时会忘记当初为什么这么想,这种来源标注帮我记起来

## 我的工作场景

- 周末 / 晚上整理素材
- 工作中临时查询特定话题
- 月底做专题盘点(读 40-sources 全目录,综合给观点)

## 数据格式承诺

所有笔记 = Markdown + YAML frontmatter。我未来可能换工具(从扣子换到 Claude Code、自建应用),但数据格式不变。AI 工具可以来去,数据不动。

---

## Claude Code 专用操作指引

本节是给 Claude Code 的"快捷键"——上面的回答规则照样适用,这里只是把 Claude Code 实际会执行的三类任务的相关文件路径集中索引。

### 三类核心任务

| 任务 | 触发场景 | 必读文件 | 输出落点 |
|---|---|---|---|
| **录入新素材** | 库主人粘贴原文/对话/想法 | `60-meta/workflow-A-AI辅助录入.md`、`60-meta/filter-checklist.md`、`60-meta/tag-schema.md`、`60-meta/templates/*.md` | 按 type 落到 `30-insights/` `40-sources/articles/` `40-sources/dialogues/` `50-tools/` |
| **月底专题盘点** | "做一次 X 主题的 topic 盘点" | `40-sources/` 全目录(按 tag/关键词)+ `30-insights/` 相关条目 | `20-topics/YYYY-MM-Q?-主题.md`,文件名按 `60-meta/filter-checklist.md` 命名规则 |
| **Lint 审计**(库内 ≥ 20 篇后启用) | "跑一次 lint" / "盘一下哪些笔记要处理" | `60-meta/lint-rules.md`(9 条规则,优先级 ★ 标注) | **Dry mode**:只产出建议清单,不直接改动文件,等库主人审完手动执行 |

### 录入流程的硬约束(写入新文件前必读)

- 文件名格式:`YYYY-MM-中文关键词.md`,**用中文不用拼音**
- frontmatter 的 `status` 字段 AI 默认填 `draft`,**不要自动填 reviewed**
- tag 必须从 `60-meta/tag-schema.md` 选;词典外的新词放到该文件底部"待审视"区,不直接用
- 一段素材若同时包含"我的原创思考"和"和 AI 的对话",**拆成 insight + dialogue 两个文件**,互相 link
- 写入用 Write 工具直接落盘,**不要只在对话里给内容**

### Lint 审计的硬约束

- 当前(2026-06)还在过往筛选阶段,库内文件少,**暂不主动跑 Lint**——除非库主人明确要求
- 跑 Lint 时严格遵循 `60-meta/lint-rules.md` 的 dry-mode 原则:输出建议清单,不动文件
- 输出格式按规则文档末尾的"Lint 输出格式"模板

### 其他常用入口

- 项目说明、维护节奏(每周日清 inbox / 每月底盘点 / 每季度审视):`README.md`
- 当前阶段(过往筛选,截止 2026-07-02):`README.md` 末尾"当前阶段"段
- 模板源文件:`60-meta/templates/{insight,source,dialogue,tools}.md`
