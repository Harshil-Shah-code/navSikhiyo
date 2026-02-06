import BlogGrid from "@/components/home/BlogGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-white dark:bg-slate-900 border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            NavSikhyo
          </h1>
          {/* <nav className="hidden md:flex space-x-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </nav> */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Explore Our Latest Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover insights on technology, coding, lifestyle, and design.
            Curated specifically for the modern developer.
          </p>
        </div>

        <BlogGrid />
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NavSikhyo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
