"use client"

interface HeaderProps {
  onNavigateToAuth?: () => void;
}

export default function Header({ onNavigateToAuth }: HeaderProps) {
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToAuth) {
      onNavigateToAuth();
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToAuth) {
      onNavigateToAuth();
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#landing" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground flex items-center justify-center">
          </div>
          <span className="font-medium text-foreground text-lg tracking-tight">Lighthouse</span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider">
            Features
          </a>
          <a href="#docs" className="text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider">
            Docs
          </a>
        </nav>

        {/* Auth Buttons - Minimal */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLoginClick}
            className="text-sm text-foreground/60 hover:text-foreground transition-colors uppercase tracking-wider"
          >
            Log In
          </button>
          <button
            onClick={handleSignUpClick}
            className="px-6 py-2 bg-foreground text-background text-sm font-medium uppercase tracking-wider transition-all duration-300 hover:bg-foreground/90"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  )
}
