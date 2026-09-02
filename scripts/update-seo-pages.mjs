import { Buffer } from "node:buffer";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://nodes.zhuhai.uk";
const REPO_URL = "https://github.com/zhuhaiuk/free-nodes";
const RAW_BASE = "https://raw.githubusercontent.com/zhuhaiuk/free-nodes/main";
const TUTORIAL_REPO_URL = "https://github.com/zhuhaiuk/proxy-client-tutorials";
const SHADOWROCKET_ACCOUNT_URL = "https://zhuhai.uk/id";
const TELEGRAM_PREMIUM_URL = `${SITE_URL}/topics/telegram-premium.html`;
const TELEGRAM_PREMIUM_CONTACT_URL = "https://t.me/dns68?direct";
const TELEGRAM_PREMIUM_LOGS_URL = "https://t.me/pmlogs";

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

const COMPETITORS = [
  {
    name: "snakem982/proxypool",
    url: "https://github.com/snakem982/proxypool",
    angle: "代理池与订阅聚合",
  },
  {
    name: "Pawdroid/Free-servers",
    url: "https://github.com/Pawdroid/Free-servers",
    angle: "免费服务器订阅",
  },
  {
    name: "shuaidaoya/FreeNodes",
    url: "https://github.com/shuaidaoya/FreeNodes",
    angle: "免费节点列表",
  },
  {
    name: "freevpnssr/freevpnssr.github.io",
    url: "https://github.com/freevpnssr/freevpnssr.github.io",
    angle: "独立站免费订阅",
  },
];

const TOPIC_PAGES = [
  {
    slug: "free-nodes",
    title: "免费节点订阅使用指南：导入、更新与测试",
    h1: "免费节点订阅使用指南：导入、更新与测试",
    description:
      "免费节点订阅怎么用？本指南说明 Base64 与 Clash / Mihomo YAML 的导入、更新和连通性测试步骤，适合临时测试与客户端学习。",
    keywords: ["免费节点订阅使用指南", "免费节点怎么用", "免费节点订阅教程", "Clash 订阅导入", "V2Ray 订阅导入", "free nodes"],
    body:
      "本页承接“免费节点怎么用”的信息型需求；固定订阅入口在首页。公开节点适合验证代理客户端是否配置正确和临时备用，导入后请刷新订阅、测速并检查连通性，再选择延迟较低的线路。",
    intent: "学习如何在客户端导入、更新、测速和排查免费节点订阅，而不是寻找新的订阅地址。",
    bestFor: ["代理客户端新手测试", "订阅格式验证", "订阅更新与连通性排查", "临时备用连接"],
    importSteps: [
      "复制 Base64 通用订阅地址。",
      "在 V2RayN、v2rayNG、NekoBox 或 Hiddify 中新增远程订阅。",
      "更新订阅后先测速，优先选择延迟较低且能连通的节点。",
    ],
    safetyTips: [
      "免费节点公开可见，不建议登录重要账号或传输敏感数据。",
      "节点速度和可用性会变化，遇到不可用时先刷新订阅。",
    ],
    faq: [
      ["免费节点订阅多久更新一次？", "订阅文件按自动任务持续更新，页面会保留固定入口，方便客户端长期使用。"],
      ["Base64 和 Clash / Mihomo YAML 订阅该怎么选？", "v2rayN、v2rayNG、NekoBox、Hiddify 等通常优先使用 Base64 通用订阅；Clash、Mihomo、Clash Verge 和 Mihomo Party 优先使用 YAML。导入后以客户端的实际兼容性为准。"],
      ["免费节点适合长期使用吗？", "更适合临时测试、备用连接和学习客户端配置，不建议作为重要网络环境的唯一选择。"],
    ],
  },
  {
    slug: "free-proxy-nodes",
    title: "免费代理节点订阅链接",
    h1: "免费代理节点订阅链接与导入说明",
    description:
      "免费代理节点订阅链接：提供通用 Base64 与 Clash / Mihomo YAML 固定入口，适合导入、更新、测速和公开节点格式验证。",
    keywords: ["免费代理节点", "免费代理节点订阅", "代理订阅", "free proxy nodes", "Clash 代理订阅", "V2Ray 订阅"],
    body:
      "本项目将公开来源中的代理节点整理为固定订阅文件，提供通用 Base64 与 Clash / Mihomo YAML 两种导入格式。免费代理节点不保证长期稳定，更适合测试、备用和订阅格式验证。",
    intent: "寻找免费代理节点订阅链接，并按客户端导入、更新和检查公开节点。",
    bestFor: ["代理订阅格式测试", "Base64 与 YAML 导入检查", "备用代理订阅", "客户端兼容性检查"],
    importSteps: [
      "优先选择客户端支持的订阅格式。",
      "Clash / Mihomo 客户端使用 YAML 地址，V2Ray 生态客户端优先尝试 Base64 地址。",
      "导入后通过测速、延迟和实际连通性筛选可用节点。",
    ],
    safetyTips: [
      "公开代理节点来源复杂，重要账号请使用可信网络环境。",
      "如果客户端提示格式错误，可以切换另一种订阅格式测试。",
    ],
    faq: [
      ["免费代理节点包含哪些协议？", "公开来源和订阅内容会变化，请在客户端导入后检查实际协议与可用性；页面提供的是固定订阅入口，不承诺某一种协议始终存在。"],
      ["代理订阅和免费节点订阅有什么区别？", "代理订阅更强调协议和客户端导入方式，免费节点订阅更强调公开节点资源本身。"],
    ],
  },
  {
    slug: "clash-mihomo-nodes",
    title: "Clash / Mihomo 节点",
    h1: "Clash 节点与 Mihomo 节点 YAML 订阅",
    description:
      "提供 Clash、Clash Meta、Mihomo、Stash 等客户端可用的 YAML 订阅链接，并按地区整理节点名称。",
    keywords: ["Clash 节点", "Mihomo 节点", "free Clash nodes", "Clash Meta", "Stash"],
    body:
      "Clash / Mihomo 用户可以直接导入 YAML 订阅。节点名称会统一成国家或地区代码，便于在规则模式、全局模式和测速页面里快速识别线路。",
    intent: "寻找 Clash、Mihomo、Clash Meta、Stash 可直接导入的 YAML 节点订阅。",
    bestFor: ["Clash Verge", "Mihomo Party", "Clash Meta", "Stash", "规则模式测试"],
    importSteps: [
      "复制 Clash / Mihomo YAML 订阅地址。",
      "在客户端中新建订阅配置或配置文件订阅。",
      "更新订阅后进入代理列表测速，再切换规则模式或全局模式测试。",
    ],
    safetyTips: [
      "Clash / Mihomo 配置适合规则分流测试，节点不可用时先更新订阅。",
      "不同客户端内核版本不同，遇到解析失败可以升级客户端或改用通用订阅。",
    ],
    faq: [
      ["Clash 和 Mihomo 可以用同一个订阅吗？", "多数情况下可以。Mihomo 是 Clash Meta 后续生态，通常兼容 YAML 配置。"],
      ["Clash 节点导入后为什么不能用？", "常见原因是节点已失效、网络环境不通、客户端版本过旧或规则模式配置不完整。"],
    ],
  },
  {
    slug: "v2ray-nodes",
    title: "免费 V2Ray 节点订阅链接",
    h1: "免费 V2Ray 节点订阅链接与 Base64 导入",
    description:
      "免费 V2Ray 节点订阅链接：提供通用 Base64 固定入口，供 v2rayN、v2rayNG、NekoBox、Hiddify 等客户端导入、更新和测试。",
    keywords: ["免费 V2Ray 节点", "免费 V2Ray 订阅链接", "V2Ray 节点订阅", "V2Ray 订阅链接 免费", "free V2Ray nodes", "V2RayN", "V2rayNG", "NekoBox", "Hiddify"],
    body:
      "免费 V2Ray 节点订阅链接通常以 Base64 格式提供，适合 V2Ray 生态客户端直接添加为远程订阅。复制固定链接、在客户端更新订阅后再测速；不同客户端对协议支持略有差异，遇到不可用节点时可更新订阅或切换到 Clash / Mihomo 配置测试。",
    intent: "寻找可复制的免费 V2Ray 订阅链接，并在 V2RayN、v2rayNG、NekoBox 或 Hiddify 中完成导入和测试。",
    bestFor: ["V2RayN", "v2rayNG", "NekoBox", "Hiddify", "通用 Base64 订阅测试"],
    importSteps: [
      "复制 Base64 通用订阅地址。",
      "在 V2RayN、v2rayNG、NekoBox 或 Hiddify 中选择订阅导入。",
      "更新订阅后检查协议支持情况，再进行测速和连通性测试。",
    ],
    safetyTips: [
      "V2Ray 生态客户端对协议支持不同，少量节点无法识别属于正常情况。",
      "如果订阅为空或导入失败，可以等待下一轮更新后再试。",
    ],
    faq: [
      ["免费 V2Ray 订阅链接怎么用？", "复制本页的 Base64 通用订阅地址，在客户端新增远程订阅并更新；导入完成后先测速和检查连通性。"],
      ["2026 年免费 V2Ray 订阅怎么确认是否更新？", "查看本页的最近生成日期，并在客户端执行更新订阅。公开节点的可用性会变化，更新后仍应测速和检查连通性，不应把页面日期视为可用性保证。"],
      ["V2RayN 和 v2rayNG 应该用哪个订阅？", "优先使用 Base64 通用订阅；如果客户端支持 Clash 配置，也可以测试 YAML 订阅。"],
      ["V2Ray 节点订阅链接在哪里？", "本页提供固定的 Base64 订阅链接；复制后在客户端新增远程订阅，再更新并测速即可。"],
      ["为什么有些 V2Ray 节点显示超时？", "免费节点可能已经失效，或当前网络到该节点线路质量较差，建议刷新订阅并重新测速。"],
    ],
  },
  {
    slug: "shadowrocket-account",
    title: "Shadowrocket 小火箭账号",
    h1: "Shadowrocket 小火箭账号与免费节点入口",
    description:
      "为 iOS 用户整理 Shadowrocket、小火箭共享账号入口和免费节点订阅说明，帮助新手完成下载、导入和测试。",
    keywords: ["Shadowrocket 共享账号", "小火箭账号", "Shadowrocket 免费账号", "小火箭共享账号"],
    accountUrl: SHADOWROCKET_ACCOUNT_URL,
    body:
      "iOS 用户如果需要 Shadowrocket 相关资源，可以先访问小火箭账号入口。共享账号可能随时失效，导入节点前也建议先确认客户端来源和账号安全。",
    intent: "寻找 Shadowrocket 小火箭账号入口、下载提醒和 iOS 免费节点导入说明。",
    bestFor: ["iOS 用户", "Shadowrocket 下载", "小火箭共享账号", "Shadowrocket 节点订阅测试"],
    importSteps: [
      "先访问小火箭账号入口，确认账号和下载说明。",
      "安装客户端后复制 Base64 或 Clash / Mihomo 订阅地址。",
      "在 Shadowrocket 中添加订阅并更新节点，测试可用后再连接。",
    ],
    safetyTips: [
      "共享账号可能随时失效，请不要在共享账号中保存个人隐私信息。",
      "下载客户端时注意来源，避免安装来路不明的仿冒应用。",
    ],
    faq: [
      ["小火箭账号入口在哪里？", `入口是 ${SHADOWROCKET_ACCOUNT_URL}，账号状态可能变化，请以页面实时内容为准。`],
      ["Shadowrocket 可以导入免费节点吗？", "可以尝试导入通用订阅，导入后建议先更新、测速，再选择可用节点。"],
    ],
  },
];

