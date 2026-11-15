import React, { useCallback, useEffect, useState } from 'react';
import { ArtworkUploadForm } from '../components/ArtworkUploadForm';

interface ArtAsset {
  id: string;
  title: string;
  artist_name: string;
  medium: string;
  dimensions: string | null;
  price_cents: number;
  image_url: string;
  status: 'available' | 'reserved' | 'sold';
}

const formatPrice = (priceCents: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
}).format(priceCents / 100);

const panelStyle: React.CSSProperties = {
  background: 'linear-gradient(145deg, rgba(20,20,28,.96), rgba(11,11,15,.96))',
  border: '1px solid rgba(255,255,255,.09)',
  borderRadius: '14px',
};

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArtworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/artworks');
      const data = await response.json() as { artworks?: ArtAsset[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to load the gallery.');
      setArtworks(Array.isArray(data.artworks) ? data.artworks : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load the gallery.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadArtworks(); }, [loadArtworks]);

  return (
    <main style={{ minHeight: '100%', padding: 'clamp(1rem, 4vw, 2.5rem)', background: '#070709', color: '#f4f4f5', fontFamily: 'sans-serif' }}>
      <header style={{ ...panelStyle, padding: 'clamp(1.25rem, 3vw, 2rem)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p style={{ margin: 0, color: '#c4b5fd', font: '11px ui-monospace, monospace', letterSpacing: '.16em' }}>MAX-ART // CREATORS STUDIO</p>
          <h1 style={{ margin: '.55rem 0', fontSize: 'clamp(1.5rem, 3vw, 2.15rem)', fontWeight: 600 }}>Sovereign Gallery</h1>
          <p style={{ margin: 0, color: '#a1a1aa', fontSize: '.88rem' }}>A curated collection of digital and physical works.</p>
        </div>
        <span style={{ padding: '.5rem .75rem', borderRadius: '6px', border: '1px solid rgba(167,139,250,.25)', background: 'rgba(139,92,246,.1)', color: '#c4b5fd', font: '10px ui-monospace, monospace' }}>JURREAUISM COLLECTION</span>
      </header>

      <ArtworkUploadForm onSuccess={() => { void loadArtworks(); }} />

      <section aria-labelledby="collection-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', margin: '1.5rem 0 .85rem' }}>
          <h2 id="collection-heading" style={{ margin: 0, fontSize: '1.1rem' }}>Available collection</h2>
          {!loading && !error && <span style={{ color: '#71717a', font: '11px ui-monospace, monospace' }}>{artworks.length} WORKS</span>}
        </div>
        {loading ? <p role="status" style={{ color: '#a1a1aa', padding: '2rem 0' }}>Loading artworks…</p> : error ? (
          <div role="alert" style={{ ...panelStyle, padding: '1.25rem', color: '#fca5a5' }}>
            <p>{error}</p>
            <button type="button" onClick={() => { void loadArtworks(); }} style={{ color: '#c4b5fd', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>Try again</button>
          </div>
        ) : artworks.length === 0 ? (
          <div style={{ ...panelStyle, padding: '2rem', color: '#a1a1aa' }}>No artworks are listed yet. Add the first work using the creator form above.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
            {artworks.map((art) => (
              <article key={art.id} style={{ ...panelStyle, overflow: 'hidden' }}>
                <div style={{ height: '230px', background: '#09090b', overflow: 'hidden' }}>
                  <img src={art.image_url} alt={art.title} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem' }}>
                    <span style={{ color: '#c4b5fd', font: '10px ui-monospace, monospace', textTransform: 'uppercase' }}>{art.medium}</span>
                    <span style={{ color: art.status === 'available' ? '#6ee7b7' : '#a1a1aa', font: '10px ui-monospace, monospace' }}>{art.status.toUpperCase()}</span>
                  </div>
                  <h3 style={{ margin: '.65rem 0 .35rem', fontSize: '1.05rem' }}>{art.title}</h3>
                  <p style={{ margin: 0, color: '#a1a1aa', fontSize: '.8rem' }}>By {art.artist_name}{art.dimensions ? ` · ${art.dimensions}` : ''}</p>
                  <p style={{ margin: '.9rem 0 0', color: '#a5b4fc', font: 'bold 14px ui-monospace, monospace' }}>{formatPrice(art.price_cents)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <p style={{ marginTop: '1.5rem', color: '#71717a', fontSize: '.75rem' }}>Gallery listings are informational. No checkout, payment, or DAT settlement is connected on this page.</p>
    </main>
  );
}
