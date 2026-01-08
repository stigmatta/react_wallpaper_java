export interface OrderItemDTO {
    productId: string;
    productType: string;
    quantity: number;
    purchasePrice: number; // Renamed from price
}

export interface OrderDTO {
    id: string;
    items: OrderItemDTO[];
    totalPrice: number; // Renamed from price
    createdAt: string; // Renamed from orderDate
    totalItemsCount: number;
}

export interface OrderItem extends Omit<OrderItemDTO, 'purchasePrice'> {
    productName: string;
    imageUrl?: string;
    price: number; // mapped from purchasePrice
    totalPrice: number;
}

export interface Order {
    id: string;
    orderDate: string;
    totalAmount: number;
    items: OrderItem[];
}