const SERVICE_PAGES = [
  {
    slug: "telegram-premium",
    title: "Telegram Premium 会员赠送",
    url: TELEGRAM_PREMIUM_URL,
    description:
      "通过 Fragment 官方渠道赠送 Telegram Premium 会员，不需要登录对方账号，只需提供 Telegram username，支持 3 个月、6 个月和 12 个月。",
  },
];

const AIRPORT_REVIEWS = [
  {
    slug: "feituyun",
    name: "飞兔云机场",
    title: "飞兔云机场测评：AnyTLS 与 Shadowsocks、69 个节点、流媒体解锁",
    description:
      "飞兔云机场测评，整理 AnyTLS、Shadowsocks 协议、69 个节点、套餐价格、延迟测速、流媒体和 ChatGPT 解锁表现。",
    url: "https://xn--9kq89d4y0g.com/#/register?code=YvP5BrR2",
    highlights: ["AnyTLS / Shadowsocks", "69 个节点", "覆盖常用地区", "包含流媒体解锁观察", "适合短周期测试"],
    metrics: [
      ["协议类型", "AnyTLS、Shadowsocks"],
      ["节点总数", "69 个"],
      ["测试重点", "延迟、测速、流媒体、ChatGPT"],
      ["适合方向", "日常浏览、视频平台、AI 工具可用性测试"],
      ["购买建议", "先月付测试"],
    ],
    bestFor: ["想测试 AnyTLS 或 Shadowsocks 的用户", "关注节点数量和地区覆盖的用户", "需要观察流媒体与 ChatGPT 可用性的用户"],
    cautions: ["节点数量不等于稳定性，仍要看晚高峰速度和丢包。", "解锁结果会变化，购买后应以自己常用节点实测为准。"],
  },
  {
    slug: "taoqitu",
    name: "淘气兔机场",
    title: "淘气兔机场测评：AnyTLS 与 Shadowsocks、52 个节点、6 个地区",
    description:
      "淘气兔机场测评，整理 AnyTLS、Shadowsocks 协议、52 个节点、6 个国家地区、套餐价格、延迟测速、流媒体和 ChatGPT 解锁表现。",
    url: "https://vip.xn--h5qy56dzhb.vip/#/register?code=cHnAfkST",
    highlights: ["AnyTLS / Shadowsocks", "52 个节点", "覆盖 6 个国家和地区", "低价月付", "流媒体与 ChatGPT 测试"],
    metrics: [
      ["协议类型", "AnyTLS、Shadowsocks"],
      ["节点总数", "52 个"],
      ["覆盖地区", "香港、新加坡、日本、美国、萨摩亚、台湾"],
      ["套餐观察", "低价月付与长期套餐并存"],
      ["测试重点", "延迟、测速、流媒体、ChatGPT"],
    ],
    bestFor: ["想用低价月付先试的用户", "常用香港、新加坡、日本、美国节点的用户", "关注 Shadowrocket、Clash、Mihomo 导入体验的用户"],
    cautions: ["长期套餐前建议先验证自己常用地区的速度。", "如套餐页标注不退款，应先用月付降低试错成本。"],
  },
];

const TELEGRAM_PREMIUM_OFFERS = [
  {
    duration: "3 个月",
    price: "99 元",
    note: "适合短期体验 Telegram Premium 功能。",
  },
  {
    duration: "6 个月",
    price: "139 元",
    note: "更适合稳定使用，单月成本更低。",
    featured: true,
  },
  {
    duration: "12 个月",
    price: "249 元",
    note: "适合长期使用，一次处理后更省心。",
  },
];

const TELEGRAM_PREMIUM_KEYWORDS = [
  "Telegram Premium",
  "Telegram 大会员",
  "Telegram 会员赠送",
  "Telegram Premium 代开",
  "Fragment Telegram Premium",
  "Telegram Premium 3个月",
  "Telegram Premium 6个月",
  "Telegram Premium 12个月",
  "TG会员",
  "TG大会员",
];

