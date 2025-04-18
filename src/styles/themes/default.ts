export const defaultTheme = {
  // ... 其他主题配置
  hotNews: {
    card: "bg-card border rounded-xl shadow-sm w-[300px] h-[300px]",
    header: "border-b p-2",
    tabButton: {
      base: "px-2.5 py-1 text-sm whitespace-nowrap transition-colors rounded-full",
      active: "bg-primary text-primary-foreground font-medium",
      inactive: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    },
    list: "p-2 space-y-1",
    item: {
      base: "flex items-center gap-2 px-1 py-1 transition-colors hover:bg-accent/30 rounded-lg",
      number: {
        base: "w-5 h-5 flex items-center justify-center rounded-full text-sm font-semibold",
        top1: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
        top2: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
        top3: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400",
        normal: "bg-muted/30 text-muted-foreground"
      }
    }
  }
} 