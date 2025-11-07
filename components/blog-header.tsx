import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function BlogHeader() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-semibold tracking-tight">AI Insights</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-foreground hover:text-accent transition-colors font-medium">
              AI
            </Link>
            <Link href="/articles" className="text-muted-foreground hover:text-foreground transition-colors">
              12 articles
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search articles..." className="pl-9 bg-muted/50" />
          </div>
        </div>
      </div>
    </header>
  )
}