const TRUST_POINTS = [
  {
    title: "更新机制",
    body: "订阅文件由自动任务持续生成，页面保留固定入口，用户不需要频繁更换订阅地址。",
  },
  {
    title: "使用边界",
    body: "免费节点用于临时测试、备用连接和客户端学习，不建议承载重要账号、支付或敏感数据。",
  },
  {
    title: "内容质量",
    body: "专题页围绕真实搜索意图补充导入步骤、适用客户端、FAQ 和安全提醒，避免只堆关键词。",
  },
];

const HOMEPAGE_FAQ = [
  ["免费节点订阅多久更新一次？", "订阅文件由自动任务每小时更新，固定订阅链接无需频繁更换；导入后仍应先测速和检查连通性。"],
  ["V2Ray 和 Clash 订阅链接在哪里？", "首页提供 V2Ray 生态客户端可用的 Base64 通用订阅链接，以及 Clash / Mihomo 可用的 YAML 订阅链接；复制后在客户端新增远程订阅并更新。"],
  ["V2Ray 节点订阅怎么导入？", "复制 Base64 通用订阅地址，在 V2RayN、v2rayNG、NekoBox 或 Hiddify 中新增远程订阅，更新后再测速。"],
  ["Clash 或 Mihomo 应该用哪个订阅？", "Clash、Mihomo、Clash Verge 和 Mihomo Party 优先使用 YAML 订阅地址；导入后先更新配置并测试节点。"],
  ["free nodes 是什么？", "free nodes 指公开可用的免费代理节点。本项目提供固定订阅入口，适合客户端学习、临时测试和备用连接，不保证长期稳定性。"],
];

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
      ["V2RayN 使用教程", "docs/windows/v2rayn.md"],
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

function topicFile(topic) {
  return `topics/${topic.slug}.html`;
}

function reviewFile(review) {
  return `reviews/${review.slug}.html`;
}

