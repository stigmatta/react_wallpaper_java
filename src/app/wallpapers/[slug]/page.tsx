import ProductClient from "@/components/ProductClient";
import { WallpaperProduct } from "@/interfaces/wallpaper";
import { notFound } from "next/navigation";

// Server Component: fetch product data and render client component
interface ProductPageProps {
  params: { slug: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const res = await fetch(`http://localhost:8080/wallpapers/${params.slug}`);
  if (!res.ok) return notFound();
  const product: WallpaperProduct = await res.json();
  if (!product) return notFound();
  return <ProductClient product={product} />;
}

// Required for static export: generate all possible slugs for pre-rendering
export async function generateStaticParams() {
  const res = await fetch("http://localhost:8080/wallpapers");
  if (!res.ok) return [];
  const wallpapers = await res.json();
  const wallpaperList = Array.isArray(wallpapers.content)
    ? wallpapers.content
    : [];
  return wallpaperList.map((wp: { slug: string }) => ({ slug: wp.slug }));
}
