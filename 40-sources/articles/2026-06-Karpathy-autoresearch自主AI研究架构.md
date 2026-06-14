---
title: Karpathy autoresearch——AI Agent 自主跑实验的编排架构
date: 2026-06-11
type: source
tags: [AI产品, 方法论]
url: https://github.com/karpathy/autoresearch
publish_date: 2026-05
author: Andrej Karpathy
status: reviewed
volatile: false
---

# 一句话摘要

Karpathy 最高星（86.1k）开源项目：给 AI Agent 一个真实 LLM 训练环境，让它自主改代码→训练 5 分钟→评估→保留或回滚→循环，一晚上跑 ~100 次实验。人的角色从"写 Python"变为"写 program.md 编排文档"。

# 关键观点

- **三文件架构**：`prepare.py`（固定常量，Agent 不碰）+ `train.py`（Agent 唯一可修改的文件）+ `program.md`（人写的 Agent 指令文档）。极简约束 = 极大自由度。
- **program.md = "编程 Agent"**：人不再直接写代码，而是写 Markdown 指令文档来"编程"研究组织。这是一种"自然语言编程"范式——用 Markdown 定义 Agent 的行为边界、实验目标、评估标准。
- **固定预算可比较**：每次实验固定 5 分钟训练时间，无论 Agent 怎么改架构/超参数，结果都在同一尺度上可比。设计哲学：控制变量让迭代可评估。
- **单一指标驱动**：val_bpb（验证集 bits per byte）作为唯一优化目标，且与词表大小无关——Agent 可以自由改架构而不影响公平比较。
- **"一个 GPU、一个文件、一个指标"**：极简主义设计哲学。去掉分布式、去掉复杂配置，把问题压缩到 Agent 能独立处理的最小单元。
- **人机分工清晰**：人写 program.md（定方向、设约束）→ Agent 跑实验（改代码、评估、迭代）→ 人看日志决定下一步研究方向。
- **实际成果**：通过多轮 autoresearch，nanochat 训练时间从 3.04 小时压缩到 1.65 小时（GPT-2 能力水平），证明了该模式的有效性。

# 我认同的

- 全部认同。但调用时需注意适用边界（见下方疑问段）。

# 我有疑问 / 不认同的

> 以下由 AI 挑刺，我审核认可：

- **"单一指标驱动"只适用于可量化评估的场景**：autoresearch 能全自主是因为 val_bpb 纯数值、无歧义、可自动计算。我的多数业务场景（UGC 治理、内容质量、游戏体验）缺乏这种自动化评估手段。→ **调用规则**：仅在遇到可量化评估的场景时调用此架构；不可量化场景下作为反向案例提醒"全自主迭代的前提条件是什么"。
- **"program.md 编排"的门槛在领域认知，但可通过 AI 协助缓解**：写出有效的 program.md 需要对领域有深度理解（知道该设什么约束、放什么自由度）。但这个门槛可以通过 AI 辅助来降低——AI 帮我补充领域知识和约束建议，我负责审判是否合理。本质上还是"人做判断 AI 做执行"的变体。

# 对我有用的部分

> "The human's role shifts from writing Python to programming the program.md Markdown files that provide context to the AI agents and set up your autonomous research org."

> "One GPU, one file, one metric."

> 设计哲学：给 Agent 最小的修改面（单文件）+ 最明确的评估标准（单指标）+ 最公平的比较基础（固定时间预算），Agent 的自主性反而最大化。

# 应用映射(给未来 AI 看的应用指引)

> ⚠️ 本项目是 LLM 训练领域的自主研究工具，但其**编排架构**对任何"AI Agent 自主迭代"场景有迁移价值。

## 通用原则(任何 Agent 自主迭代场景都适用)

| 原则 | 落地动作 |
|---|---|
| 极简约束 = 极大自由 | 给 Agent 的可修改面越小越聚焦（单文件/单模块），Agent 反而能做更深的探索 |
| 固定预算可比较 | 每轮迭代设固定时间/资源上限，让结果在同一尺度可比，才能判断"哪次改进有效" |
| 单一指标驱动 | 给 Agent 一个明确的、可量化的优化目标，避免多目标冲突导致 Agent 迷失 |
| program.md 编排范式 | 用自然语言文档定义 Agent 的行为边界、目标、约束——人从"写代码"升级为"写指令文档" |
| 人设方向 Agent 跑量 | 人负责研究方向和约束设计，Agent 负责高频试错和执行——与 Vibecoding "人做判断 AI 做执行"一脉相承 |
| 自主迭代闭环 | 修改→执行→评估→保留或回滚→下一轮，全自动无需人介入每一步 |

## 场景限定技巧(仅当触发条件匹配时调用)

| 触发条件 | 可调用的技巧 | 出处 |
|---|---|---|
| 设计千星奇域 Agent 的自主迭代能力 | 三文件分离架构：固定环境(prepare) + 可变逻辑(train) + 编排指令(program.md) | autoresearch 核心设计 |
| 需要让 Agent 自主优化某个模块 | 固定评估预算（时间/次数） + 单一量化指标 + 修改面限制在一个文件/函数 | 设计哲学 |
| 用 Markdown 编排 Agent 行为 | program.md 模式：用自然语言定义 Agent 的目标、约束、评估标准、禁止行为 | program.md 范式 |
| OPC 做 AI 产品需要"无人值守"能力 | 夜间自主跑实验模式：设好目标和约束 → Agent 连夜跑 → 早上看结果日志 | 使用方式 |

## 不适用场景(AI 不要用本文技巧回答)

- 需要人类审美判断的迭代（如视觉设计、文案调性）→ 人必须在环，不能纯自主
- 多目标冲突的场景（如同时优化速度+质量+成本）→ 需要人定优先级，单指标驱动不适用
- 不可量化评估的任务（如"内容是否有趣"）→ 缺乏自动评估手段，闭环断裂

# 关联

- directly supports: [[30-insights/2026-06-OPC护城河与商业模式.md]]（"AI 无人值守迭代"是 OPC 的效率杠杆之一）
- related source: [[40-sources/articles/2026-06-Anthropic金融Agent开源参考架构.md]]（同为 Agent 编排架构参考，Anthropic 偏"人审批 AI 执行"，autoresearch 偏"AI 全自主迭代"）
- related source: [[40-sources/articles/2026-06-5天Vibecoding微信小游戏方法论.md]]（共享"人做判断 AI 做执行"原则，但 Vibecoding 是人在环，autoresearch 是人不在环）
- related tools: [[50-tools/知识库管理工具.md]]（LLM Wiki 的 Lint = 轻量版自主迭代；autoresearch 是重量版）