function reviewHref(review) {
  return `${SITE_URL}/${reviewFile(review)}`;
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
    :root { color-scheme: light; --ink: #172033; --muted: #586174; --line: #d9e0ea; --brand: #1268d6; --soft: #f4f7fb; --ok: #137a4b; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: #fff; line-height: 1.65; }
    main { max-width: 980px; margin: 0 auto; padding: 40px 20px 64px; }
    header { padding: 28px 0 24px; border-bottom: 1px solid var(--line); }
    h1 { margin: 0 0 12px; max-width: 900px; font-size: clamp(2rem, 4.5vw, 3.6rem); line-height: 1.12; letter-spacing: 0; overflow-wrap: anywhere; }
    h2 { margin: 36px 0 14px; font-size: 1.35rem; }
    h3 { margin: 0 0 10px; font-size: 1rem; }
    p { margin: 0 0 14px; color: var(--muted); }
    a { color: var(--brand); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 22px; min-width: 0; }
    .button { display: inline-flex; align-items: center; min-height: 44px; max-width: 100%; padding: 0 16px; border: 1px solid var(--brand); border-radius: 6px; background: var(--brand); color: #fff; font-weight: 650; text-align: center; white-space: normal; overflow-wrap: anywhere; }
    .button.secondary { background: #fff; color: var(--brand); }
    .button.telegram { border-color: #2aabee; background: #2aabee; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 24px 0; }
    .stat, .panel { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
    .stat strong { display: block; font-size: 1.8rem; line-height: 1.1; }
    .stat span { color: var(--muted); font-size: .95rem; }
    code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    pre { overflow-x: auto; padding: 14px; border-radius: 8px; background: #0f172a; color: #e6edf7; }
    .lists, .topic-grid, .competitor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
    .tutorial-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
    .tutorial-card, .topic-card, .competitor-card { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .tutorial-card a, .topic-card a { display: block; margin: 7px 0; color: var(--brand); overflow-wrap: anywhere; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tag { border: 1px solid var(--line); border-radius: 999px; padding: 3px 9px; color: var(--muted); font-size: .9rem; }
    .intent { color: var(--ink); font-weight: 650; }
    .note { padding: 14px 16px; border-left: 4px solid var(--brand); background: var(--soft); border-radius: 6px; }
    .trust-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
    .trust-item { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .trust-item h3 { margin-bottom: 6px; }
    .step-list { counter-reset: steps; list-style: none; padding: 0; margin: 12px 0; }
    .step-list li { counter-increment: steps; display: grid; grid-template-columns: 30px 1fr; gap: 10px; align-items: start; padding: 9px 0; border-bottom: 1px solid var(--line); }
    .step-list li::before { content: counter(steps); display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: 999px; background: var(--brand); color: #fff; font-size: .85rem; font-weight: 700; }
    .faq-list { display: grid; gap: 12px; margin-top: 12px; }
    .faq-item { padding: 14px; border: 1px solid var(--line); border-radius: 8px; background: var(--soft); }
    .faq-item strong { display: block; margin-bottom: 4px; color: var(--ink); }
    .service-callout { margin: 32px 0 6px; padding: 18px; border: 1px solid #b8e4f8; border-radius: 8px; background: linear-gradient(135deg, #f3fbff 0%, #f4fff9 100%); }
    .service-callout h2 { margin-top: 0; }
    .service-callout p:last-child { margin-bottom: 0; }
    .service-hero { margin-top: 24px; padding: 22px; border: 1px solid #b8e4f8; border-radius: 8px; background: linear-gradient(135deg, #eef9ff 0%, #f7fffb 100%); box-shadow: 0 14px 40px rgba(23, 32, 51, .08); }
    .service-eyebrow { margin: 0 0 8px; color: #0b7db4; font-weight: 750; }
    .premium-visual { display: grid; grid-template-columns: 74px 1fr; gap: 16px; align-items: center; margin: 20px 0; padding: 16px; border: 1px solid #d9e0ea; border-radius: 8px; background: #fff; }
    .gift-mark { display: grid; place-items: center; width: 74px; height: 74px; border-radius: 8px; color: #fff; background: linear-gradient(145deg, #2aabee, #10b981); box-shadow: inset 0 1px 0 rgba(255,255,255,.35); }
    .gift-mark svg { width: 42px; height: 42px; }
    .pricing-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
    .pricing-card { padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .pricing-card.featured { border-color: #2aabee; box-shadow: 0 10px 28px rgba(42, 171, 238, .14); }
    .pricing-card strong { display: block; font-size: 1.65rem; line-height: 1.1; color: var(--ink); }
    .pricing-card span { color: var(--muted); }
    .proof-list { display: grid; gap: 10px; margin: 14px 0 0; padding: 0; list-style: none; }
    .proof-list li { padding: 12px 14px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    .evidence-grid { display: grid; gap: 16px; margin: 16px 0 24px; }
    .evidence-card { margin: 0; border: 1px solid var(--line); border-radius: 8px; background: #fff; overflow: hidden; }
    .evidence-card img { display: block; width: 100%; height: auto; background: var(--soft); }
    .evidence-card figcaption { padding: 12px 14px; color: var(--muted); font-size: .95rem; line-height: 1.55; }
    .evidence-card strong { display: block; margin-bottom: 4px; color: var(--ink); font-size: 1rem; }
    ul.clean { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    ul.clean li { display: flex; justify-content: space-between; gap: 16px; padding: 10px 14px; border-bottom: 1px solid var(--line); }
    ul.clean li:last-child { border-bottom: 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { text-align: left; border-bottom: 1px solid var(--line); padding: 10px 8px; vertical-align: top; }
    th { width: 34%; min-width: 7em; white-space: nowrap; }
    footer { margin-top: 42px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: .95rem; }
    @media (max-width: 900px) { .tutorial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 720px) { .stats, .lists, .topic-grid, .competitor-grid, .tutorial-grid, .trust-grid, .pricing-grid { grid-template-columns: 1fr; } main { padding-top: 24px; } .premium-visual { grid-template-columns: 1fr; } }
  `;
}

function tutorialHref(file) {
  return `${TUTORIAL_REPO_URL}/blob/main/${file}`;
}

function topicHref(topic) {
  return `${SITE_URL}/${topicFile(topic)}`;
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

function topicCards() {
  return TOPIC_PAGES.map(
    (topic) => `      <section class="topic-card">
        <h3><a href="${topicFile(topic)}">${escapeHtml(topic.title)}</a></h3>
        <p>${escapeHtml(topic.description)}</p>
        <p class="intent">${escapeHtml(topic.intent)}</p>
      </section>`
  ).join("\n");
}

function reviewCards() {
  return AIRPORT_REVIEWS.map(
    (review) => `      <section class="topic-card">
        <h3><a href="${
          review.slug
        }.html">${escapeHtml(review.name)}测评</a></h3>
        <p>${escapeHtml(review.description)}</p>
        <p class="intent">${escapeHtml(review.highlights.slice(0, 3).join(" · "))}</p>
      </section>`
  ).join("\n");
}

function homepageReviewCards() {
  return AIRPORT_REVIEWS.map(
    (review) => `      <section class="topic-card">
        <h3><a href="${reviewFile(review)}">${escapeHtml(review.name)}测评</a></h3>
        <p>${escapeHtml(review.description)}</p>
        <p class="intent">${escapeHtml(review.highlights.slice(0, 3).join(" · "))}</p>
      </section>`
  ).join("\n");
}

function serviceCards() {
  return SERVICE_PAGES.map(
    (service) => `      <section class="topic-card">
        <h3><a href="${service.url.replace(`${SITE_URL}/`, "")}">${escapeHtml(service.title)}</a></h3>
        <p>${escapeHtml(service.description)}</p>
        <p class="intent">通过 Fragment 官方赠送，不需要登录对方账号。</p>
      </section>`
  ).join("\n");
}

function relatedTopicLinks(topic) {
  return TOPIC_PAGES.filter((candidate) => candidate.slug !== topic.slug)
    .map((candidate) => `<a href="${candidate.slug}.html">${escapeHtml(candidate.title)}</a>`)
    .join(" · ");
}

function jsonLd(data) {
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n  </script>`;
}

function faqJsonLd(topic) {
  if (!topic.faq?.length) return "";
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: topic.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  });
}

function breadcrumbJsonLd(topic) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: topic.title, item: topicHref(topic) },
    ],
  });
}

function homepageItemListJsonLd() {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Zhuhai Free Nodes 专题入口",
    itemListElement: [...TOPIC_PAGES, ...AIRPORT_REVIEWS].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      url: "h1" in item ? topicHref(item) : reviewHref(item),
    })),
  });
}

function listMarkup(items, className = "") {
  return `<ul${className ? ` class="${className}"` : ""}>\n${items
    .map((item) => `      <li>${escapeHtml(item)}</li>`)
    .join("\n")}\n    </ul>`;
}

function faqMarkup(topic) {
  if (!topic.faq?.length) return "";
  return topic.faq
    .map(
      ([question, answer]) => `      <div class="faq-item">
        <strong>${escapeHtml(question)}</strong>
        <p>${escapeHtml(answer)}</p>
      </div>`
    )
    .join("\n");
}

function trustCards() {
  return TRUST_POINTS.map(
    (item) => `      <section class="trust-item">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
      </section>`
  ).join("\n");
}

function accountButton(topic) {
  if (!topic.accountUrl) return "";
  return `        <a class="button" href="${topic.accountUrl}">小火箭账号入口</a>\n`;
}

function accountSection(topic) {
  if (!topic.accountUrl) return "";
  return `    <p>小火箭账号入口：<a href="${topic.accountUrl}">${topic.accountUrl}</a>。页面会整理可用的 Shadowrocket 账号相关信息，账号状态可能变化，请以页面实时内容为准。</p>\n`;
}

function metricsRows(review) {
  return review.metrics
    .map(([label, value]) => `        <tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("\n");
}

function evidenceMarkup(review) {
  if (!review.evidence?.length) return "";
  return `    <h2>套餐、测速与解锁截图</h2>
    <p>${escapeHtml(review.testTime || "以下截图为本次测评记录，后续节点和解锁结果可能变化。")}</p>
    <div class="evidence-grid">
${review.evidence
  .map(
    (item) => `      <figure class="evidence-card">
        <img src="${escapeHtml(item.src)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async" alt="${escapeHtml(item.alt)}">
        <figcaption><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.caption)}</figcaption>
      </figure>`
  )
  .join("\n")}
    </div>
`;
}

function reviewsIndexHtml(parts) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>机场测评列表：飞兔云、淘气兔 | Zhuhai Free Nodes</title>
  <meta name="description" content="机场测评小板块，整理飞兔云机场、淘气兔机场的套餐、节点、协议、流媒体和购买前注意事项。">
  <meta name="keywords" content="机场测评, 机场推荐, 飞兔云机场, 淘气兔机场, 稳定机场">
  <link rel="canonical" href="${SITE_URL}/reviews/">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "机场测评列表",
    description: "飞兔云、淘气兔机场测评入口。",
    url: `${SITE_URL}/reviews/`,
    dateModified: dateKey(parts),
    isPartOf: { "@type": "WebSite", name: "Zhuhai Free Nodes", url: `${SITE_URL}/` },
  })}
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "机场测评条目",
    itemListElement: AIRPORT_REVIEWS.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: review.title,
      url: reviewHref(review),
    })),
  })}
</head>
<body>
  <main>
    <header>
      <h1>机场测评列表</h1>
      <p>这个小板块承接免费节点用户的下一步搜索意图：当公开免费节点不够稳定时，先看机场套餐、节点、协议、测速和购买提醒，再决定是否短期测试。</p>
      <div class="actions">
        <a class="button" href="../">返回免费节点首页</a>
        <a class="button secondary" href="../topics/free-nodes.html">免费节点订阅</a>
        <a class="button secondary" href="../topics/clash-mihomo-nodes.html">Clash / Mihomo 节点</a>
      </div>
    </header>

    <section class="service-callout" aria-labelledby="review-method">
      <h2 id="review-method">测评口径</h2>
      <p>本站先做轻量测评入口，重点记录价格、节点规模、协议、地区覆盖、适合人群和购买前风险。具体速度、解锁和可用性会随时间变化，建议用户购买前先短周期测试。</p>
    </section>

    <div class="topic-grid">
${reviewCards()}
    </div>

    <h2>免费节点和机场怎么选</h2>
    <p class="note">免费节点适合临时测试、客户端学习和备用连接；机场更适合长期日常使用、多设备、固定订阅入口和更明确的售后维护。新手不要直接年付，先月付测试更稳。</p>

    <footer>
      <p><a href="../">返回首页</a> · <a href="../sitemap.xml">sitemap.xml</a> · <a href="../llms.txt">llms.txt</a></p>
    </footer>
  </main>
</body>
</html>
`;
}

function reviewHtml(review, parts) {
  const keywordName = review.name.replace(/机场$/, "");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(review.title)} - Zhuhai Free Nodes</title>
  <meta name="description" content="${escapeHtml(review.description)}">
  <meta name="keywords" content="${escapeHtml(`${review.name}测评, ${keywordName}机场, ${review.name}怎么样, 机场推荐, 稳定机场, 免费节点和机场区别`)}">
  <link rel="canonical" href="${reviewHref(review)}">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: review.title,
    description: review.description,
    url: reviewHref(review),
    datePublished: "2026-08-26",
    dateModified: dateKey(parts),
    author: { "@type": "Organization", name: "Zhuhai Free Nodes" },
    publisher: { "@type": "Organization", name: "Zhuhai Free Nodes" },
    about: { "@type": "Service", name: review.name },
    isPartOf: { "@type": "WebSite", name: "Zhuhai Free Nodes", url: `${SITE_URL}/` },
  })}
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "机场测评", item: `${SITE_URL}/reviews/` },
      { "@type": "ListItem", position: 3, name: review.name, item: reviewHref(review) },
    ],
  })}
</head>
<body>
  <main>
    <header>
      <p class="service-eyebrow">机场测评 · 免费节点之外的稳定选择</p>
      <h1>${escapeHtml(review.title)}</h1>
      <p>${escapeHtml(review.description)}</p>
      <div class="actions">
        <a class="button" href="${review.url}" rel="sponsored nofollow noreferrer">打开${escapeHtml(review.name)}官网</a>
        <a class="button secondary" href="./">返回测评列表</a>
        <a class="button secondary" href="../">免费节点首页</a>
      </div>
    </header>

    <section class="stats" aria-label="${escapeHtml(review.name)}核心信息">
${review.highlights
  .slice(0, 3)
  .map((item) => `      <div class="stat"><strong>${escapeHtml(item)}</strong><span>${escapeHtml(review.name)}重点</span></div>`)
  .join("\n")}
    </section>

    <h2>${escapeHtml(review.name)}基本信息</h2>
    <table>
      <tbody>
${metricsRows(review)}
      </tbody>
    </table>

${evidenceMarkup(review)}

    <h2>${escapeHtml(review.name)}适合哪些用户</h2>
${listMarkup(review.bestFor, "step-list")}

    <h2>购买前注意事项</h2>
${listMarkup(review.cautions)}

    <h2>${escapeHtml(review.name)}与免费节点怎么选</h2>
    <p>如果只是临时测试客户端、验证订阅格式或备用连接，可以先用本站免费节点。若你需要固定订阅入口、更多节点地区、多设备使用、流媒体或 AI 工具长期可用，再考虑把 ${escapeHtml(review.name)} 作为候选。</p>
    <p class="note">机场测评不是保证可用性的承诺。节点速度、流媒体解锁、ChatGPT 可用性和晚高峰体验都会变化，购买前建议先短周期测试。</p>

    <h2>${escapeHtml(review.name)}访问入口</h2>
    <p><a href="${review.url}" rel="sponsored nofollow noreferrer">打开${escapeHtml(review.name)}官网注册或查看套餐</a></p>

    <h2>相关评测</h2>
    <p>${AIRPORT_REVIEWS.filter((item) => item.slug !== review.slug)
      .map((item) => `<a href="${item.slug}.html">${escapeHtml(item.name)}测评</a>`)
      .join(" · ")}</p>

    <footer>
      <p>节点和机场信息仅供学习、研究和购买前参考。请遵守所在地法律法规和相关服务条款。</p>
      <p><a href="./">机场测评列表</a> · <a href="../topics/free-nodes.html">免费节点订阅</a> · <a href="${REPO_URL}">GitHub 仓库</a></p>
    </footer>
  </main>
</body>
</html>
`;
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
  <title>免费节点订阅链接（每小时更新）| V2Ray、Clash、Mihomo | Zhuhai Free Nodes</title>
  <meta name="description" content="免费节点订阅链接每小时更新：提供 V2Ray Base64 与 Clash / Mihomo YAML 固定入口，适合导入、更新、测速和临时测试。请先检查连通性。">
  <meta name="keywords" content="${KEYWORDS.join(", ")}">
  <link rel="canonical" href="${SITE_URL}/">
  <meta property="og:title" content="免费节点订阅链接（每小时更新）| V2Ray、Clash、Mihomo | Zhuhai Free Nodes">
  <meta property="og:description" content="每小时更新的免费节点订阅链接，提供 V2Ray Base64 与 Clash / Mihomo YAML 固定入口。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}/">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "Zhuhai Free Nodes",
    description:
      "每小时自动更新的免费节点订阅，支持 Clash、Mihomo、V2Ray、Trojan、Shadowrocket 等客户端，并整理订阅导入教程。",
    url: `${SITE_URL}/`,
    codeRepository: REPO_URL,
    dateModified: dateKey(parts),
    keywords: KEYWORDS.join(", "),
  })}
  ${faqJsonLd({ faq: HOMEPAGE_FAQ })}
  ${homepageItemListJsonLd()}
</head>
<body>
  <main>
    <header>
      <h1>Zhuhai Free Nodes 免费节点订阅链接</h1>
      <p>每小时自动更新，提供 V2Ray 通用 Base64 与 Clash / Mihomo YAML 订阅链接，适合 V2RayN、V2rayNG、Shadowrocket、NekoBox、Hiddify、sing-box 等客户端导入和测试。</p>
      <div class="actions">
        <a class="button" href="#base64">V2Ray Base64 订阅</a>
        <a class="button secondary" href="#clash">Clash / Mihomo YAML</a>
        <a class="button secondary" href="#topics">关键词专题</a>
        <a class="button secondary" href="reviews/">机场测评</a>
        <a class="button secondary" href="#tutorials">使用教程</a>
        <a class="button secondary" href="topics/telegram-premium.html">Telegram Premium</a>
      </div>
    </header>

    <section class="stats" aria-label="今日免费节点状态">
      <div class="stat"><strong>${statNumber(stats.nodeCount)}</strong><span>通用订阅节点</span></div>
      <div class="stat"><strong>${statNumber(stats.clashCount)}</strong><span>Clash / Mihomo 节点</span></div>
      <div class="stat"><strong>1h</strong><span>自动更新频率</span></div>
    </section>

    <p>今日页面生成：${label}。订阅文件保持自动更新，免费节点稳定性会随地区和运营商变化，建议导入后先测试延迟和连通性。</p>

    <h2 id="base64">V2Ray 通用 Base64 订阅链接</h2>
    <pre>${RAW_BASE}/nodes.txt</pre>

    <h2 id="clash">Clash / Mihomo YAML 订阅链接</h2>
    <pre>${RAW_BASE}/clash_config.yaml</pre>

    <h2 id="topics">关键词专题</h2>
    <p>这些页面覆盖免费节点、代理订阅、Clash、Mihomo、V2Ray、Shadowrocket 等搜索意图，帮助搜索引擎和 AI 摘要系统理解项目结构。</p>
    <div class="topic-grid">
${topicCards()}
    </div>

    <section class="service-callout" aria-labelledby="airport-reviews">
      <h2 id="airport-reviews">机场测评</h2>
      <p>免费节点适合临时测试，长期使用更需要看节点地区、套餐价格、晚高峰表现、流媒体和售后。本站先整理飞兔云、淘气兔轻量测评，后续按数据继续补充。</p>
      <div class="topic-grid">
${homepageReviewCards()}
      </div>
      <p><a href="reviews/">查看全部机场测评</a></p>
    </section>

    <section class="service-callout" aria-labelledby="services">
      <h2 id="services">附加服务</h2>
      <p>除免费节点订阅外，也整理少量与 Telegram 使用场景相关的正规服务入口。首页只保留轻量入口，具体说明放在独立页面。</p>
      <div class="topic-grid">
${serviceCards()}
      </div>
    </section>

    <h2>本站更新与安全说明</h2>
    <p class="note">Zhuhai Free Nodes 的核心价值是固定订阅入口、持续更新和客户端教程。页面不会为了关键词堆砌而批量生成低价值内容，长尾专题会围绕真实导入场景补充说明。</p>
    <div class="trust-grid">
${trustCards()}
    </div>

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

    <h2>自动 SEO 分析</h2>
    <p><a href="seo-insights.html">查看 SEO 自动分析</a>与<a href="competitors.html">免费节点项目竞品对比</a>。本项目会持续强化每小时更新、双格式订阅、教程入口、每日归档和排名监控。</p>

    <h2 id="faq">常见问题</h2>
    <div class="faq-list">
${faqMarkup({ faq: HOMEPAGE_FAQ })}
    </div>

    <footer>
      <p>节点仅供测试与学习研究。请遵守当地法律法规和服务条款。</p>
      <p><a href="${REPO_URL}">GitHub 仓库</a> · <a href="https://zhuhai.uk">zhuhai.uk</a> · <a href="https://t.me/dns68">Telegram</a> · <a href="llms.txt">llms.txt</a></p>
    </footer>
  </main>
</body>
</html>
`;
}

