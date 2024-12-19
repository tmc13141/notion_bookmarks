'use client';


export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center gap-4 md:h-16 md:flex-row md:justify-between">
        <p className="text-sm text-muted-foreground">
          Built with Next.js and Notion
        </p>
        <p className="text-sm text-muted-foreground">
          © 2024 Your Name. All rights reserved.
        </p>
      </div>
    </footer>
  )
}