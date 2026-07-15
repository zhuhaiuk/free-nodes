import { mkdir, writeFile } from "node:fs/promises";

const SITE_URL = "https://nodes.zhuhai.uk";
const REPO_FULL_NAME = "zhuhaiuk/free-nodes";
const TARGET_DOMAINS = ["nodes.zhuhai.uk", "github.com/zhuhaiuk/free-nodes"];

const KEYWORDS = [
  "免费节点",
  "免费代理节点",
  "免费节点订阅",
  "每小时更新免费节点",
  "Clash 节点",
  "Mihomo 节点",
  "V2Ray 节点",
  "Trojan 节点",
  "Shadowsocks 节点",
  "Shadowrocket 共享账号",
  "小火箭账号",
  "机场推荐",
  "免费订阅",
  "代理订阅",
  "free nodes",
  "free proxy nodes",
  "free Clash nodes",
  "free V2Ray nodes",
];

const FALLBACK_COMPETITORS = [
  "snakem982/proxypool",
  "Pawdroid/Free-servers",
  "shuaidaoya/FreeNodes",
  "littlebais/free-proxy-nodes",
  "freevpnssr/freevpnssr.github.io",
];

const serpApiKey = process.env.SERPAPI_KEY || "";
const googleHl = process.env.GOOGLE_HL || "zh-cn";
const googleGl = process.env.GOOGLE_GL || "us";
const generatedAt = new Date().toISOString();

