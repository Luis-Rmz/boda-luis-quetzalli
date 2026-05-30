export default function Home() {
  return (
    <main className="relative h-dvh flex flex-col items-center justify-center px-10 text-center overflow-hidden"
      style={{ backgroundColor: '#F6F4F0' }}>

      <div className="pointer-events-none absolute inset-5 sm:inset-7">
        <span className="absolute top-0 left-0    border-t border-l border-salvia/40 animate-corner" />
        <span className="absolute top-0 right-0   border-t border-r border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 left-0  border-b border-l border-salvia/40 animate-corner" />
        <span className="absolute bottom-0 right-0 border-b border-r border-salvia/40 animate-corner" />
      </div>

      <div className="flex flex-col items-center gap-5 max-w-sm">
        <p className="font-serif text-xs tracking-[0.4em] uppercase text-salvia animate-fade-up"
          style={{ animationDelay: '0.5s' }}>
          Luis &amp; Quetzalli
        </p>

        <div className="flex items-center gap-4 w-4/5 animate-expand-x" style={{ animationDelay: '1s' }}>
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[9px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        <p className="font-cursive text-3xl sm:text-4xl text-black/85 animate-fade-up"
          style={{ animationDelay: '1.3s' }}>
          Invitación personal
        </p>

        <p className="font-serif text-sm text-black/45 leading-relaxed animate-fade-up"
          style={{ animationDelay: '1.8s' }}>
          Esta invitación es personal. Si recibiste un enlace, úsalo para acceder.
        </p>

        <div className="flex items-center gap-4 w-4/5 animate-expand-x" style={{ animationDelay: '2.2s' }}>
          <div className="flex-1 h-px bg-black/20" />
          <span className="text-black/30 text-[9px]">◇</span>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        <p className="font-serif text-xs text-black/25 tracking-[0.25em] animate-fade-up"
          style={{ animationDelay: '2.5s' }}>
          19 · 12 · 2026
        </p>
      </div>
    </main>
  );
}
