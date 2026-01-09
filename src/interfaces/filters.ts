export interface BaseFilterState {
    name?: string;
    categoryId?: string;
    basePrice?: number;

    [key: string]: string | number | undefined | string[];
}