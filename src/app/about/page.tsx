import PageTransition from "@/components/ui/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-ink mb-6">关于</h1>

        <div className="prose prose-lg max-w-none font-serif">
          <p>
            你好，我是小欧，互联网老兵，入行 20 多年。
          </p>

          <p>
            2000 年从 3721 起步做渠道销售，之后三次参与创业——联合创办过网络营销公司（后被全资收购）、建站 SaaS 公司（后被阿里收购）。带过 20 年全国渠道体系，管理过 7000+ 家渠道服务商。中间还孵化过一家在线旅游公司——榴莲旅游，从零搭团队、跑市场。
          </p>

          <p>
            2018 年再次创业，做跨境电商代运营，一年多营收过亿，服务 3000+ 家中小制造企业出海东南亚。
          </p>

          <p>
            现在在学 AI 编程，用 Claude Code 从零搭项目，把过去 20 年对销售、产品、商业的理解，结合 AI 工具重新实践一遍。这个博客就是记录这个过程的地方。
          </p>

          <h2 className="font-display">四个主题</h2>

          <ul>
            <li>
              <strong>📈 股票</strong>：A股短线交易的情绪周期研究、龙头战法实践
            </li>
            <li>
              <strong>🤖 AI</strong>：AI Agent 产品思考、工具使用心得、技术趋势
            </li>
            <li>
              <strong>💼 销售</strong>：B2B 大客户销售方法论、从销售到产品的跨界思考
            </li>
            <li>
              <strong>☕ 杂谈</strong>：阅读笔记、个人成长、随想
            </li>
          </ul>

          <h2 className="font-display">为什么写博客</h2>

          <p>
            写作是最好的思考工具。很多想法在脑子里觉得很清楚，
            写下来才发现漏洞百出。这个博客的目的不是教别人什么，
            而是逼自己把模糊的感觉变成清晰的文字。
          </p>

          <p>
            如果你也对这些话题感兴趣，欢迎交流。
          </p>

          <blockquote>
            <p>老登新生，从零开始，保持好奇，持续学习。</p>
          </blockquote>

          <h2 className="font-display">联系</h2>

          <ul>
            <li>
              <strong>GitHub</strong>：<a href="https://github.com/kaylasealnl416-hub" target="_blank" rel="noopener noreferrer">@kaylasealnl416-hub</a>
            </li>
          </ul>
        </div>
      </div>
    </PageTransition>
  );
}
