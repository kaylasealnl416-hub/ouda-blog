import Link from "next/link";
import { CATEGORY_META, type Category } from "@/data/posts";

const tabs: { key: string; label: string }[] = [
  { key: "all", label: "全部" },
  ...Object.entries(CATEGORY_META).map(([key, val]) => ({
    key,
    label: `${val.emoji} ${val.label}`,
  })),
];

interface CategoryTabsProps {
  currentCategory?: Category;
}

export default function CategoryTabs({ currentCategory }: CategoryTabsProps) {
  const current = currentCategory ?? "all";

  return (
    <div className="flex items-center justify-between pb-1 -mb-px">
      {tabs.map((tab) => {
        const isActive = current === tab.key;
        const href = tab.key === "all" ? "/" : `/?category=${tab.key}`;
        return (
          <Link
            key={tab.key}
            href={href}
            className={`category-tab whitespace-nowrap px-2 sm:px-4 py-2 text-xs sm:text-sm ${
              isActive
                ? "active text-accent font-medium"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
