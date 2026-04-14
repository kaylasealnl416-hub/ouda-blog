// 工具函数

/** 格式化日期为 "2026.04.10" 格式 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 格式化文章编号为 "01" 格式 */
export function formatId(id: number): string {
  return String(id).padStart(2, "0");
}
