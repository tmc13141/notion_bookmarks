export const cyberpunkTheme = {
  // ... 其他主题配置
  hotNews: {
    card: "bg-card border border-primary w-[300px] h-[300px]",
    header: "border-b border-primary p-2",
    tabButton: {
      base: "px-2.5 py-1 text-sm whitespace-nowrap transition-colors",
      active: "bg-primary/10 text-primary border border-primary",
      inactive: "text-muted-foreground hover:text-foreground hover:border hover:border-primary/50"
    },
    list: "p-2 space-y-1",
    item: {
      base: "flex items-center gap-2 px-1 py-1 transition-colors hover:bg-primary/5",
      number: {
        base: "w-5 h-5 flex items-center justify-center text-sm font-semibold border",
        top1: "border-red-500 text-red-500",
        top2: "border-orange-500 text-orange-500",
        top3: "border-yellow-500 text-yellow-500",
        normal: "border-muted-foreground text-muted-foreground"
      }
    }
  }
} 