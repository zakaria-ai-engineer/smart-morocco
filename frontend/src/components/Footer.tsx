export function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-gray-400 py-16 border-t border-white/5 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4 lg:gap-8">

          {/* Brand & Socials */}
          <div className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Morocco</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium AI-powered travel planning for the ultimate luxury Moroccan experience.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M14 8h2V5h-2c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.2l.8-3H13V9c0-.6.4-1 1-1Z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm10.2 1.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/20">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.2 2H21l-6.4 7.4L22 22h-6.7l-4.6-6.1L5.4 22H2.6l6.9-7.9L2 2h6.9l4.2 5.6L18.2 2Zm-1.2 18h1.5L7 4H5.4l11.6 16Z" /></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold">Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Plan Your Trip</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Destinations */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold">Destinations</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Marrakech</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Casablanca</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chefchaouen</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sahara Desert</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-white font-semibold">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">✉</span>
                <a href="mailto:hello@smartmorocco.com" className="hover:text-white transition-colors">hello@smartmorocco.com</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-brand-accent">☎</span>
                <a href="tel:+212700000000" className="hover:text-white transition-colors">+212 700 000 000</a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-accent mt-0.5">📍</span>
                <span>Gueliz, Marrakech<br />Morocco</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} Smart Morocco Travel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
