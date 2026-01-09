import ProductClient from "@/components/ProductClient";
import {ExtraFeature, WallpaperProduct} from "@/interfaces/product";
import {notFound} from "next/navigation";
import {ProductType} from "@/interfaces/productType";

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export const dynamicParams = true;


export default async function ProductPage({params}: ProductPageProps) {
    const {slug} = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL


    const [productRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/wallpapers/${slug}`, {
            next: {revalidate: 3600},
        }),
        fetch(`${API_URL}/catalog/product-types`, {
            next: {revalidate: 86400},
        }),
    ]);

    if (!productRes.ok) return notFound();

    const product: WallpaperProduct = await productRes.json();
    const allProductTypes: ProductType[] = await typesRes.json();

    const wallpaperType = allProductTypes.find(
        (t) => t.name.toUpperCase() === "WALLPAPER"
    );

    let features: ExtraFeature[] = [];
    if (wallpaperType) {
        const featuresRes = await fetch(
            `${API_URL}/catalog/features/${wallpaperType.id}`
        );
        if (featuresRes.ok) {
            features = await featuresRes.json();
        }
    }

    return (
        <ProductClient
            product={product}
            globalFeatures={features}
            productType={wallpaperType}
        />
    );
}

export async function generateStaticParams() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    try {
        const res = await fetch(`${API_URL}/wallpapers?size=1000`);
        if (!res.ok) return [];
        const data = await res.json();

        let productList: { slug: string }[] = [];
        if (data.products && Array.isArray(data.products.content)) {
            productList = data.products.content;
        } else if (Array.isArray(data.content)) {
            productList = data.content;
        } else if (Array.isArray(data)) {
            productList = data;
        }

        return productList.map((p) => ({
            slug: p.slug,
        }));
    } catch {
        return [];
    }
}