function topicHtml(topic, stats, parts) {
  const label = cnDateLabel(parts);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(topic.title)} - Zhuhai Free Nodes</title>
  <meta name="description" content="${escapeHtml(topic.description)}">
  <meta name="keywords" content="${topic.keywords.map(escapeHtml).join(", ")}">
  <link rel="canonical" href="${topicHref(topic)}">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${topic.title} - Zhuhai Free Nodes`,
    description: topic.description,
    url: topicHref(topic),
    dateModified: dateKey(parts),
    isPartOf: { "@type": "WebSite", name: "Zhuhai Free Nodes", url: `${SITE_URL}/` },
    keywords: topic.keywords.join(", "),
  })}
  ${faqJsonLd(topic)}
  ${breadcrumbJsonLd(topic)}
</head>
<body>
  <main>
    <header>
      <h1>${escapeHtml(topic.h1)}</h1>
      <p>${escapeHtml(topic.description)}</p>
      <div class="actions">
${accountButton(topic)}        ${topic.accountUrl ? `<a class="button secondary" href="${RAW_BASE}/nodes.txt">Base64 订阅</a>` : `<a class="button" href="${RAW_BASE}/nodes.txt">Base64 订阅</a>`}
        <a class="button secondary" href="${RAW_BASE}/clash_config.yaml">Clash / Mihomo 订阅</a>
        <a class="button secondary" href="../">返回首页</a>
      </div>
    </header>

    <section class="stats" aria-label="当前订阅状态">
      <div class="stat"><strong>${statNumber(stats.nodeCount)}</strong><span>通用订阅节点</span></div>
      <div class="stat"><strong>${statNumber(stats.clashCount)}</strong><span>Clash / Mihomo 节点</span></div>
      <div class="stat"><strong>${label}</strong><span>最近生成日期</span></div>
    </section>

    <h2>使用说明</h2>
    <p>${escapeHtml(topic.body)}</p>
${accountSection(topic)}
    <p>订阅文件会定时更新。免费节点来自公开资源，适合临时测试、备用连接、订阅格式验证和客户端学习，不建议用于重要账号或敏感数据。</p>

    <h2>搜索意图</h2>
    <p class="note">${escapeHtml(topic.intent)}</p>

    <h2>适合场景</h2>
${listMarkup(topic.bestFor)}

    <h2>导入建议</h2>
${listMarkup(topic.importSteps, "step-list")}

    <h2>安全提醒</h2>
${listMarkup(topic.safetyTips)}

    <h2>固定订阅地址</h2>
    <table>
      <tbody>
        <tr><th>Base64 通用订阅</th><td><code>${RAW_BASE}/nodes.txt</code></td></tr>
        <tr><th>Clash / Mihomo YAML</th><td><code>${RAW_BASE}/clash_config.yaml</code></td></tr>
      </tbody>
    </table>

    <h2>相关关键词</h2>
    <div class="tag-list">
${topic.keywords.map((keyword) => `      <span class="tag">${escapeHtml(keyword)}</span>`).join("\n")}
    </div>

    <h2>相关教程</h2>
    <p>
      <a href="${tutorialHref("docs/windows/clash-verge.md")}">Clash Verge 使用教程</a> ·
      <a href="${tutorialHref("docs/windows/v2rayn.md")}">V2RayN 使用教程</a> ·
      <a href="${tutorialHref("docs/android/v2rayng.md")}">V2rayNG 使用教程</a> ·
      <a href="${tutorialHref("docs/ios/shadowrocket.md")}">Shadowrocket 小火箭使用教程</a>
    </p>

    <h2>按客户端和格式继续查看</h2>
    <p>${relatedTopicLinks(topic)}</p>

    <h2>常见问题</h2>
    <div class="faq-list">
${faqMarkup(topic)}
    </div>

    <footer>
      <p><a href="../">返回首页</a> · <a href="${REPO_URL}">GitHub 仓库</a> · <a href="../competitors.html">竞品对比</a></p>
    </footer>
  </main>
</body>
</html>
`;
}

