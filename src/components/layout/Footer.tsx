// 页脚

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border py-8 mt-16">
      <div className="max-w-3xl mx-auto px-6 text-center text-sm text-muted">
        <p>© {year} 殴达的博客</p>
      </div>
    </footer>
  );
}
