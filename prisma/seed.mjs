// 数据库种子脚本 — 通过 API 写入（upsert 语义：有则更新，无则创建）
// 前提：开发服务器需运行中（npm run dev）
// 运行命令：node prisma/seed.mjs

import { config } from "dotenv";
config();

const API_BASE = process.env.SEED_API_BASE ?? "http://localhost:3000";
const API_SECRET = process.env.API_SECRET;

if (!API_SECRET) {
  console.error("错误：.env 中未配置 API_SECRET");
  process.exit(1);
}

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_SECRET}`,
};

// tags 字段直接用数组，API 内部负责 JSON.stringify
const posts = [
  {
    slug: "a-share-emotion-cycle-2026",
    title: "A股情绪周期：如何用数据捕捉市场拐点",
    createdAt: "2026-03-20T09:00:00.000Z",
    excerpt:
      "从连板高度、炸板率、涨停家数三个维度出发，构建一套可量化的情绪阶段判断框架。当市场从冰点走向亢奋，数据会比情绪先告诉你答案。",
    content: `## 为什么要关注情绪周期？\n\n在A股短线交易中，情绪周期是决定盈亏的核心变量。一个成熟的短线交易者，应该能够判断当前市场处于情绪周期的哪个阶段，并据此调整仓位和策略。\n\n## 三个核心指标\n\n### 1. 连板高度\n\n连板高度反映市场的风险偏好。当最高板从2板推进到5板以上，说明资金开始敢于接力，情绪在升温。\n\n### 2. 炸板率\n\n炸板率 = 炸板股数 / 涨停股数。这个指标反映的是市场的分歧程度。炸板率低于20%时，说明一致性强，市场处于加速阶段。\n\n### 3. 涨停家数\n\n涨停家数是市场赚钱效应的直接体现。超过80家涨停通常意味着市场进入亢奋期。\n\n> 记住：数据只是工具，最终的交易决策还需要结合盘面细节和个人风险承受能力。`,
    category: "stock",
    tags: ["情绪周期", "量化", "短线"],
    readingTime: 12,
    published: true,
  },
  {
    slug: "dragon-head-strategy",
    title: "龙头战法的本质：不是追高，是追确定性",
    createdAt: "2026-03-08T09:00:00.000Z",
    excerpt:
      "很多人对龙头战法的误解是「追涨停」，但真正的龙头战法追求的是在混沌中找到确定性最高的那个标的。",
    content: `## 龙头战法的核心逻辑\n\n龙头战法不是赌博，而是一种概率优势策略。在一波行情中，龙头股往往具有最高的辨识度和最强的资金合力，这意味着它的走势最具确定性。\n\n## 如何识别龙头？\n\n1. **辨识度**：市场提到这个题材，第一个想到的是谁？\n2. **换手充分度**：是否经历了充分的换手？\n3. **资金合力**：是否有持续的资金流入？\n\n> 交易的本质是管理不确定性，龙头战法只是让你站在概率更高的那一边。`,
    category: "stock",
    tags: ["龙头股", "交易策略", "确定性"],
    readingTime: 15,
    published: true,
  },
  {
    slug: "ai-agent-product-thinking",
    title: "AI Agent 产品思维：从工具到助手的范式转移",
    createdAt: "2026-04-07T09:00:00.000Z",
    excerpt:
      "Agent 不只是能调用工具的 LLM。真正的 Agent 产品需要重新思考人机交互的边界：什么时候该自主决策，什么时候该请示用户。",
    content: `## 从工具到助手\n\n传统软件是工具——你告诉它做什么，它就做什么。AI Agent 是助手——你告诉它你的目标，它自己规划步骤去完成。\n\n## Agent 产品的三个关键设计决策\n\n### 1. 自主权边界\n\n一个好的原则是：**可逆的操作自主执行，不可逆的操作请示用户**。\n\n### 2. 透明度设计\n\n用户需要知道 Agent 在做什么，但不需要知道每一个技术细节。\n\n### 3. 错误恢复\n\nAgent 会犯错，这是确定的。产品设计需要考虑如何让用户快速发现和修正错误。\n\n> 最好的 Agent 产品，是让用户忘记自己在和 AI 交互。`,
    category: "ai",
    tags: ["Agent", "产品设计", "LLM"],
    readingTime: 18,
    published: true,
  },
  {
    slug: "claude-code-workflow",
    title: "用 Claude Code 构建全栈应用：一个非技术人员的实战记录",
    createdAt: "2026-04-12T09:00:00.000Z",
    excerpt:
      "作为一个不会写代码的人，我用 Claude Code 从零搭建了一个完整的股票监控系统。这篇文章记录了整个过程中的经验和教训。",
    content: `## 背景\n\n我是一个销售出身的人，对编程一窍不通。但我有一个需求：构建一个能自动采集新闻、监控热股、推送到飞书的系统。\n\n## 几个关键经验\n\n1. **一次只做一件事**：不要一口气提一堆需求\n2. **先看方案再动手**：让它先出 PRD\n3. **测试驱动**：要求它先写测试\n4. **及时存档**：用 memory 功能记住重要决策\n\n> 技术不再是门槛，想法才是。`,
    category: "ai",
    tags: ["Claude Code", "全栈开发", "AI 编程"],
    readingTime: 22,
    published: true,
  },
  {
    slug: "mcp-server-explained",
    title: "MCP 协议：让 AI 连接万物的标准接口",
    createdAt: "2026-03-30T09:00:00.000Z",
    excerpt:
      "Model Context Protocol 正在成为 AI 应用的 USB 接口。理解 MCP，就理解了 AI Agent 生态的未来走向。",
    content: `## 什么是 MCP？\n\nMCP（Model Context Protocol）是 Anthropic 提出的一个开放协议，它定义了 AI 模型如何与外部工具和数据源交互的标准方式。\n\n## 为什么重要？\n\n1. **工具生态爆发**：开发者只需要实现一次 MCP server\n2. **降低集成成本**：不需要为每个 AI 平台写适配器\n3. **增强互操作性**：不同 AI 应用可以共享同一套工具\n\n> MCP 的意义不在于技术本身，而在于它创造了一个生态标准。`,
    category: "ai",
    tags: ["MCP", "协议", "AI 生态"],
    readingTime: 14,
    published: true,
  },
  {
    slug: "b2b-sales-discovery-call",
    title: "B2B 销售的第一通电话：如何在 30 秒内建立信任",
    createdAt: "2026-02-12T09:00:00.000Z",
    excerpt:
      "Discovery call 不是产品演示，是需求挖掘。客户愿意跟你聊下去的前提，是你在前 30 秒展现了对他行业的理解。",
    content: `## 30 秒法则\n\n一个 B2B 销售的 discovery call，成败在前 30 秒就决定了。\n\n## 开场白的三个要素\n\n### 1. 行业洞察\n\n不要说"我们的产品能帮你提升效率"。要说"我注意到你们行业最近在面临 XX 挑战"。\n\n### 2. 具体数字\n\n具体数字比笼统描述有说服力100倍。\n\n### 3. 开放式提问\n\n"我好奇，你们目前是怎么处理这个问题的？"\n\n> 最好的销售不是说服别人买，而是帮别人发现他需要买。`,
    category: "sales",
    tags: ["B2B", "销售技巧", "Discovery Call"],
    readingTime: 10,
    published: true,
  },
  {
    slug: "enterprise-sales-cycle",
    title: "大客户销售周期管理：从线索到签约的 180 天",
    createdAt: "2026-02-25T09:00:00.000Z",
    excerpt:
      "企业级销售不是一次性行为，而是一场长达半年的关系构建。每个阶段有不同的目标、策略和关键动作。",
    content: `## 大客户销售的时间维度\n\nB2B 大客户销售的平均周期是 3-6 个月。\n\n## 六个阶段\n\n1. 线索确认（第1-2周）\n2. 需求挖掘（第3-6周）\n3. 方案设计（第7-10周）\n4. 商务谈判（第11-16周）\n5. 高层对齐（第17-20周）\n6. 签约交付（第21-26周）\n\n> Pipeline 管理的本质是：永远知道下一步该做什么。`,
    category: "sales",
    tags: ["大客户", "销售流程", "Pipeline"],
    readingTime: 16,
    published: true,
  },
  {
    slug: "reading-habit-2026",
    title: "2026 年我的阅读系统：从信息焦虑到知识沉淀",
    createdAt: "2026-02-01T09:00:00.000Z",
    excerpt:
      "不是读得多就有用。建立一个从「输入-处理-输出」的完整阅读系统，才能把信息转化为真正的认知升级。",
    content: `## 信息过载的困境\n\n每天的信息量已经远远超过人脑的处理能力。\n\n## 我的三层阅读系统\n\n### 第一层：快速扫描（每天 15 分钟）\n\n### 第二层：深度阅读（每天 30 分钟）\n\n### 第三层：知识输出（每周 1 篇）\n\n> 知识的价值不在于存储，在于连接。`,
    category: "misc",
    tags: ["阅读", "知识管理", "个人成长"],
    readingTime: 8,
    published: true,
  },
  {
    slug: "why-i-started-blogging",
    title: "为什么在 2026 年开始写博客",
    createdAt: "2026-01-05T09:00:00.000Z",
    excerpt:
      "在这个短视频和碎片化内容的时代，为什么我选择了最「古老」的内容形式？因为写作是最好的思考工具。",
    content: `## 写作是整理思维的最佳方式\n\n写作强迫你把模糊的感觉转化为精确的表述。\n\n## 为什么是博客而不是公众号？\n\n公众号是流量平台，博客是个人资产。博客文章只要有 SEO，三年后还有人通过搜索引擎找到它。\n\n> 写作不是为了展示，是为了看清自己。`,
    category: "misc",
    tags: ["写作", "博客", "思考"],
    readingTime: 6,
    published: true,
  },
  {
    slug: "sales-to-tech-transition",
    title: "从销售转型做技术产品：跨界者的优势和陷阱",
    createdAt: "2026-01-18T09:00:00.000Z",
    excerpt:
      "销售背景让我天然理解用户需求，但也让我容易掉入「什么都想做」的陷阱。跨界转型最重要的不是学技术，是学会取舍。",
    content: `## 销售出身的优势\n\n做过销售的人有一个天然优势：**你真正理解客户。**\n\n## 但也有陷阱\n\n### 陷阱一：什么都想做\n### 陷阱二：过度关注竞品\n### 陷阱三：急于变现\n\n> 跨界不是从零开始，是带着独特视角进入新领域。`,
    category: "sales",
    tags: ["转型", "产品思维", "职业发展"],
    readingTime: 11,
    published: true,
  },
];