function clean(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isOwnResult(link) {
  return TARGET_DOMAINS.some((target) => link.includes(target));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "zhuhai-free-nodes-seo-autopilot",
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function fetchSerp(keyword) {
  if (!serpApiKey) {
    return {
      keyword,
      status: "skipped",
      reason: "SERPAPI_KEY is not configured",
      organicResults: [],
      target: null,
    };
  }

  const params = new URLSearchParams({
    engine: "google",
    q: keyword,
    hl: googleHl,
    gl: googleGl,
    num: "20",
    api_key: serpApiKey,
  });
  const data = await fetchJson(`https://serpapi.com/search.json?${params.toString()}`);
  const organicResults = (data.organic_results || []).slice(0, 20).map((item) => ({
    position: item.position,
    title: item.title || "",
    link: item.link || "",
    domain: domainOf(item.link || ""),
    snippet: item.snippet || "",
  }));
  return {
    keyword,
    status: "ok",
    organicResults,
    target: organicResults.find((item) => isOwnResult(item.link)) || null,
  };
}

function countBy(items) {
  const counts = new Map();
  for (const item of items.filter(Boolean)) counts.set(item, (counts.get(item) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function extractSignals(serps) {
  const competitorResults = serps.flatMap((serp) =>
    serp.organicResults
      .filter((result) => result.link && !isOwnResult(result.link))
      .slice(0, 10)
      .map((result) => ({ keyword: serp.keyword, ...result }))
  );

  const domainCounts = countBy(competitorResults.map((result) => result.domain));
  const titleText = competitorResults.map((result) => `${result.title} ${result.snippet}`).join(" ").toLowerCase();
  const terms = [
    "免费节点",
    "免费订阅",
    "节点订阅",
    "clash",
    "mihomo",
    "v2ray",
    "trojan",
    "shadowsocks",
    "shadowrocket",
    "小火箭",
    "机场",
    "每日更新",
    "每小时更新",
    "free nodes",
    "free proxy",
  ];
  const termCounts = terms
    .map((term) => [term, (titleText.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length])
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return {
    topDomains: domainCounts.slice(0, 20).map(([domain, count]) => ({ domain, count })),
    recurringTerms: termCounts.map(([term, count]) => ({ term, count })),
    competitorResults: competitorResults.slice(0, 60),
  };
}

function opportunityFor(serp) {
  if (serp.status !== "ok") {
    return "等待 SERPAPI_KEY 配置后开始真实 Google 排名分析。";
  }
  if (!serp.target) {
    return "未进入前 20：增强对应专题页标题、FAQ、教程内链和 README 锚文本。";
  }
  if (serp.target.position > 10) {
    return "已进入前 20：补充长尾问答、更新时间信号和订阅入口，以冲进首页。";
  }
  if (serp.target.position > 3) {
    return "已进入前 10：强化差异化表达和外链入口，争取前三。";
  }
  return "已进入前三：保持更新频率，避免大幅改动标题和 canonical。";
}

function markdownTable(rows, columns) {
  const head = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => column.value(row)).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

function renderReport(insights) {
  const keywordRows = insights.serps.map((serp) => ({
    keyword: serp.keyword,
    rank: serp.target ? `#${serp.target.position}` : serp.status === "ok" ? "未进前 20" : "未配置",
    bestUrl: serp.target?.link || "",
    action: opportunityFor(serp),
  }));
  const domainRows = insights.signals.topDomains.slice(0, 12);
  const termRows = insights.signals.recurringTerms.slice(0, 12);

  return `# SEO Autopilot Report

生成时间：${insights.generatedAt}

目标站点：${SITE_URL}  
目标仓库：https://github.com/${REPO_FULL_NAME}

## 关键词排名与动作

${markdownTable(keywordRows, [
  { label: "关键词", value: (row) => clean(row.keyword) },
  { label: "当前排名", value: (row) => clean(row.rank) },
  { label: "匹配页面", value: (row) => clean(row.bestUrl) },
  { label: "自动优化方向", value: (row) => clean(row.action) },
])}

## Google 前排竞品域名

${markdownTable(domainRows, [
  { label: "域名", value: (row) => clean(row.domain) },
  { label: "出现次数", value: (row) => row.count },
])}

## SERP 高频信号

${markdownTable(termRows, [
  { label: "词/主题", value: (row) => clean(row.term) },
  { label: "出现次数", value: (row) => row.count },
])}

## 自动策略

- 所有关键词继续围绕“每小时更新、双订阅格式、教程入口、每日快照、AI 可读摘要”展开。
- 未进入前 20 的关键词优先补专题页内容和 README 内链。
- 已进入前 20 的关键词优先补 FAQ、更新时间、地区/协议统计和教程链接。
- 不复制竞品正文，只学习 SERP 标题意图、页面类型和信息架构。
`;
}

function renderHtml(insights) {
  const topDomains = insights.signals.topDomains.slice(0, 12);
  const terms = insights.signals.recurringTerms.slice(0, 12);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SEO 自动分析 - Zhuhai Free Nodes</title>
  <meta name="description" content="Zhuhai Free Nodes 自动分析免费节点、Clash 节点、V2Ray 节点等关键词的 Google 排名、竞品域名和优化方向。">
  <link rel="canonical" href="${SITE_URL}/seo-insights.html">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; line-height: 1.65; }
    main { max-width: 980px; margin: 0 auto; padding: 40px 20px 64px; }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 4.5vw, 3.4rem); line-height: 1.12; }
    h2 { margin: 34px 0 12px; font-size: 1.3rem; }
    p { color: #586174; }
    a { color: #1268d6; text-decoration: none; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { text-align: left; border-bottom: 1px solid #d9e0ea; padding: 9px 8px; vertical-align: top; }
    .muted { color: #586174; }
  </style>
</head>
<body>
  <main>
    <h1>SEO 自动分析</h1>
    <p>本页由自动化任务生成，用于跟踪免费节点、免费代理节点、Clash 节点、Mihomo 节点、V2Ray 节点等关键词的搜索表现。</p>
    <p class="muted">生成时间：${insights.generatedAt}</p>

    <h2>关键词状态</h2>
    <table>
      <thead><tr><th>关键词</th><th>当前排名</th><th>优化动作</th></tr></thead>
      <tbody>
${insights.serps
  .map(
    (serp) => `        <tr><td>${clean(serp.keyword)}</td><td>${
      serp.target ? `#${serp.target.position}` : serp.status === "ok" ? "未进前 20" : "等待密钥"
    }</td><td>${clean(opportunityFor(serp))}</td></tr>`
  )
  .join("\n")}
      </tbody>
    </table>

    <h2>前排竞品域名</h2>
    <table>
      <thead><tr><th>域名</th><th>出现次数</th></tr></thead>
      <tbody>
${topDomains.map((row) => `        <tr><td>${clean(row.domain)}</td><td>${row.count}</td></tr>`).join("\n")}
      </tbody>
    </table>

    <h2>高频主题信号</h2>
    <table>
      <thead><tr><th>主题</th><th>出现次数</th></tr></thead>
      <tbody>
${terms.map((row) => `        <tr><td>${clean(row.term)}</td><td>${row.count}</td></tr>`).join("\n")}
      </tbody>
    </table>

    <p><a href="./">返回首页</a> · <a href="https://github.com/${REPO_FULL_NAME}">GitHub 仓库</a></p>
  </main>
</body>
</html>
`;
}

const serps = [];
for (const keyword of KEYWORDS) {
  try {
    serps.push(await fetchSerp(keyword));
  } catch (error) {
    serps.push({
      keyword,
      status: "error",
      reason: error.message,
      organicResults: [],
      target: null,
    });
  }
}

const fallbackDomains = FALLBACK_COMPETITORS.map((repo) => ({
  domain: `github.com/${repo}`,
  count: 1,
}));
const signals = extractSignals(serps);
if (!signals.topDomains.length) signals.topDomains = fallbackDomains;

const insights = {
  generatedAt,
  siteUrl: SITE_URL,
  repository: REPO_FULL_NAME,
  google: {
    hl: googleHl,
    gl: googleGl,
    serpApiConfigured: Boolean(serpApiKey),
  },
  keywords: KEYWORDS,
  serps,
  signals,
};

await mkdir("data", { recursive: true });
await mkdir("reports", { recursive: true });
await writeFile("data/seo-serp-insights.json", `${JSON.stringify(insights, null, 2)}\n`);
await writeFile("reports/seo-autopilot-latest.md", renderReport(insights));
await writeFile("seo-insights.html", renderHtml(insights));

console.log(`SEO autopilot analyzed ${KEYWORDS.length} keywords.`);
