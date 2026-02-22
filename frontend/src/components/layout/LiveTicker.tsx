import { useEffect, useState, useRef } from "react";
import {
  ExhibitionService,
  type Exhibition,
} from "@/api/services/exhibitionService";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface TickerItem {
  id: string;
  type: "LIVE" | "COLLECTION" | "UPCOMING";
  label: string;
  meta: string; // Artist name or Item count
  viewers?: number;
  timeLabel?: string;
}

export const LiveTicker = () => {
  const navigate = useNavigate();
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchExhibitions();
    const interval = setInterval(fetchExhibitions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchExhibitions = async () => {
    try {
      const res = await ExhibitionService.getPublicExhibitions();
      const all = res.data as Exhibition[];

      // 1. Filter out anything archived
      const activeExhibitions = all.filter((ex) => ex.status !== "ARCHIVED");

      const mappedItems: TickerItem[] = activeExhibitions.map((ex) => {
        // Handle LIVE/UPCOMING types
        if (ex.type === "LIVE") {
          const isLive = ex.status === "LIVE";
          return {
            id: ex.exhibition_id,
            type: isLive ? "LIVE" : "UPCOMING",
            label: ex.title,
            meta: ex.author?.name || "Independent",
            viewers: ex.live_details?.current_viewers,
            timeLabel: !isLive
              ? `Starts ${new Date(ex.start_date).toLocaleDateString()}`
              : undefined,
          };
        }

        // Handle CLASSIFICATION types (Collections)
        return {
          id: ex.exhibition_id,
          type: "COLLECTION",
          label: ex.title,
          meta: `${ex.artworks?.length || 0} Records`,
        };
      });

      setTickerData(mappedItems);
    } catch (err) {
      console.error("Ticker fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Animation Logic
  useEffect(() => {
    if (!tickerRef.current || tickerData.length === 0 || isPaused) return;

    const scrollContainer = tickerRef.current;
    let scrollPosition = 0;
    const scrollSpeed = 0.6;

    const scroll = () => {
      if (!scrollContainer || isPaused) {
        animationRef.current = requestAnimationFrame(scroll);
        return;
      }
      scrollPosition += scrollSpeed;
      if (scrollPosition >= scrollContainer.scrollWidth / 3) {
        scrollPosition = 0;
      }
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [tickerData.length, isPaused]);

  const handleItemClick = (item: TickerItem) => {
    if (item.type === "LIVE") {
      navigate(`/exhibitions/${item.id}/watch`);
    } else {
      navigate(`/exhibitions/${item.id}`);
    }
  };

  if (loading || tickerData.length === 0) return null;

  return (
    <div
      className="bg-slate-900 text-white py-3 overflow-hidden border-b border-white/5 relative z-50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={tickerRef}
        className="flex whitespace-nowrap will-change-transform"
      >
        {/* Triple duplicate for infinite loop */}
        {[...tickerData, ...tickerData, ...tickerData].map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center mx-12 group cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            {/* Status Indicator Dots */}
            <div className="flex items-center gap-2 mr-3">
              {item.type === "LIVE" ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              ) : (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${item.type === "COLLECTION" ? "bg-indigo-500" : "bg-amber-500"}`}
                />
              )}
            </div>

            {/* Label and Content */}
            <div className="flex items-center gap-2 text-[9px] tracking-[0.3em] font-bold uppercase">
              <span
                className={
                  item.type === "LIVE"
                    ? "text-red-500"
                    : item.type === "COLLECTION"
                      ? "text-indigo-400"
                      : "text-amber-400"
                }
              >
                {item.type}:
              </span>
              <span className="text-white group-hover:text-indigo-300 transition-colors">
                {item.label}
              </span>
              <span className="text-white/40 font-light lowercase tracking-normal italic ml-1">
                — {item.meta}
              </span>

              {item.type === "LIVE" && item.viewers !== undefined && (
                <span className="ml-2 text-red-500/80 font-mono text-[8px]">
                  ({item.viewers} watching)
                </span>
              )}

              {item.timeLabel && (
                <span className="ml-2 text-amber-500/80">{item.timeLabel}</span>
              )}
            </div>

            <span className="ml-12 text-white/10 text-[6px]">●</span>
          </div>
        ))}
      </div>
    </div>
  );
};
