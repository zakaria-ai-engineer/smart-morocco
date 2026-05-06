interface Props {
  title: string;
  icon: string;
  description: string;
  accentColor?: string; /* e.g. "#D4AF37" */
}

export function ActivityCard({ title, icon, description, accentColor = "#D4AF37" }: Props) {
  const glowStyle = {
    "--glow": accentColor,
    transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
  } as React.CSSProperties;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl cursor-pointer p-7 flex flex-col gap-5 glass"
      style={glowStyle}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(-6px)";
        el.style.borderColor = `${accentColor}44`;
        el.style.boxShadow = `0 20px 48px rgba(0,0,0,0.4), 0 0 24px ${accentColor}22`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(255,255,255,0.10)";
        el.style.boxShadow = "none";
      }}
    >
      {/* Ambient glow blob (top-right) */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300"
        style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3
          className="text-base font-bold text-white mb-2 transition-colors duration-300"
          style={{ color: undefined }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accentColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
        >
          {title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      </div>

      {/* Arrow chip */}
      <div className="flex justify-end">
        <span
          className="w-8 h-8 rounded-full glass flex items-center justify-center text-sm group-hover:translate-x-1 transition-transform duration-300"
          style={{ color: accentColor }}
        >
          →
        </span>
      </div>
    </div>
  );
}
