export function Footer() {
  return (
    <footer className="w-full flex-shrink-0 bg-transparent mb-4 mt-0 max-w-6xl mx-auto">
      <div className="flex flex-col items-center justify-center px-4 py-2 text-[11px] text-gray-400 gap-1 text-center">
        <div className="font-medium text-gray-500">
          Maily v1.0 • <a href="https://github.com/dheiro/maily" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 transition-colors">GitHub</a>
        </div>
        <div className="flex items-center gap-1.5 justify-center mt-0.5">
          <span>Powered by Cloudflare Workers</span>
        </div>
      </div>
    </footer>
  )
}
