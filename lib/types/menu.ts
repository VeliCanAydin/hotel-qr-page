export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    isVegetarian?: boolean;
    category: string;
    image?: string; // blob proxy URL, fetched from menu_item_images table
    allergens?: string[];
}
