import { Buffer } from "node:buffer";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://nodes.zhuhai.uk";
const REPO_URL = "https://github.com/zhuhaiuk/free-nodes";
const RAW_BASE = "https://raw.githubusercontent.com/zhuhaiuk/free-nodes/main";
const TUTORIAL_REPO_URL = "https://github.com/zhuhaiuk/proxy-client-tutorials";

const TUTORIAL_GROUPS = [
  {
    title: "新手入口",
    links: [
      ["代理软件下载地址", "docs/proxy-client-downloads.md"],
      ["更新订阅提示无效的订阅怎么办", "docs/troubleshooting/invalid-subscription.md"],
    ],
  },
  {
    title: "Android 教程",
    links: [
      ["V2rayNG 使用教程", "docs/android/v2rayng.md"],
      ["Clash for Android 使用教程", "docs/android/clash-for-android.md"],
      ["NekoBox for Android 使用教程", "docs/android/nekobox-for-android.md"],
      ["Hiddify for Android 使用教程", "docs/android/hiddify-for-android.md"],
    ],
  },
  {
    title: "Windows 教程",
    links: [
      ["Clash Verge 使用教程", "docs/windows/clash-verge.md"],
      ["V2rayN 使用教程", "docs/windows/v2rayn.md"],
      ["Mihomo Party 使用教程", "docs/windows/mihomo-party-for-windows.md"],
      ["NekoBox for Windows 使用教程", "docs/windows/nekobox-for-windows.md"],
    ],
  },
  {
    title: "iOS 教程",
    links: [
      ["Shadowrocket 小火箭使用教程", "docs/ios/shadowrocket.md"],
      ["Shadowrocket 账号与下载安全提醒", "docs/ios/shadowrocket-account-safety.md"],
    ],
  },
];

function cnDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const pick = (type) => parts.find((part) => part.type === type).value;
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
}

function cnDateLabel(parts) {
  return `${parts.year}年${parts.month}月${parts.day}日`;
}

