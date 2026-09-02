export interface ImportRow {
  externalId: string;
  sku: string;
  name: string;
  brandName?: string;
  categoryPath: string[];
  shortDescription?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface ImportResultRow {
  sku: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
}

export interface ImportOptions {
  downloadImages: boolean;
  defaultStock: number;
  mode: 'upsert' | 'update-only' | 'create-only';
}