function premiumGiftIcon() {
  return `<svg viewBox="0 0 48 48" role="img" aria-label="Telegram Premium 礼物">
            <path fill="currentColor" d="M10 20h28v20H10V20Zm3-8h7.2c-2.1-3.2-1.7-6.3.8-7.6 2.2-1.2 4.8-.1 7 2.9 2.2-3 4.8-4.1 7-2.9 2.5 1.3 2.9 4.4.8 7.6H43v8H5v-8h8Zm12.5 0c-1.7-3.8-3.3-5.1-4.5-4.4-1.3.7-.9 2.8.9 4.4h3.6Zm8.5-4.4c-1.2-.7-2.8.6-4.5 4.4h3.6c1.8-1.6 2.2-3.7.9-4.4ZM26 20H10v4h16v-4Zm4 0v4h8v-4h-8Zm-4 8H14v8h12v-8Zm4 0v8h4v-8h-4Z"/>
          </svg>`;
}

function telegramPremiumHtml(parts) {
  const label = dateKey(parts);
  const offerJson = TELEGRAM_PREMIUM_OFFERS.map((offer) => ({
    "@type": "Offer",
    name: `Telegram Premium ${offer.duration}`,
    price: offer.price.replace(" 元", ""),
    priceCurrency: "CNY",
    availability: "https://schema.org/InStock",
    url: TELEGRAM_PREMIUM_URL,
  }));

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Telegram Premium 会员赠送 - Fragment 官方渠道开通</title>
  <meta name="description" content="Telegram Premium 会员赠送服务，通过 Fragment 官方渠道赠送，不需要登录对方账号，只需提供 Telegram username。3个月99元，6个月139元，12个月249元。">
  <meta name="keywords" content="${TELEGRAM_PREMIUM_KEYWORDS.map(escapeHtml).join(", ")}">
  <link rel="canonical" href="${TELEGRAM_PREMIUM_URL}">
  <meta property="og:title" content="Telegram Premium 会员赠送 - Fragment 官方渠道">
  <meta property="og:description" content="不需要登录对方账号，只需 Telegram username，即可通过 Fragment 官方渠道赠送 Telegram Premium。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${TELEGRAM_PREMIUM_URL}">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Telegram Premium 会员赠送",
    description:
      "通过 Fragment 官方渠道赠送 Telegram Premium 会员，不需要登录对方账号，只需提供 Telegram username。",
    url: TELEGRAM_PREMIUM_URL,
    provider: { "@type": "Organization", name: "Zhuhai Free Nodes" },
    areaServed: "CN",
    serviceType: "Telegram Premium gift service",
    dateModified: label,
    offers: offerJson,
    keywords: TELEGRAM_PREMIUM_KEYWORDS.join(", "),
  })}
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Telegram Premium 会员赠送需要登录账号吗？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "不需要登录对方账号。通过 Fragment 官方赠送方式，只需要提供准确的 Telegram username。",
        },
      },
      {
        "@type": "Question",
        name: "Telegram username 填错了怎么办？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "赠送前请仔细确认 username。提交错误用户名可能导致赠送到错误对象，通常不可撤回。",
        },
      },
      {
        "@type": "Question",
        name: "可以查看成交记录吗？",
        acceptedAnswer: {
          "@type": "Answer",
          text: `可以访问成交记录频道：${TELEGRAM_PREMIUM_LOGS_URL}。`,
        },
      },
    ],
  })}
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Telegram Premium 会员赠送", item: TELEGRAM_PREMIUM_URL },
    ],
  })}
