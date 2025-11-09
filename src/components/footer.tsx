"use client"

export default function Footer() {
  return (
    <footer className="bg-background border-t border-foreground/10 px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-foreground flex items-center justify-center">
              </div>
              <span className="font-medium text-foreground">Lighthouse</span>
            </div>
            <p className="text-xs text-foreground/50 font-light">
              AI observability for reliable systems
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-foreground mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#features" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  Features
                </a>
              </li>
              <li>
                <a href="#docs" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-foreground mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  ***
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  ***
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium text-foreground mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  ***
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors font-light">
                  ***
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="h-px bg-foreground/10 mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-foreground/50">
          <p className="font-light">&copy; 2025 Lighthouse. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors font-light">
              Devpost
            </a>
            <a href="#" className="hover:text-foreground transition-colors font-light">
              Github
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
