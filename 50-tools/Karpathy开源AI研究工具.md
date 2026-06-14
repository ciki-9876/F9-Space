---
title: Karpathy 开源 AI 研究与开发工具索引
date: 2026-06-11
type: tools
tags: [AI产品, 工具]
status: reviewed
---

> 用法：当我需要 LLM 训练教学、多模型协作决策、AI 职业影响分析时，AI 在此匹配工具推荐。
> 来源文章：https://mp.weixin.qq.com/s/KsAl7uSwSC2p-pA3HnwRGQ
> 一文件多条目——Karpathy 开源项目持续追加。

# 工具列表

## nanochat — $100 训练自己的 ChatGPT

- **定位**：最简 LLM 训练全流程教学工具——从 tokenization 到 chat UI，单 GPU 可跑
- **54.9k stars / 7.5k forks**（2026-06-11 GitHub 实测）
- URL: https://github.com/karpathy/nanochat ✅ 已核实
- 许可证：MIT
- 核心能力：
  - 完整 LLM 训练 pipeline：tokenization → pretraining → finetuning → evaluation → inference → chat web UI
  - 单复杂度旋钮：`--depth`（transformer 层数），其他超参数自动计算
  - GPT-2 能力复现成本：~$48（8×H100 约 2 小时），spot 实例低至 ~$15
  - 纯 PyTorch，支持 fp8/bf16/fp16/fp32，AdamW + Muon 优化器
  - 与 autoresearch 联动：通过 AI 自主实验持续优化训练速度
- ⚠️ **对我的价值定位**：认知拓宽（理解"训练一个 LLM 到底要什么"），非直接生产力工具。当我需要理解 AI 模型能力边界、与工程团队沟通训练相关话题时可参考。

## llm-council — 多 LLM 辩论投票决策

- **定位**：让多个 LLM 组成"委员会"——独立回答→匿名互评→主席综合终稿
- **20.6k stars / 3.9k forks**（2026-06-11 GitHub 实测）
- URL: https://github.com/karpathy/llm-council ✅ 已核实
- 许可证：未声明（默认版权保留，仅供参考）
- 核心能力：
  - 三阶段流水线：First Opinions（各 LLM 独立回答）→ Review（匿名互评打分）→ Final Response（Chairman 综合）
  - 通过 OpenRouter 统一接入任意 LLM（GPT-5.1、Gemini 3 Pro、Claude Sonnet 4.5、Grok 4 等）
  - 本地 web app（FastAPI + React + Vite）
  - 身份匿名化：互评时 LLM 不知道谁是谁，防止"拍马屁"
- 技术栈：Python 44% + JavaScript 37%，uv + npm
- ⚠️ **使用限制**：需要 OpenRouter API key + 多模型 credits；Karpathy 声明"不维护，仅供灵感"
- **对我的价值**：
  - 架构参考：多模型协作的具体实现方案（匿名互评 + Chairman 综合）
  - 产品设计参考：千星奇域如需"多 Agent 协作出结论"的功能，可参考此三阶段流水线
  - 个人决策辅助：遇到难决策时可仿此模式让多个 AI 辩论

## jobs — AI 职业暴露度评分 + 可视化

- **定位**：LLM 给 342 种美国职业打 0-10 分"数字 AI 暴露度"，交互式 Treemap 可视化
- **1.8k stars / 360 forks**（2026-06-11 GitHub 实测）
- URL: https://github.com/karpathy/jobs ✅ 已核实
- 在线 Demo: https://karpathy.ai/jobs/
- 许可证：未声明
- 核心能力：
  - 数据 pipeline：Playwright 爬取 BLS 数据 → BeautifulSoup 解析 → CSV 结构化 → LLM 打分（Gemini Flash via OpenRouter）→ 前端 Treemap
  - 四层可视化切换：BLS 增长预测 / 薪资中位数 / 学历要求 / AI 暴露度
  - 可自定义评分 prompt（如改为"机器人暴露度""外包风险""气候影响"）
  - `prompt.md` 把所有数据打包为 ~45K tokens 的 LLM 对话文件
- ⚠️ **作者声明**："不是论文、不是严肃经济学出版物"——分数是粗略 LLM 估计，不预测失业
- **对我的价值**：
  - 方法论参考："LLM 给大量实体打分 + 可视化"是通用数据分析 pipeline，可迁移到游戏内容评级、UGC 质量评估等场景
  - OPC 思考素材：AI 暴露度高 ≠ 岗位消失（如软件开发 9/10 分但需求可能增长），修正对"AI 替代"的简单化理解
  - prompt.md 设计：把结构化数据打包为 LLM 友好格式的实践参考

## （已落库）LLM Wiki — Karpathy 的 LLM 维护个人 Wiki 概念

- 已覆盖于：[[50-tools/知识库管理工具.md]]
- Gist 地址: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- 5000+ stars / 5000+ forks

## （已落库）autoresearch — AI 自主研究编排

- 已单独作为 source 深挖：[[40-sources/articles/2026-06-Karpathy-autoresearch自主AI研究架构.md]]
- 86.1k stars，Karpathy 全部仓库中最高

# 场景 → 工具匹配(AI 检索入口)

| 用户场景描述 | 推荐工具 | 推荐理由 |
|---|---|---|
| "想理解训练一个 LLM 到底需要什么" / "和工程师聊训练成本" | **nanochat** | 最简全流程：$48 复现 GPT-2，单旋钮设计易理解 |
| "需要多个 AI 给我不同角度的答案再综合" / "重要决策想让多模型辩论" | **llm-council** | 三阶段流水线（独立答→匿名互评→综合），已有完整实现 |
| "设计多 Agent 协作出结论的产品功能" / "Agent 互评架构" | **llm-council** | 匿名互评 + Chairman 综合的架构可直接参考 |
| "想用 AI 给大量内容/实体打分并可视化" / "数据分析 pipeline" | **jobs** | "爬取→结构化→LLM 打分→Treemap"完整 pipeline 可复用 |
| "AI 对职业的影响" / "哪些工作会被 AI 改变" | **jobs** | 342 种职业 AI 暴露度评分 + 在线交互 Demo |
| "想让 Agent 自主跑实验优化某个模块" | **autoresearch**（→ 详见 source 笔记） | 三文件编排 + 固定预算 + 单指标的自主迭代架构 |
| "想了解 LLM 维护知识库的模式" | **LLM Wiki**（→ 详见知识库管理工具.md） | Karpathy 原始概念 + 开源实现 |

# 关联

- related source: [[40-sources/articles/2026-06-Karpathy-autoresearch自主AI研究架构.md]]（同一文章来源，autoresearch 单独深挖）
- related source: [[40-sources/articles/2026-06-Karpathy-markdown杀死RAG.md]]（Karpathy LLM Wiki 概念的早期来源文章）
- related tools: [[50-tools/知识库管理工具.md]]（LLM Wiki 实现版）
- related insight: [[30-insights/2026-06-OPC护城河与商业模式.md]]（jobs 的 AI 暴露度视角 + autoresearch 的无人值守能力）
