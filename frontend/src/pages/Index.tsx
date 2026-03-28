import React, { useEffect, useState } from "react";

// Layout sections
import HeroSection from "@/components/layout/Hero";
import LiveExhibitsSection from "@/components/layout/LiveExhibitions";
import TrendingSection from "@/components/layout/Trending";
import ArtistsSection from "@/components/layout/Artists";
import EditorialSection from "@/components/layout/EditorialSection";
import CollectionsSection from "@/components/layout/CollectionSection";
import StatItem from "@/components/layout/StatItem";

// Public services only
import ArtworkService from "@/api/services/artworkService";
import { ExhibitionService } from "@/api/services/exhibitionService";
import Artists from "@/api/services/artistService";

export default function Index() {
  const [stats, setStats] = useState({
    artists: 0,
    artworks: 0,
    collections: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Artworks & Artists (public endpoint)
        const artworksRes = await ArtworkService.getArtworks();
        const artworks = Array.isArray(artworksRes)
          ? artworksRes
          : artworksRes?.data || [];

        // Count unique active artists from the artworks list
        const activeArtistIds = await Artists.getAllArtists();
        console.log(activeArtistIds);
        const artistsCount = activeArtistIds?.count ?? 0;

        // 2. Collections (public endpoint)
        const collectionsRes = await ExhibitionService.getPublicExhibitions({
          type: "CLASSIFICATION",
        });
        const collectionsCount = collectionsRes?.data?.length || 0;

        setStats({
          artists: artistsCount,
          artworks: artworks.length,
          collections: collectionsCount,
        });
      } catch (err) {
        console.error("Failed to fetch homepage stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <HeroSection />
      <LiveExhibitsSection />
      <EditorialSection />
      <TrendingSection />
      <ArtistsSection />
      <CollectionsSection />

      {/* Stats section – three columns (public data only) */}
      <section className="px-8 py-20 border-t border-b border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
          <StatItem
            number={stats.artists === 0 ? "0" : stats.artists}
            label="Artists"
          />
          <StatItem
            number={stats.artworks === 0 ? "0" : stats.artworks}
            label="Works Documented"
          />
          <StatItem
            number={
              stats.collections === 0 ? "0" : stats.collections.toString()
            }
            label="Active Collections"
          />
        </div>
      </section>
    </>
  );
}
