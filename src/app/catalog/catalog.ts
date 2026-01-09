import {ProductType} from "@/interfaces/productType";

export async function getProductTypes(): Promise<ProductType[]> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL


    const res = await fetch(`${API_URL}/catalog/product-types`, {
        next: {
            revalidate: 86400,
            tags: ['product-types']
        }
    });

    if (!res.ok) throw new Error("Failed to fetch product types");
    return res.json();
}