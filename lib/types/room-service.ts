export interface RoomServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'food' | 'beverages' | 'other-services';
    allergens?: string[];
    isAvailable?: boolean;
}

export const categoryLabels: Record<RoomServiceItem['category'], string> = {
    'food': 'Food',
    'beverages': 'Beverages',
    'other-services': 'Other Services',
}
