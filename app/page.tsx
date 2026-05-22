export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-6 text-center">
      
      {/* 1. Nombres */}
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-serif tracking-[0.25em] text-black ml-3">
          LUIS
        </h1>
        
        {/* La "y" en cursiva */}
        <span className="text-4xl md:text-5xl font-cursive text-black my-1">
          y
        </span>
        
        <h1 className="text-4xl md:text-5xl font-serif tracking-[0.25em] text-black ml-3">
          QUETZALLI
        </h1>
      </div>
      
      {/* 2. Ilustración */}
      <img 
        src="/building.svg" 
        alt="Academia Renacimiento y Trinitate" 
        className="w-72 md:w-80 h-auto my-6 mix-blend-multiply opacity-90"
      />
      
      {/* 3. Fecha */}
      <p className="text-base md:text-lg text-black font-serif tracking-[0.2em] uppercase mt-8 mb-4 ml-2">
        19 DE DICIEMBRE, 2026
      </p>
      
      {/* 4. Ubicación (Verde, Itálica y Subrayada) */}
      <div className="flex flex-col items-center text-salvia font-serif text-lg md:text-xl italic mb-16">
        <span className="underline decoration-1 underline-offset-4">
          Academia Renacimiento y
        </span>
        <span className="underline decoration-1 underline-offset-4 mt-1">
          Trinitate
        </span>
      </div>
      
      {/* 5. Footer RSVP en cursiva */}
      <div className="mt-2">
        <p className="text-4xl md:text-5xl font-cursive text-black border-b border-black pb-2 px-4">
          Confirma tu asistencia
        </p>
      </div>

    </main>
  );
}