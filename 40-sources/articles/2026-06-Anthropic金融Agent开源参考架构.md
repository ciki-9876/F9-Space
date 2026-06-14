---
title: Anthropic 把华尔街分析师的活儿开源了——金融 Agent 参考架构拆解
date: 2026-06-11
type: source
tags: [AI产品, 方法论]
url: https://mp.weixin.qq.com/s/w1qPgYteUA5jedYlA6bwpQ
author: 微信公众号文章（拆解 Anthropic 官方 GitHub 项目 anthropics/financial-services）
status: reviewed
volatile: false
---

# 一句话摘要

Anthropic 开源了 financial-services 仓库（16.9k stars），把金融行业 4 条业务线的高频工作流封装为 10 个 Agent + 7 个 Skill 包 + 11 个 MCP 数据连接器，全用 Markdown/YAML 写成，fork 即可改——是一份"垂直领域 Agent 系统如何产品化"的完整参考架构。

# 关键观点(3-5 条)

- **垂直 Agent 产品化的全栈结构**：场景→Agent（端到端编排）→Skills（可复用斜杠命令）→MCP 连接器（数据层）→输出物（Excel/PPT/邮件）。每层职责清晰、可独立替换。
- **"Two ways from one source" 双模式部署**：同一份 system prompt + skill，白天以 Cowork 插件形态人机协同（单任务），晚上切 Managed Agents API 无头批量跑（全组合对账）。一套逻辑，两种运行。
- **File-based = 可审计 + 可交接**：所有 agent 逻辑用 markdown + YAML 写成，无编译步骤。合规团队能直接读代码、新人拿到就能理解。这是降低 Key Person Risk 的架构选择。
- **"AI drafts, humans sign off" 合规底线**：Agent 永远只 stage 输出等人签字，不会自动执行交易/过账/批准。这条原则写进工程设计，不是口号。
- **Agent 间可互相调用**：Managed Agents 模式下 agent 发出 handoff_request 事件，由 orchestration 层路由。项目给了 orchestrate.py 参考，可接 Temporal/Airflow/内部事件总线。

# 我认同的

- 对我的两层价值判断成立：工作层（垂直 Agent 产品化架构参考）+ 个人层（OPC 商业模式验证）
- "Agent→Skill→MCP→输出物"的全栈分层对千星奇域 agent 设计有直接参考价值
- "AI drafts, humans sign off" 作为合规底线的设计原则
- 双模式部署方向正确，但当前阶段先跑通单模式再说

# 我有疑问 / 不认同的

> 以下由 AI 挑刺，我审核认可：

- **File-based ≠ 真正可交接（但原因和文章说的不同）**：文章认为 markdown 可读所以可交接。但实际上接手的人不会去仔细读 skill 文件——他们会直接问 Agent"这个 skill 怎么用、什么时候用"。所以 skill 的主要读者是 Agent 而非人类，不需要为了交接而写过多解释细节。file-based 的真正价值是"Agent 可解释执行"，不是"人类可阅读理解"。
- **OPC"封装领域经验为模板"的护城河问题未解**：谁会为模板付费？如果护城河在"持续迭代的领域判断力"而非模板本身，那商业模式更接近咨询/陪跑。这个问题我还没想清楚。→ 引出开放问题。
- **双模式部署对当前阶段是过早优化**：千星奇域 agent 还在 0→1，先在单模式跑出价值再考虑架构扩展。

# 对我有用的部分

> "会用 agent 把流程拼起来的人，和不会用的人，产出能力会拉开数量级的差距。"

> 同一个 prompt、同一套 skill、同一份输出标准，不用维护两套逻辑——白天交互、晚上批量。

> 每条命令背后挂着一个 markdown 写的 skill 文件，里面写明了"建模步骤、行业惯例、输出格式、QC 清单"。这意味着：你公司的内部模板和风格规范，可以直接通过编辑这些 markdown 文件被 Claude 继承下来。

> Apache 2.0 license——可商用、可改造、没有专利陷阱。

# 应用映射(给未来 AI 看的应用指引,不是读后感)

> 当我在做相关工作/产品落地时,AI 应直接调用此段,而不是泛泛摘录全文观点。

## 通用原则(任何符合主题的工作场景都适用)

| 原则 | 落地动作 |
|---|---|
| 垂直 Agent = 场景→Agent→Skill→数据连接→输出物 | 设计 agent 系统时按这 5 层拆解,每层独立可替换 |
| 双模式部署:同一 prompt 支持交互 + 批量 | 设计时不要把"人机协同"和"自动批量"做成两套——共享 prompt/skill,只切运行模式 |
| File-based 逻辑(md + YAML) | Agent 的 system prompt、skill、配置全部文件化,不藏在代码里——可版本控制、可审计、可交接 |
| "AI drafts, humans sign off" | 涉及风险决策的 agent 输出一律 staged,不自动执行——这是合规底线也是信任建设 |
| Skill 即文档 | 每个斜杠命令对应一个 md 文件,写明步骤/惯例/输出格式/QC 清单——domain expert 写得出来,不需要工程师 |
| 开源参考实现 + 企业二次定制 | 不从零造——拿行业最佳实践做起点,改数据源/注入 firm context/套自家模板/调 agent 作用域 |

## 按场景的具体落法

| 工作场景 | 关键应用点 |
|---|---|
| 千星奇域 Agent 系统架构设计 | 参考"Agent→Skill→MCP"三层 + orchestration 事件路由,设计关卡孵化/UGC 治理/内容审核的 agent 拓扑 |
| 运营后台的 Skill 体系设计 | 每个运营动作封装为一个 md skill 文件(步骤+惯例+输出格式+QC),运营人员可直接编辑和迭代,不需要工程师 |
| "同一 agent 白天交互/晚上批量"的产品形态 | 用户白天在后台和 agent 协同审核内容,晚上同一 agent 自动批量跑待审队列——一套逻辑两种部署 |
| Agent 间协作设计 | handoff_request 事件 + orchestration 路由——当"关卡质量检测 agent"需要"内容安全 agent"的输出时,通过事件总线串联 |
| 降低 Agent 系统的 Key Person Risk | 全部逻辑 file-based(md/YAML),无编译步骤,新人拿到仓库就能读懂——这是对"单点故障" insight 的架构层回答 |
| OPC/个人商业模式参考 | 验证了"把领域专业知识封装为 Agent 模板并分发"是有价值的商业模式——关键不是会写代码,而是最懂业务痛点 |

# 关联

- related domain: [[10-domain/AI产品落地/README.md]]（补充 5 层设计栈中 L3 Skills + L4 Orchestration 的实操参考）
- related source: [[40-sources/articles/2026-06-Anthropic销售零代码做工具案例.md]]（同一家公司,一篇讲个人做工具,一篇讲系统级架构——互补）
- related insight: [[30-insights/2026-06-个人AI工具如何避免单点故障.md]]（file-based + 无编译 + 开源 = 降低交接门槛的架构回答）
