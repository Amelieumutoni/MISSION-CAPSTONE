import { DARK_JOURNAL_ARTICLES } from "@/utils/consts";

export default function DarkJournalSection() {
  return (
    <section className="px-8 py-24 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-slate-500 mb-3 font-bold">
              Stories & Insights
            </h3>
            <h4 className="text-5xl font-serif tracking-tight">
              From The Journal
            </h4>
          </div>
          <button className="text-[10px] uppercase tracking-widest font-black border-b border-slate-700 pb-1 hover:border-white hover:text-white text-slate-400 transition-all">
            View All Stories
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {DARK_JOURNAL_ARTICLES.map((article) => (
            <ArticleCard key={article.title} {...article} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({
  category,
  title,
  author,
  readTime,
  date,
  image,
}: {
  category: string;
  title: string;
  author: string;
  readTime: string;
  date: string;
  image: string;
}) {
  return (
    <div className="group cursor-pointer">
      <div className="aspect-16/10 bg-slate-800 mb-8 overflow-hidden relative">
        {/* Real Image with Dark Overlay */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100 grayscale-30 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold flex items-center gap-3">
          <span className="w-6 h-px bg-slate-700 group-hover:w-10 group-hover:bg-white transition-all duration-500" />
          {category}
        </p>

        <h5 className="font-serif text-3xl mb-4 group-hover:text-slate-300 transition-colors leading-tight tracking-tight">
          {title}
        </h5>

        <div className="flex items-center gap-4 text-[9px] text-slate-500 uppercase tracking-widest font-medium">
          <span className="text-slate-300">{author}</span>
          <span>•</span>
          <span>{readTime}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}
