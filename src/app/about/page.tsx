import PageTransition from "@/components/ui/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-ink mb-6">关于</h1>

        <div className="prose prose-lg max-w-none font-serif">
          <p>
            你好，我是殴达。
          </p>

          <p>
            销售出身，对投资、AI 和商业有持续的好奇心。这个博客是我的思考记录本——
            不追求正确，只追求真实。
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