</head>
<body>
  <main>
    <header>
      <p class="service-eyebrow">Fragment 官方渠道 · Telegram Premium Gift</p>
      <h1>Telegram Premium 会员赠送</h1>
      <p>通过 Fragment 官方赠送形式开通 Telegram Premium，不需要登录对方账号，不索要验证码，只需要准确的 Telegram username。</p>
      <div class="actions">
        <a class="button telegram" href="${TELEGRAM_PREMIUM_CONTACT_URL}">联系开通</a>
        <a class="button secondary" href="${TELEGRAM_PREMIUM_LOGS_URL}">查看成交记录</a>
        <a class="button secondary" href="../">返回免费节点首页</a>
      </div>
    </header>

    <section class="service-hero" aria-labelledby="premium-summary">
      <h2 id="premium-summary">正规赠送方式</h2>
      <div class="premium-visual">
        <div class="gift-mark">${premiumGiftIcon()}</div>
        <div>
          <h3>只需 Telegram username</h3>
          <p>开通流程基于 Fragment 的 Premium Gift。用户无需交出账号密码，也不需要登录 iCloud、Telegram 或任何个人账号。</p>
        </div>
      </div>
      <ul class="proof-list">
        <li><strong>不登录账号：</strong>只确认 Telegram username，避免账号密码和验证码风险。</li>
        <li><strong>官方赠送：</strong>通过 Fragment 赠送 Telegram Premium，用户在 Telegram 内接收会员权益。</li>
        <li><strong>记录可查：</strong>成交记录频道：<a href="${TELEGRAM_PREMIUM_LOGS_URL}">${TELEGRAM_PREMIUM_LOGS_URL}</a>。</li>
      </ul>
    </section>

    <h2>价格套餐</h2>
    <div class="pricing-grid">
${TELEGRAM_PREMIUM_OFFERS.map(
  (offer) => `      <section class="pricing-card${offer.featured ? " featured" : ""}">
        <h3>${escapeHtml(offer.duration)}</h3>
        <strong>${escapeHtml(offer.price)}</strong>
        <span>${escapeHtml(offer.note)}</span>
        <p><a class="button${offer.featured ? " telegram" : " secondary"}" href="${TELEGRAM_PREMIUM_CONTACT_URL}">咨询 ${escapeHtml(offer.duration)}</a></p>
      </section>`
).join("\n")}
    </div>

    <h2>开通流程</h2>
    <ul class="step-list">
      <li>联系 Telegram：<a href="${TELEGRAM_PREMIUM_CONTACT_URL}">t.me/dns68?direct</a>。</li>
      <li>提供需要接收 Premium 的 Telegram username，并确认套餐时长。</li>
      <li>通过 Fragment 官方赠送 Premium，完成后用户在 Telegram 内接收权益。</li>
      <li>开通后可保存 Gift Sent 截图或到成交记录频道核对。</li>
    </ul>

    <h2>注意事项</h2>
    <p class="note">请务必确认 Telegram username 拼写正确。Telegram Premium Gift 发出后通常不可撤回，也不建议把账号密码、验证码、私密聊天记录提供给任何人。</p>
    <div class="trust-grid">
      <section class="trust-item">
        <h3>适合谁</h3>
        <p>适合已有 Telegram 账号、希望开通 Premium，但不想自己处理 Fragment 或 TON 支付流程的用户。</p>
      </section>
      <section class="trust-item">
        <h3>需要什么</h3>
        <p>只需要 Telegram username。不要提供手机号、验证码、登录密码或私钥。</p>
      </section>
      <section class="trust-item">
        <h3>如何验单</h3>
        <p>完成后可查看 Telegram 内 Premium 状态，也可查看成交记录频道。</p>
      </section>
    </div>

    <h2>相关关键词</h2>
    <div class="tag-list">
${TELEGRAM_PREMIUM_KEYWORDS.map((keyword) => `      <span class="tag">${escapeHtml(keyword)}</span>`).join("\n")}
    </div>

    <h2>常见问题</h2>
    <div class="faq-list">
      <div class="faq-item">
        <strong>Telegram Premium 会员赠送需要登录账号吗？</strong>
        <p>不需要。只需要准确的 Telegram username，不索要账号密码和验证码。</p>
      </div>
      <div class="faq-item">
        <strong>3 个月、6 个月、12 个月价格是多少？</strong>
        <p>3 个月 99 元，6 个月 139 元，12 个月 249 元。</p>
      </div>
      <div class="faq-item">
        <strong>成交记录在哪里看？</strong>
        <p>成交记录频道：<a href="${TELEGRAM_PREMIUM_LOGS_URL}">${TELEGRAM_PREMIUM_LOGS_URL}</a>。</p>
      </div>
    </div>

    <footer>
      <p>本页为 Telegram Premium 赠送服务说明页。免费节点订阅仍是本站首页核心内容。</p>
      <p><a href="../">返回首页</a> · <a href="${TELEGRAM_PREMIUM_CONTACT_URL}">联系开通</a> · <a href="${TELEGRAM_PREMIUM_LOGS_URL}">成交记录</a></p>
    </footer>
  </main>
</body>
</html>
`;
}

function competitorsHtml(parts) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>免费节点项目竞品对比 - Zhuhai Free Nodes</title>
  <meta name="description" content="Zhuhai Free Nodes 跟踪免费节点、免费代理节点、Clash 节点、V2Ray 节点相关竞品，用于持续优化 SEO 与 GEO 内容。">
  <link rel="canonical" href="${SITE_URL}/competitors.html">
  <style>${sharedStyles()}</style>
  ${jsonLd({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "免费节点项目竞品对比",
    url: `${SITE_URL}/competitors.html`,
    dateModified: dateKey(parts),
  })}
</head>
<body>
  <main>
    <header>
      <h1>免费节点项目竞品对比</h1>
      <p>本页记录免费节点、免费代理节点、Clash 节点、V2Ray 节点相关竞品方向，帮助项目持续优化搜索覆盖和 AI 摘要可读性。</p>
    </header>

    <h2>当前跟踪项目</h2>
    <div class="competitor-grid">
${COMPETITORS.map(
  (item) => `      <section class="competitor-card">
        <h3><a href="${item.url}">${escapeHtml(item.name)}</a></h3>
        <p>${escapeHtml(item.angle)}</p>
      </section>`
).join("\n")}
    </div>

    <h2>Zhuhai Free Nodes 的差异化</h2>
    <ul>
      <li>每小时自动更新订阅文件，保持首页和每日快照同步刷新。</li>
      <li>同时提供 Base64 通用订阅与 Clash / Mihomo YAML 配置。</li>
      <li>将免费节点、代理订阅、Shadowrocket、小火箭账号、机场推荐等搜索意图拆成可索引专题页。</li>
      <li>通过 sitemap、robots、llms.txt、结构化数据和排名报告提升 SEO / GEO 可读性。</li>
    </ul>

    <footer>
      <p><a href="./">返回首页</a> · <a href="${REPO_URL}">GitHub 仓库</a></p>
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
  <title>${label}免费节点订阅快照 - Zhuhai Free Nodes</title>
  <meta name="description" content="${label} Zhuhai Free Nodes 免费节点订阅快照，包含 Clash、Mihomo、V2Ray、Shadowrocket 等客户端可用的订阅入口。">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${SITE_URL}/">
  <style>${sharedStyles()}</style>
</head>
<body>
  <main>
    <h1>${label}免费节点订阅</h1>
    <p>本页是 Zhuhai Free Nodes 的免费节点订阅快照。订阅文件仍会每小时自动更新，导入客户端后请先测试延迟和连通性。</p>
    <table>
      <tbody>
        <tr><th>通用订阅节点</th><td>${stats.nodeCount} 个</td></tr>
        <tr><th>Clash / Mihomo 节点</th><td>${stats.clashCount} 个</td></tr>
        <tr><th>快照日期</th><td>${label}</td></tr>
      </tbody>
    </table>
    <h2>通用 Base64 订阅</h2>
    <pre>${RAW_BASE}/nodes.txt</pre>
    <h2>Clash / Mihomo 订阅</h2>
    <pre>${RAW_BASE}/clash_config.yaml</pre>
    <h2>导入订阅教程</h2>
    <p>
      <a href="${tutorialHref("docs/windows/clash-verge.md")}">Clash Verge 使用教程</a> ·
      <a href="${tutorialHref("docs/windows/v2rayn.md")}">V2RayN 使用教程</a> ·
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
  const urls = [
    { loc: `${SITE_URL}/`, freq: "hourly", priority: "1.0" },
    { loc: `${SITE_URL}/seo-insights.html`, freq: "daily", priority: "0.8" },
    { loc: `${SITE_URL}/competitors.html`, freq: "weekly", priority: "0.7" },
    { loc: `${SITE_URL}/reviews/`, freq: "weekly", priority: "0.8" },
    ...TOPIC_PAGES.map((topic) => ({ loc: topicHref(topic), freq: "daily", priority: "0.9" })),
    ...AIRPORT_REVIEWS.map((review) => ({ loc: reviewHref(review), freq: "weekly", priority: "0.7" })),
    ...SERVICE_PAGES.map((service) => ({ loc: service.url, freq: "weekly", priority: "0.6" })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod || dateKey(parts)}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

async function deindexArchiveSnapshots() {
  let files = [];
  try {
    files = (await readdir("archive")).filter((file) => file.endsWith(".html"));
  } catch {
    return;
  }
  await Promise.all(
    files.map(async (file) => {
      const target = path.join("archive", file);
      const html = await readFile(target, "utf8");
      const updated = html
        .replace(/<meta name="robots" content="noindex,follow">\n\s*/g, "")
        .replace(/<link rel="canonical" href="[^"]+">/, `<meta name="robots" content="noindex,follow">\n  <link rel="canonical" href="${SITE_URL}/">`);
      if (updated !== html) await writeFile(target, updated);
    })
  );
}

function robotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function llmsTxt(stats, parts) {
  return `# Zhuhai Free Nodes

