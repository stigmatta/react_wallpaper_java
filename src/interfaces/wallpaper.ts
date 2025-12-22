export interface WallpaperCategory {
  id: string;
  image: string;
  name: string;
  salePrice: number;
}

export interface WallpaperProduct {
  id: string;
  name: string;
  article: string;
  basePrice: number;
  salePrice?: number;
  image: string;
  description: string;
  density: number;
  waterproof: boolean;
  rooms: string[];
  slug: string;
}
