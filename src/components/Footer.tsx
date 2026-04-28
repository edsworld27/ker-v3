export default function Footer() {
  return (
    <footer className="w-full bg-brand-black border-t border-white/5">
      <div className="w-full max-w-7xl xl:max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-12 xl:px-16 py-14 sm:py-16 lg:py-20">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 xl:gap-14 mb-14 sm:mb-16">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-display text-2xl sm:text-3xl font-bold text-brand-cream mb-1.5">
              LUV <span className="text-brand-orange">&amp;</span> KER
            </div>
            <div className="text-[10px] tracking-[0.28em] text-brand-cream/30 uppercase mb-5">Odo by Felicia</div>
            <p className="text-sm xl:text-base text-brand-cream/40 leading-relaxed max-w-xs">
              Pure. Sacred. Alive. Ghanaian heritage skincare for those who demand honesty from everything they put on their skin.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Shop</h4>
            <ul className="space-y-3">
              {["Odo Original","Odo Radiance","The Ritual Set","Gift Cards"].map((item) => (
                <li key={item}><a href="#shop" className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Company</h4>
            <ul className="space-y-3">
              {["Our Story","Ingredients","Sustainability","Press"].map((item) => (
                <li key={item}><a href="#" className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div>
            <h4 className="text-xs tracking-[0.25em] uppercase text-brand-cream/40 mb-5">Support</h4>
            <ul className="space-y-3 mb-8">
              {["Shipping & Returns","FAQ","Contact Us","Privacy Policy"].map((item) => (
                <li key={item}><a href="#" className="text-sm xl:text-base text-brand-cream/60 hover:text-brand-cream transition-colors">{item}</a></li>
              ))}
            </ul>
            <p className="text-xs text-brand-cream/40 mb-3">Stay connected</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 min-w-0 bg-brand-black-card border border-white/10 rounded-lg px-4 py-3 text-xs xl:text-sm text-brand-cream placeholder:text-brand-cream/20 focus:outline-none focus:border-brand-orange/40 transition-colors"
              />
              <button className="shrink-0 px-4 py-3 rounded-lg bg-brand-orange hover:bg-brand-orange-light transition-colors text-sm text-white font-semibold">→</button>
            </div>
          </div>
        </div>

        <div className="adinkra-line mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs xl:text-sm text-brand-cream/25 text-center">
          <p>© 2025 Luv &amp; Ker Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Made with</span><span className="text-brand-orange">♥</span><span>from Ghana to the world</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5">
            {["Instagram","TikTok","Pinterest"].map((s) => (
              <a key={s} href="#" className="hover:text-brand-cream transition-colors">{s}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
