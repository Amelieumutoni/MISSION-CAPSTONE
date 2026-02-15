const TICKER_ITEMS = [
  {
    id: 1,
    type: "LIVE",
    label: "Imigongo Masterclass",
    artist: "Samuel Bakame",
  },
  {
    id: 2,
    type: "AUCTION",
    label: "Royal Urugori Crown",
    artist: "Closing in 2h",
  },
  {
    id: 3,
    type: "EVENT",
    label: "The Weaving of Agaseke",
    artist: "Divine Ineza",
  },
];

export const LiveTicker = () => {
  return (
    <div className="bg-slate-900 text-white py-2.5 overflow-hidden whitespace-nowrap border-b border-white/5">
      <div className="flex animate-marquee hover:pause cursor-default">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center mx-12 group">
            {item.type === "LIVE" && (
              <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse mr-3 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            )}
            <span className="uppercase text-[9px] tracking-[0.4em] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-slate-400 mr-2">{item.type}:</span>
              {item.label}{" "}
              <span className="italic opacity-60 ml-1">by {item.artist}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
