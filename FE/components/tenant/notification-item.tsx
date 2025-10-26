interface NotificationItemProps {
  icon: string
  title: string
  message: string
  timeAgo: string
  isNew: boolean
}

export function NotificationItem({ icon, title, message, timeAgo, isNew }: NotificationItemProps) {
  return (
    <div className={`flex gap-3 p-3 border-b-2 border-black transition-colors hover:bg-muted/30 cursor-pointer ${isNew ? "bg-primary/10" : ""}`}>
      <div className="text-xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="font-bold text-sm">{title}</div>
          {isNew && (
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold neo-border">
              MỚI
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{message}</div>
        <div className="text-xs text-muted-foreground mt-1">{timeAgo}</div>
      </div>
    </div>
  )
}