async function main() {
  console.log(`开始灌入种子数据 → ${API_BASE}\n`);

  // 获取现有文章列表（含草稿，需鉴权）
  const listRes = await fetch(`${API_BASE}/api/posts`, { headers: authHeaders });
  if (!listRes.ok) {
    throw new Error(`获取文章列表失败：${listRes.status} ${await listRes.text()}`);
  }
  const existing = await listRes.json();
  /** @type {Record<string, number>} slug → id */
  const slugToId = Object.fromEntries(existing.map((p) => [p.slug, p.id]));

  let created = 0;
  let updated = 0;

  for (const post of posts) {
    const existingId = slugToId[post.slug];

    if (existingId) {
      // 已存在 → PUT 更新（upsert 语义，保持种子与源文件同步）
      const res = await fetch(`${API_BASE}/api/posts/${existingId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(post),
      });
      if (!res.ok) {
        console.error(`  ✗  ${post.title}（更新失败：${await res.text()}）`);
        continue;
      }
      console.log(`  ↺  ${post.title}（已更新）`);
      updated++;
    } else {
      // 不存在 → POST 创建
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(post),
      });
      if (!res.ok) {
        console.error(`  ✗  ${post.title}（创建失败：${await res.text()}）`);
        continue;
      }
      console.log(`  ✓  ${post.title}（已创建）`);
      created++;
    }
  }

  console.log(`\n完成：新增 ${created} 篇，更新 ${updated} 篇。`);
}

main().catch((err) => {
  console.error("种子脚本出错：", err.message);
  process.exit(1);
});
