# 我的知识库

## 这是什么

个人知识库,存我看过的、想过的、要查的内容。
数据格式: Markdown + YAML frontmatter。工具可换,数据不动。

## 工具组合

- **主力**: 扣子(Coze) - 上传 .md 当知识库 bot,日常问答
- **辅助**: Obsidian(移动端 + 看图谱)、Claude Code(深度盘点)
- **同步**: OneDrive 自动同步整个 `D:\ClaudeProject\zhishiku\`(待配置)

## 怎么用

### 存东西

1. 看 [60-meta/filter-checklist.md](60-meta/filter-checklist.md) 决定要不要存
2. 选对应模板:
   - 我的思考 → [insight 模板](60-meta/templates/insight.md) → `30-insights/`
   - 别人的文章 → [source 模板](60-meta/templates/source.md) → `40-sources/articles/`
   - AI 对话产出 → [dialogue 模板](60-meta/templates/dialogue.md) → `40-sources/dialogues/`
   - 工具/资源 → [tools 模板](60-meta/templates/tools.md) → `50-tools/`
3. 文件名: `YYYY-MM-中文关键词.md`
4. tag 必须从 [60-meta/tag-schema.md](60-meta/tag-schema.md) 选

### 查东西

- **日常问答**: 扣子知识库 bot
- **移动端查看**: Obsidian Mobile + OneDrive 同步
- **深度盘点**: 月底用 Claude Code(`cd D:\ClaudeProject\zhishiku\` 后对话)

### 维护

- **每周日**: 清空 00-inbox(决定每条:归档 / 入库 / 弃)
- **每月底**: 选 1-2 个高价值话题做 topic 盘点(放 20-topics/)
- **每季度**: 审视 10-domain/ 是否需要重组,tag 字典是否要精简

## 目录速览

| 目录 | 放什么 | 频率 |
|---|---|---|
| 00-inbox | 没整理的临时素材 | 经常 |
| 10-domain | 领域知识沉淀 | 偶尔 |
| 20-topics | 月度/季度专题 | 月一 |
| 30-insights | 我的思考结论 | 经常 |
| 40-sources | 外部原始素材 | 经常 |
| 50-tools | 工具索引 | 偶尔 |
| 60-meta | 模板和规则 | 极少 |
| 99-archive | 存档不动 | – |

## 关键规则速查

- 每条笔记必须有 frontmatter(模板见 60-meta/templates/)
- tag 必须在词典里,新词先记 tag-schema.md 底部"待审视"区
- 文件名用中文,不用拼音(扣子搜中文更准)
- 类型不清楚 → 看 [CLAUDE.md](CLAUDE.md) 的 type 定义

## 当前阶段:过往筛选

- 起始日期: 2026-06-04
- 时间盒: 4 周内完成,每周 ≤ 5 小时
- 截止日期: 2026-07-02 之后未筛完的进 99-archive/untouched/
- 双轨并行: 一边筛过去,一边对新内容用日常流程
