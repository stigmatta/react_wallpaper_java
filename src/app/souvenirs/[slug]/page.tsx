import SouvenirClient from "@/components/SouvenirClient";
import {ExtraFeature, SouvenirProduct} from "@/interfaces/product";
import {notFound} from "next/navigation";
import {ProductType} from "@/interfaces/productType";

// Server Component: fetch product data and render client component
interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export default async function SouvenirPage({params}: ProductPageProps) {
    const {slug} = await params;
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [productRes, typesRes] = await Promise.all([
        fetch(`${API_URL}/souvenirs/${slug}`),
        fetch(`${API_URL}/catalog/product-types`),
    ]);

    if (!productRes.ok) return notFound();

    // Explicitly type the result as SouvenirProduct from interface
    const product: SouvenirProduct = await productRes.json();
    if (!product) return notFound();

    let features: ExtraFeature[] = [];
    let souvenirType: ProductType | undefined;

    if (typesRes.ok) {
        const allProductTypes: ProductType[] = await typesRes.json();
        souvenirType = allProductTypes.find(
            (t) => t.name.toUpperCase() === "SOUVENIR"
        );

        if (souvenirType) {
            const featuresRes = await fetch(
                `${API_URL}/catalog/features/${souvenirType.id}`
            );
            if (featuresRes.ok) {
                features = await featuresRes.json();
            }
        }
    }

    // Use SouvenirClient instead of ProductClient
    return (
        <SouvenirClient
            product={product}
            extraFeatures={features}
            productType={souvenirType}
        />
    );
}

// Required for static export: generate all possible slugs for pre-rendering
export async function generateStaticParams() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    try {
        const res = await fetch(`${API_URL}/souvenirs?size=1000`);
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
