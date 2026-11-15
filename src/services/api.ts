export type InventoryCategory = 'artwork' | 'escrow' | 'substrate' | 'hardware';
export type InventoryStatus = 'active' | 'reserved' | 'sold';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  /** Price in the store's ZK unit (price_zk from the API). */
  price: number;
  status: InventoryStatus;
  provenance_hash?: string;
  created_at: string;
}

type StoreInventoryRow = {
  id: string;
  title?: string;
  name?: string;
  category?: string;
  price_zk?: number | string;
  price?: number | string;
  status?: string;
  metadata_hash?: string;
  provenance_hash?: string;
  created_at?: string;
};

const categories = new Set<InventoryCategory>(['artwork', 'escrow', 'substrate', 'hardware']);

function normalizeItem(row: StoreInventoryRow): InventoryItem {
  const category = row.category?.toLowerCase();
  const status = row.status?.toLowerCase();

  return {
    id: row.id,
    name: row.name ?? row.title ?? 'Untitled item',
    category: categories.has(category as InventoryCategory)
      ? (category as InventoryCategory)
      : 'artwork',
    price: Number(row.price_zk ?? row.price ?? 0),
    status: status === 'reserved'
      ? 'reserved'
      : status === 'sold' || status === 'sold_out'
        ? 'sold'
        : 'active',
    provenance_hash: row.provenance_hash ?? row.metadata_hash,
    created_at: row.created_at ?? '',
  };
}

export const ApiClient = {
  async getInventory(category?: string, status?: string): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (status) params.set('status', status);

    // The current Worker returns { items } and does not implement query filters,
    // so apply optional filters here after normalizing its D1 row format.
    const query = params.toString();
    const res = await fetch(`/api/v1/store/inventory${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch store inventory from D1 ledger');

    const json = await res.json() as { items?: StoreInventoryRow[]; data?: StoreInventoryRow[] };
    let items = (json.items ?? json.data ?? []).map(normalizeItem);
    if (category) items = items.filter((item) => item.category === category.toLowerCase());
    if (status) items = items.filter((item) => item.status === status.toLowerCase());
    return items;
  },
};
