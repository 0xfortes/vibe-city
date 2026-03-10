'use client';

export function OrbBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Green orb — top right */}
      <div
        className="orb-animate absolute -top-[10%] -right-[5%] h-[600px] w-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,170,0.08) 0%, transparent 70%)',
          animation: 'orbFloat1 20s ease-in-out infinite',
        }}
      />
      {/* Purple orb — bottom left */}
      <div
        className="orb-animate absolute -left-[8%] bottom-[5%] h-[500px] w-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(120,80,255,0.06) 0%, transparent 70%)',
          animation: 'orbFloat2 25s ease-in-out infinite',
        }}
      />
      {/* Pink orb — center */}
      <div
        className="orb-animate absolute top-[40%] left-[50%] h-[300px] w-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,100,200,0.05) 0%, transparent 70%)',
          animation: 'orbFloat3 18s ease-in-out infinite',
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px',
        }}
      />
    </div>
  );
}