Zhuhai Free Nodes is a GitHub project and static site for hourly updated free proxy node subscriptions.

## Primary URLs

- Site: ${SITE_URL}/
- Repository: ${REPO_URL}
- Base64 subscription: ${RAW_BASE}/nodes.txt
- Clash / Mihomo subscription: ${RAW_BASE}/clash_config.yaml
- Sitemap: ${SITE_URL}/sitemap.xml

## Current Snapshot

- Updated: ${cnDateLabel(parts)} Asia/Shanghai
- Base64 nodes: ${stats.nodeCount}
- Clash / Mihomo nodes: ${stats.clashCount}
- Main use cases: temporary proxy testing, proxy client learning, subscription format validation, backup free nodes.

## Topics

${TOPIC_PAGES.map((topic) => `- ${topic.title}: ${topicHref(topic)}`).join("\n")}

## Services

${SERVICE_PAGES.map((service) => `- ${service.title}: ${service.url}`).join("\n")}

## Airport Reviews

- Index: ${SITE_URL}/reviews/
${AIRPORT_REVIEWS.map((review) => `- ${review.name}: ${reviewHref(review)}`).join("\n")}

## Keywords

${KEYWORDS.join(", ")}

## Notes

Free nodes are unstable by nature. Users should test latency and availability before use. This project is for learning, research and client testing only.
`;
}

function updateReadme(readme, parts) {
  const label = cnDateLabel(parts);
  const absoluteArchiveUrl = `${SITE_URL}/${archiveFile(parts)}`;
  const topicList = TOPIC_PAGES.map((topic) => `- ${topic.title}：[${topicHref(topic)}](${topicHref(topic)})`).join("\n");
  const serviceList = SERVICE_PAGES.map((service) => `- ${service.title}：[${service.url}](${service.url})`).join("\n");
  const reviewList = AIRPORT_REVIEWS.map((review) => `- ${review.name}：[${reviewHref(review)}](${reviewHref(review)})`).join("\n");
  const section = `## GitHub Pages、SEO / GEO 与每日归档

如果 GitHub Pages 已开启，可以访问项目页面：

- 项目首页：[${SITE_URL}/](${SITE_URL}/)
- 站点地图：[${SITE_URL}/sitemap.xml](${SITE_URL}/sitemap.xml)
- AI / GEO 摘要：[${SITE_URL}/llms.txt](${SITE_URL}/llms.txt)
- SEO 自动分析：[${SITE_URL}/seo-insights.html](${SITE_URL}/seo-insights.html)
- 竞品对比：[${SITE_URL}/competitors.html](${SITE_URL}/competitors.html)
- 每日快照：[${label}免费节点订阅](${absoluteArchiveUrl})

关键词专题页：

${topicList}

机场测评小板块：

- 测评列表：[${SITE_URL}/reviews/](${SITE_URL}/reviews/)
${reviewList}

附加服务页：

${serviceList}

这些页面用于帮助搜索引擎和 AI 摘要系统理解本仓库主题、更新时间、固定订阅入口、教程入口和竞品差异化。

排名监控会定期生成 \`reports/seo-ranking-latest.md\`。如需 Google 搜索排名，请在 GitHub Secrets 中配置 \`SERPAPI_KEY\`，无需把密钥提交到仓库。

## 代理软件使用教程

如果你不知道订阅链接应该填在哪里，可以查看配套教程仓库：

- 教程仓库：[zhuhaiuk/proxy-client-tutorials](${TUTORIAL_REPO_URL})
- 软件下载：[代理软件下载地址](${tutorialHref("docs/proxy-client-downloads.md")})
- 常见问题：[更新订阅提示无效的订阅怎么办](${tutorialHref("docs/troubleshooting/invalid-subscription.md")})
- Android：[V2rayNG 使用教程](${tutorialHref("docs/android/v2rayng.md")})、[Clash for Android 使用教程](${tutorialHref("docs/android/clash-for-android.md")})
- Windows：[Clash Verge 使用教程](${tutorialHref("docs/windows/clash-verge.md")})、[V2RayN 使用教程](${tutorialHref("docs/windows/v2rayn.md")})
- iOS：[Shadowrocket 小火箭使用教程](${tutorialHref("docs/ios/shadowrocket.md")})
`;

  return readme.replace(/## GitHub Pages(?:、SEO \/ GEO)? 与每日归档[\s\S]*?(?=\n## 项目简介)/, section);
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
await mkdir("topics", { recursive: true });
await mkdir("reviews", { recursive: true });
await writeFile("index.html", indexHtml(stats, parts));
for (const topic of TOPIC_PAGES) {
  await writeFile(topicFile(topic), topicHtml(topic, stats, parts));
}
await writeFile("reviews/index.html", reviewsIndexHtml(parts));
for (const review of AIRPORT_REVIEWS) {
  await writeFile(reviewFile(review), reviewHtml(review, parts));
}
await writeFile("topics/telegram-premium.html", telegramPremiumHtml(parts));
await writeFile("competitors.html", competitorsHtml(parts));
await writeFile(todayArchive, archiveHtml(stats, parts));
await deindexArchiveSnapshots();
await writeFile("sitemap.xml", await sitemapXml(parts));
await writeFile("robots.txt", robotsTxt());
await writeFile("llms.txt", llmsTxt(stats, parts));
await writeFile("README.md", updateReadme(readme, parts));

console.log(`Updated SEO pages for ${dateKey(parts)} with ${stats.nodeCount} nodes.`);
