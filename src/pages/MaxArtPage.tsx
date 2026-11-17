import React, { useEffect, useState } from 'react';
import { GalleryWall } from '../components/GalleryWall';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image_url: string;
  category: string;
  description: string;
  created_at?: string;
}

export function MaxArtPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/artworks')
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setArtworks(data.artworks || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Extract unique categories dynamically from fetched artworks
  const categories = ['All', ...Array.from(new Set(artworks.map((art) => art.category)))];

  // Filter artworks based on active category selection
  const filteredArtworks = selectedCategory === 'All'
    ? artworks
    : artworks.filter((art) => art.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10 space-y-4">
        <div className="text-amber-500 font-mono tracking-widest text-xs">MAX-ART // CREATORS STUDIO</div>
        <h1 className="text-4xl font-extrabold tracking-tight">Sovereign Gallery</h1>
        <p className="text-neutral-400 text-sm max-w-xl">
          A curated collection of digital and physical works. Explore the JURREAUISM catalog across architectural substrates.
        </p>

        {/* Category Filter Tabs */}
        {!loading && !error && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-mono text-xs transition-all border ${
                  selectedCategory === cat
                    ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {loading && (
          <div className="text-center py-20 font-mono text-neutral-500 animate-pulse">
            LOADING SOVEREIGN CATALOG...
          </div>
        )}

        {error && (
          <div className="bg-red-950/40 border border-red-900/60 p-6 rounded-xl text-red-300 font-mono text-sm space-y-2">
            <div className="font-bold tracking-wide">CATALOG UNAVAILABLE</div>
            <div className="text-xs text-red-400">{error}</div>
            <div className="text-[11px] text-neutral-400 pt-2">
              Ensure D1 migrations have been applied to your remote database via the Cloudflare dashboard.
            </div>
          </div>
        )}

        {!loading && !error && (
          <GalleryWall artworks={filteredArtworks} />
        )}
      </div>
    </div>
  );
        }
