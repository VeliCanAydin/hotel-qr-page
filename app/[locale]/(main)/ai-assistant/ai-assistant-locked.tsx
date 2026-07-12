import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { Lock, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"

export default function AIAssistantLocked({ locale }: { locale: string }) {
  const t = useTranslations("ai")

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 relative overflow-hidden bg-background">
      {/* Decorative gradient backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 border bg-card/60 backdrop-blur-xl text-card-foreground shadow-2xl rounded-3xl p-8 text-center transition-all duration-300 hover:shadow-primary/5 hover:border-primary/20">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative animate-[pulse_3s_infinite_ease-in-out]">
          <Lock className="w-8 h-8 text-primary" />
          <Sparkles className="w-4 h-4 text-primary absolute -top-1 -right-1 animate-bounce" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-3 text-foreground">
          {t("lockedTitle")}
        </h2>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          {t("lockedDescription")}
        </p>

        <Link href={`/login?redirect=/ai-assistant`} passHref>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/95 rounded-2xl font-bold py-6 text-base transition-all duration-300 shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]">
            {t("signInButton")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
