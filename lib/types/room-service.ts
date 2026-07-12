export interface RoomServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    allergens?: string[];
    isAvailable?: boolean;
}

export interface RoomServiceCategory {
    id: string;
    label: string;
    orderIndex: number;
}
