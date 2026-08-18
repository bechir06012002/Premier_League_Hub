import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/contexts/LanguageContext"

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false)
  const { t } = useTranslation()

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? t.auth.hidePassword : t.auth.showPassword}
        aria-pressed={visible}
        className="absolute inset-y-0 right-1 flex items-center rounded-md px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
