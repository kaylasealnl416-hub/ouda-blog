// 标签徽章

interface TagProps {
  label: string;
}

export default function Tag({ label }: TagProps) {
  return (
    <span className="inline-block text-xs text-muted bg-border-light/50 px-2 py-0.5 rounded">
      #{label}
    </span>
  );
}
