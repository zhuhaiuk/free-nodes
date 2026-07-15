# SEO / GEO 自动优化说明

本项目包含三套自动化：

1. `Update SEO pages`：每小时生成首页、每日快照、关键词专题页、竞品页、`sitemap.xml`、`robots.txt` 和 `llms.txt`。
2. `SEO ranking monitor`：每周生成 `reports/seo-ranking-latest.md` 和 `reports/seo-ranking-latest.json`，用于观察 Google 关键词排名和 GitHub 竞品数据。
3. `SEO autopilot`：每天自动分析 Google 前排竞品、生成 `data/seo-serp-insights.json`、`reports/seo-autopilot-latest.md` 和 `seo-insights.html`，再重新生成 SEO 页面。

## 关键词

当前覆盖关键词：

- 免费节点
- 免费代理节点
- 免费节点订阅
- 每小时更新免费节点
- Clash 节点
- Mihomo 节点
- V2Ray 节点
- Trojan 节点
- Shadowsocks 节点
- Shadowrocket 共享账号
- 小火箭账号
- 机场推荐
- 免费订阅
- 代理订阅
- free nodes
- free proxy nodes
- free Clash nodes
- free V2Ray nodes

## Google 排名密钥

不要把密钥写进代码，也不要提交到仓库。

如需启用 Google 排名监控：

1. 注册 SerpApi 并生成 API Key。
2. 打开 GitHub 仓库 `Settings` -> `Secrets and variables` -> `Actions`。
3. 新增 Repository secret：`SERPAPI_KEY`。
4. 手动运行 `SEO ranking monitor` 工作流验证报告是否生成。

没有 `SERPAPI_KEY` 时，工作流仍会生成保底竞品对比；Google 排名会标记为未配置。配置后，`SEO autopilot` 会按关键词读取 Google 前 20 个自然结果，识别你的项目是否出现、前排竞品域名和 SERP 高频主题。

## 优化节奏

- 每小时：刷新节点数据、首页、每日快照和 sitemap。
- 每天：运行 `SEO autopilot`，分析 Google 前排同行并刷新洞察页。
- 每周：生成排名与竞品报告。
- 每月：根据报告补充关键词专题页、教程页和内部链接。

## 竞品跟踪

当前跟踪：

- `snakem982/proxypool`
- `Pawdroid/Free-servers`
- `shuaidaoya/FreeNodes`
- `littlebais/free-proxy-nodes`
- `freevpnssr/freevpnssr.github.io`

核心差异化建议保持不变：每小时更新、Base64 与 Clash / Mihomo 双格式、教程入口、每日快照、AI 可读摘要和可追踪排名报告。
