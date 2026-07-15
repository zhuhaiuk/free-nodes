import { mkdir, writeFile } from "node:fs/promises";

const SITE_URL = "https://nodes.zhuhai.uk";
const REPO_FULL_NAME = "zhuhaiuk/free-nodes";
const TARGET_DOMAINS = ["nodes.zhuhai.uk", "github.com/zhuhaiuk/free-nodes"];

const DEFAULT_KEYWORDS = [
  "免费节点",
  "免费代理节点",
  "免费节点订阅",
  "每小时更新免费节点",
  "Clash 节点",
  "Mihomo 节点",
  "V2Ray 节点",
  "Shadowrocket 共享账号",
  "free nodes",
  "free proxy nodes",
  "free Clash nodes",
  "free V2Ray nodes",
];

const COMPETITORS = [
  "snakem982/proxypool",
  "Pawdroid/Free-servers",
  "shuaidaoya/FreeNodes",
  "littlebais/free-proxy-nodes",
  "freevpnssr/freevpnssr.github.io",
];

const startedAt = new Date();
const serpApiKey = process.env.SERPAPI_KEY || "";
const githubToken = process.env.GITHUB_TOKEN || "";
const googleHl = process.env.GOOGLE_HL || "zh-cn";
const googleGl = process.env.GOOGLE_GL || "us";
const keywords = (process.env.SEO_KEYWORDS || DEFAULT_KEYWORDS.join("|"))
  .split("|")
  .map((keyword) => keyword.trim())
  .filter(Boolean);

function headers() {
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "zhuhai-free-nodes-seo-monitor",
    ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  return response.json();
}

async function fetchRepo(fullName) {
  const repo = await fetchJson(`https://api.github.com/repos/${fullName}`, { headers: headers() });
  return {
    fullName,
    url: repo.html_url,
    description: repo.description || "",
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.subscribers_count,
    openIssues: repo.open_issues_count,
    defaultBranch: repo.default_branch,
    pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at,
  };
}

function findTargetResult(organicResults = []) {
  for (const result of organicResults) {
    const link = result.link || "";
    if (TARGET_DOMAINS.some((target) => link.includes(target))) {
      return {
        position: result.position,
        title: result.title || "",
        link,
        snippet: result.snippet || "",
      };
    }
  }
  return null;
}

async function fetchGoogleRank(keyword) {
  if (!serpApiKey) {
    return {
      keyword,
      status: "skipped",
      reason: "SERPAPI_KEY is not configured",
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
  const target = findTargetResult(data.organic_results || []);
  return {
    keyword,
    status: "ok",
    target,
    topResults: (data.organic_results || []).slice(0, 5).map((item) => ({
      position: item.position,
      title: item.title || "",
      link: item.link || "",
    })),
  };
}

function markdownTable(rows, columns) {
  const head = `| ${columns.map((column) => column.label).join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${columns.map((column) => column.value(row)).join(" | ")} |`);
  return [head, sep, ...body].join("\n");
}

function clean(value) {
  return String(value ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function renderMarkdown(report) {
  const rankRows = report.googleRanks.map((row) => ({
    keyword: row.keyword,
    status: row.status === "ok" ? (row.target ? `#${row.target.position}` : "未进入前 20") : "未配置",
    link: row.target ? row.target.link : row.reason || "",
  }));

  const competitorRows = report.repositories.map((repo) => ({
    repo: `[${repo.fullName}](${repo.url})`,
    stars: repo.stars,
    forks: repo.forks,
    pushedAt: repo.pushedAt,
    description: repo.description,
  }));

  return `# SEO Ranking Report

生成时间：${report.generatedAt}

站点：${SITE_URL}  
仓库：https://github.com/${REPO_FULL_NAME}

## Google 关键词排名

${markdownTable(rankRows, [
  { label: "关键词", value: (row) => clean(row.keyword) },
  { label: "当前结果", value: (row) => clean(row.status) },
  { label: "匹配链接", value: (row) => clean(row.link) },
])}

> 如需启用 Google 排名查询，请在 GitHub Secrets 中配置 \`SERPAPI_KEY\`。可选环境变量：\`GOOGLE_GL\`、\`GOOGLE_HL\`、\`SEO_KEYWORDS\`。

## GitHub 竞品对比

${markdownTable(competitorRows, [
  { label: "项目", value: (row) => row.repo },
  { label: "Stars", value: (row) => row.stars },
  { label: "Forks", value: (row) => row.forks },
  { label: "最近推送", value: (row) => clean(row.pushedAt) },
  { label: "描述", value: (row) => clean(row.description) },
])}

## 下次优化方向

- 优先补强已经进入前 20 但没有进前 5 的关键词页面。
- 对长期未进入前 20 的关键词，增加教程型内容和内部链接。
- 观察竞品的更新频率、标题描述和订阅入口表达，持续强化本项目的“每小时更新 + 双格式订阅 + 教程入口 + 每日归档”差异化。
`;
}

const repositories = await Promise.all([REPO_FULL_NAME, ...COMPETITORS].map(fetchRepo));
const googleRanks = [];
for (const keyword of keywords) {
  try {
    googleRanks.push(await fetchGoogleRank(keyword));
  } catch (error) {
    googleRanks.push({
      keyword,
      status: "error",
      reason: error.message,
      target: null,
    });
  }
}

const report = {
  generatedAt: startedAt.toISOString(),
  siteUrl: SITE_URL,
  repository: REPO_FULL_NAME,
  google: {
    hl: googleHl,
    gl: googleGl,
    serpApiConfigured: Boolean(serpApiKey),
  },
  googleRanks,
  repositories,
};

await mkdir("reports", { recursive: true });
await writeFile("reports/seo-ranking-latest.json", `${JSON.stringify(report, null, 2)}\n`);
await writeFile("reports/seo-ranking-latest.md", renderMarkdown(report));

console.log(`Wrote SEO ranking report for ${keywords.length} keywords and ${repositories.length} repositories.`);