function dateKey(parts) {
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function decodeNodes(content) {
  try {
    return Buffer.from(content.trim(), "base64").toString("utf8");
  } catch {
    return "";
  }
}

function countBy(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function collectStats(nodesText, clashText) {
  const decodedNodes = decodeNodes(nodesText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const proxyNames = [...clashText.matchAll(/^- name:\s*(.+)$/gm)].map((match) =>
    match[1].replace(/^['"]|['"]$/g, "").trim()
  );
  const countries = proxyNames
    .map((name) => name.split(" - ", 1)[0].trim())
    .filter(Boolean);
  const protocols = decodedNodes
    .map((node) => node.split("://", 1)[0].toUpperCase())
    .filter(Boolean);

  return {
    nodeCount: decodedNodes.length,
    clashCount: proxyNames.length,
    countryCounts: countBy(countries),
    protocolCounts: countBy(protocols),
  };
}

function archiveFile(parts) {
  return `archive/${dateKey(parts)}-free-nodes.html`;
}

function statNumber(value) {
  if (value < 10) return String(value);
  return `${Math.floor(value / 10) * 10}+`;
}

function listItems(entries, formatter) {
  return entries.map((entry) => formatter(entry)).join("\n");
}

function sharedStyles() {
  return `
    :root { color-scheme: light; --ink: #172033; --muted: #586174; --line: #d9e0ea; --brand: #1268d6; --soft: #f4f7fb; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: #fff; line-height: 1.65; }
    main { max-width: 980px; margin: 0 auto; padding: 40px 20px 64px; }
    header { padding: 28px 0 24px; border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 12px; max-width: 900px; font-size: clamp(2rem, 4.5vw, 3.6rem); line-height: 1.12; letter-spacing: 0; overflow-wrap: anywhere; }
    h2 { margin: 36px 0 14px; font-size: 1.35rem; }
    p { margin: 0 0 14px; color: var(--muted); }
    a { color: var(--brand); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; }
    .button { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 1px solid var(--brand); border-radius: 6px; background: var(--brand); color: #fff; font-weight: 650; }
    .button.secondary { background: #fff; color: var(--brand); }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .stat { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
    .stat strong { display: block; font-size: 1.8rem; line-height: 1.1; }
    .stat span { color: var(--muted); font-size: .95rem; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    pre { overflow-x: auto; padding: 14px; border-radius: 8px; background: #0f172a; color: #e6edf7; }
    .lists { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
    .tutorial-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
    .tutorial-card { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .tutorial-card h3 { margin: 0 0 10px; font-size: 1rem; }
    .tutorial-card a { display: block; margin: 7px 0; color: var(--brand); overflow-wrap: anywhere; }
    ul.clean { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    ul.clean li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 14px; border-bottom: 1px solid var(--line); }
    ul.clean li:last-child { border-bottom: 0; }
    footer { margin-top: 42px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: .95rem; }
    @media (max-width: 900px) { .tutorial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 720px) { .stats, .lists, .tutorial-grid { grid-template-columns: 1fr; } main { padding-top: 24px; } }
  `;
}

function tutorialHref(file) {
  return `${TUTORIAL_REPO_URL}/blob/main/${file}`;
}

function tutorialCards() {
  return TUTORIAL_GROUPS.map(
    (group) => `      <section class="tutorial-card">
        <h3>${escapeHtml(group.title)}</h3>
${group.links
  .map(([label, file]) => `        <a href="${tutorialHref(file)}">${escapeHtml(label)}</a>`)
  .join("\n")}
      </section>`
  ).join("\n");
}

function indexHtml(stats, parts) {
  const label = cnDateLabel(parts);
  const archive = archiveFile(parts);
  const topCountries = stats.countryCounts.slice(0, 8);
  const topProtocols = stats.protocolCounts.slice(0, 8);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Zhuhai Free Nodes - 免费节点订阅 | Clash / Mihomo / V2Ray 每小时更新</title>
  <meta name="description" content="Zhuhai Free Nodes 提供每小时自动更新的免费节点订阅，支持 Clash、Mihomo、V2Ray、Trojan、Shadowrocket、sing-box、NekoBox、Hiddify 等客户端，并整理订阅导入教程。">
  <link rel="canonical" href="${SITE_URL}/">
  <meta property="og:title" content="Zhuhai Free Nodes - 免费节点订阅 | Clash / Mihomo / V2Ray 每小时更新">
  <meta property="og:description" content="每小时自动更新的免费代理节点订阅，提供 Base64 和 Clash / Mihomo YAML 固定入口。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/">
  <style>${sharedStyles()}</style>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": "Zhuhai Free Nodes",
    "description": "每小时自动更新的免费节点订阅，支持 Clash、Mihomo、V2Ray、Trojan、Shadowrocket 等客户端，并整理订阅导入教程。",
    "url": "${SITE_URL}/",
    "codeRepository": "${REPO_URL}",
    "dateModified": "${dateKey(parts)}"
  }
  </script>
</head>
<body>
  <main>
    <header>
      <h1>Zhuhai Free Nodes 免费节点订阅</h1>
      <p>每小时自动更新，提供通用 Base64 与 Clash / Mihomo 配置，适合 V2RayN、V2rayNG、Shadowrocket、NekoBox、Hiddify、sing-box 等客户端测试使用。</p>
      <div class="actions">
        <a class="button" href="#base64">Base64 订阅</a>
        <a class="button secondary" href="#clash">Clash / Mihomo 配置</a>
        <a class="button secondary" href="#tutorials">使用教程</a>
        <a class="button secondary" href="#faq">常见问题</a>
      </div>
    </header>

    <section class="stats" aria-label="今日免费节点状态">
      <div class="stat"><strong>${statNumber(stats.nodeCount)}</strong><span>通用订阅节点</span></div>
      <div class="stat"><strong>${statNumber(stats.clashCount)}</strong><span>Clash / Mihomo 节点</span></div>
      <div class="stat"><strong>1h</strong><span>自动更新频率</span></div>
    </section>

    <p>最近更新：${label} ${parts.hour}:${parts.minute}:${parts.second}。免费节点稳定性会随地区和运营商变化，建议导入后先测试延迟和连通性。</p>

    <h2 id="base64">通用 Base64 订阅</h2>
    <pre>${RAW_BASE}/nodes.txt</pre>

    <h2 id="clash">Clash / Mihomo 订阅</h2>
    <pre>${RAW_BASE}/clash_config.yaml</pre>

    <h2 id="tutorials">代理软件使用教程</h2>
    <p>第一次使用免费节点时，可以先看客户端教程：下载软件、导入订阅、更新订阅、测速和排查无效订阅问题。</p>
    <div class="tutorial-grid">
${tutorialCards()}
    </div>

    <div class="lists">
      <section>
        <h2>主要地区</h2>
        <ul class="clean">
${listItems(topCountries, ([country, count]) => `          <li><strong>${escapeHtml(country)}</strong><span>${count} 个节点</span></li>`)}
        </ul>
      </section>
      <section>
        <h2>协议分布</h2>
        <ul class="clean">
${listItems(topProtocols, ([protocol, count]) => `          <li><strong>${escapeHtml(protocol)}</strong><span>${count} 条订阅</span></li>`)}
        </ul>
      </section>
    </div>

    <h2>每日归档</h2>
    <p><a href="${archive}">${label}免费节点订阅快照</a></p>

    <h2 id="faq">常见问题</h2>
    <p><strong>为什么节点会失效？</strong> 免费节点通常稳定性有限，更新订阅并测速后再使用更稳妥。</p>
    <p><strong>Clash Verge、Mihomo Party 用哪个？</strong> 优先使用 Clash / Mihomo 订阅地址。</p>
    <p><strong>V2RayN、V2rayNG、Shadowrocket 用哪个？</strong> 可以优先尝试通用 Base64 订阅地址。</p>

    <footer>
      <p>节点仅供测试与学习研究。请遵守当地法律法规和服务条款。</p>
      <p><a href="${REPO_URL}">GitHub 仓库</a> · <a href="https://zhuhai.uk">zhuhai.uk</a> · <a href="https://t.me/dns68">Telegram</a></p>
    </footer>
  </main>
</body>
</html>
`;
}

function archiveHtml(stats, parts) {
  const label = cnDateLabel(parts);
  const file = archiveFile(parts);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${label}免费节点订阅 - Clash / V2Ray / Mihomo 每小时更新</title>
  <meta name="description" content="${label} Zhuhai Free Nodes 免费节点订阅快照，包含 Clash、Mihomo、V2Ray、Shadowrocket 等客户端可用的订阅入口。">
  <link rel="canonical" href="${SITE_URL}/${file}">
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; line-height: 1.65; }
    main { max-width: 860px; margin: 0 auto; padding: 40px 20px 64px; }
    h1 { margin: 0 0 12px; font-size: clamp(1.8rem, 5vw, 3.2rem); line-height: 1.1; letter-spacing: 0; }
    p { color: #586174; }
    a { color: #1268d6; text-decoration: none; }
    pre { overflow-x: auto; padding: 14px; border-radius: 8px; background: #0f172a; color: #e6edf7; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; border-bottom: 1px solid #d9e0ea; padding: 10px 8px; }
  </style>
</head>
<body>
  <main>
    <h1>${label}免费节点订阅</h1>
    <p>本页是 Zhuhai Free Nodes 的免费节点订阅快照。订阅文件仍会每小时自动更新，导入客户端后请先测试延迟和连通性。</p>
    <table>
      <tbody>
        <tr><th>通用订阅节点</th><td>${stats.nodeCount} 个</td></tr>
        <tr><th>Clash / Mihomo 节点</th><td>${stats.clashCount} 个</td></tr>
        <tr><th>更新时间</th><td>${label} ${parts.hour}:${parts.minute}:${parts.second}</td></tr>
      </tbody>
    </table>
    <h2>通用 Base64 订阅</h2>
    <pre>${RAW_BASE}/nodes.txt</pre>
    <h2>Clash / Mihomo 订阅</h2>
    <pre>${RAW_BASE}/clash_config.yaml</pre>
    <h2>导入订阅教程</h2>
    <p>
      <a href="${tutorialHref("docs/windows/clash-verge.md")}">Clash Verge 使用教程</a> ·
      <a href="${tutorialHref("docs/windows/v2rayn.md")}">V2rayN 使用教程</a> ·
      <a href="${tutorialHref("docs/android/v2rayng.md")}">V2rayNG 使用教程</a> ·
      <a href="${tutorialHref("docs/ios/shadowrocket.md")}">Shadowrocket 小火箭使用教程</a>
    </p>
    <p><a href="../">返回首页</a> · <a href="${REPO_URL}">GitHub 仓库</a></p>
  </main>
</body>
</html>
`;
}

async function sitemapXml(parts) {
  let archives = [];
  try {
    archives = (await readdir("archive"))
      .filter((file) => file.endsWith(".html"))
      .map((file) => `archive/${file}`)
      .sort()
      .reverse();
  } catch {
    archives = [];
  }

  const urls = [
    { loc: `${SITE_URL}/`, freq: "hourly", priority: "1.0" },
    ...archives.map((file) => ({ loc: `${SITE_URL}/${file}`, freq: "daily", priority: "0.8" })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${dateKey(parts)}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function updateReadme(readme, parts) {
  const label = cnDateLabel(parts);
  const absoluteArchiveUrl = `${SITE_URL}/${archiveFile(parts)}`;
  const section = `## GitHub Pages 与每日归档

如果 GitHub Pages 已开启，可以访问项目页面：

- 项目首页：[${SITE_URL}/](${SITE_URL}/)
- 站点地图：[${SITE_URL}/sitemap.xml](${SITE_URL}/sitemap.xml)
- 每日快照：[${label}免费节点订阅](${absoluteArchiveUrl})

这些页面用于帮助搜索引擎理解本仓库主题、更新时间和固定订阅入口。

## 代理软件使用教程

如果你不知道订阅链接应该填在哪里，可以查看配套教程仓库：

- 教程仓库：[zhuhaiuk/proxy-client-tutorials](${TUTORIAL_REPO_URL})
- 软件下载：[代理软件下载地址](${tutorialHref("docs/proxy-client-downloads.md")})
- 常见问题：[更新订阅提示无效的订阅怎么办](${tutorialHref("docs/troubleshooting/invalid-subscription.md")})
- Android：[V2rayNG 使用教程](${tutorialHref("docs/android/v2rayng.md")})、[Clash for Android 使用教程](${tutorialHref("docs/android/clash-for-android.md")})
- Windows：[Clash Verge 使用教程](${tutorialHref("docs/windows/clash-verge.md")})、[V2rayN 使用教程](${tutorialHref("docs/windows/v2rayn.md")})
- iOS：[Shadowrocket 小火箭使用教程](${tutorialHref("docs/ios/shadowrocket.md")})
`;

  return readme.replace(/## GitHub Pages 与每日归档[\s\S]*?(?=\n## 项目简介)/, section);
}

const parts = cnDateParts();
const [nodesText, clashText, readme] = await Promise.all([
  readFile("nodes.txt", "utf8"),
  readFile("clash_config.yaml", "utf8"),
  readFile("README.md", "utf8"),
]);
const stats = collectStats(nodesText, clashText);
const todayArchive = archiveFile(parts);

await mkdir(path.dirname(todayArchive), { recursive: true });
await writeFile("index.html", indexHtml(stats, parts));
await writeFile(todayArchive, archiveHtml(stats, parts));
await writeFile("sitemap.xml", await sitemapXml(parts));
await writeFile("robots.txt", robotsTxt());
await writeFile("README.md", updateReadme(readme, parts));

console.log(`Updated SEO pages for ${dateKey(parts)} with ${stats.nodeCount} nodes.`);
