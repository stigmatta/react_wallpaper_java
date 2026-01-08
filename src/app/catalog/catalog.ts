import { ProductType } from "@/interfaces/productType";

export async function getProductTypes(): Promise<ProductType[]> {
    const res = await fetch("http://localhost:8080/catalog/product-types", {
        next: {
            revalidate: 86400,
            tags: ['product-types']
        }
    });

    if (!res.ok) throw new Error("Failed to fetch product types");
    return res.json();
}