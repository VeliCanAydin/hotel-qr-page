export interface RoomServiceItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'food' | 'beverages' | 'other-services';
}

export const roomServiceItems: RoomServiceItem[] = [
    // Food
    {
        id: 'club-sandwich',
        name: 'Club Sandwich',
        description: 'Triple-decker with grilled chicken, bacon, lettuce, tomato, and mayo. Served with fries.',
        price: 18.00,
        category: 'food',
    },
    {
        id: 'caesar-salad',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce, parmesan cheese, croutons, and our signature Caesar dressing.',
        price: 14.00,
        category: 'food',
    },
    {
        id: 'margherita-pizza',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, fresh mozzarella, and basil.',
        price: 20.00,
        category: 'food',
    },
    {
        id: 'grilled-chicken',
        name: 'Grilled Chicken Breast',
        description: 'Herb-marinated chicken breast with seasonal vegetables and mashed potatoes.',
        price: 24.00,
        category: 'food',
    },
    {
        id: 'pasta-bolognese',
        name: 'Spaghetti Bolognese',
        description: 'Traditional Italian meat sauce over al dente spaghetti with parmesan.',
        price: 19.00,
        category: 'food',
    },
    {
        id: 'cheese-burger',
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with cheddar, lettuce, tomato, onion, and special sauce. Served with fries.',
        price: 22.00,
        category: 'food',
    },
    {
        id: 'fruit-platter',
        name: 'Fresh Fruit Platter',
        description: 'Seasonal fresh fruits artfully arranged, perfect for a light snack.',
        price: 16.00,
        category: 'food',
    },
    {
        id: 'chocolate-cake',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
        price: 12.00,
        category: 'food',
    },

    // Beverages
    {
        id: 'fresh-orange-juice',
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice.',
        price: 8.00,
        category: 'beverages',
    },
    {
        id: 'turkish-coffee',
        name: 'Turkish Coffee',
        description: 'Traditional Turkish coffee served with Turkish delight.',
        price: 6.00,
        category: 'beverages',
    },
    {
        id: 'cappuccino',
        name: 'Cappuccino',
        description: 'Italian espresso with steamed milk foam.',
        price: 7.00,
        category: 'beverages',
    },
    {
        id: 'mineral-water',
        name: 'Mineral Water',
        description: 'Still or sparkling mineral water (500ml).',
        price: 4.00,
        category: 'beverages',
    },
    {
        id: 'soft-drinks',
        name: 'Soft Drinks',
        description: 'Coca-Cola, Sprite, Fanta, or Ice Tea.',
        price: 5.00,
        category: 'beverages',
    },
    {
        id: 'fresh-smoothie',
        name: 'Fresh Smoothie',
        description: 'Blend of seasonal fruits with yogurt and honey.',
        price: 10.00,
        category: 'beverages',
    },
    {
        id: 'hot-chocolate',
        name: 'Hot Chocolate',
        description: 'Rich Belgian hot chocolate with whipped cream.',
        price: 8.00,
        category: 'beverages',
    },
    {
        id: 'herbal-tea',
        name: 'Herbal Tea Selection',
        description: 'Choose from chamomile, mint, or green tea.',
        price: 5.00,
        category: 'beverages',
    },

    // Other Services
    {
        id: 'extra-towels',
        name: 'Extra Towels',
        description: 'Set of 2 fresh bath towels delivered to your room.',
        price: 0.00,
        category: 'other-services',
    },
    {
        id: 'extra-pillows',
        name: 'Extra Pillows',
        description: 'Additional comfortable pillows for your bed.',
        price: 0.00,
        category: 'other-services',
    },
    {
        id: 'laundry-service',
        name: 'Laundry Service',
        description: 'Same-day laundry service. Place items in the laundry bag.',
        price: 25.00,
        category: 'other-services',
    },
    {
        id: 'ironing-service',
        name: 'Ironing Service',
        description: 'Professional ironing service for your garments.',
        price: 15.00,
        category: 'other-services',
    },
    {
        id: 'shoe-shine',
        name: 'Shoe Shine Service',
        description: 'Professional shoe polishing service.',
        price: 10.00,
        category: 'other-services',
    },
    {
        id: 'baby-crib',
        name: 'Baby Crib Request',
        description: 'Comfortable baby crib delivered and set up in your room.',
        price: 0.00,
        category: 'other-services',
    },
    {
        id: 'wake-up-call',
        name: 'Wake-up Call',
        description: 'Schedule a wake-up call at your preferred time.',
        price: 0.00,
        category: 'other-services',
    },
    {
        id: 'turndown-service',
        name: 'Turndown Service',
        description: 'Evening turndown service with chocolates and fresh water.',
        price: 0.00,
        category: 'other-services',
    },
];

export const categoryLabels: Record<RoomServiceItem['category'], string> = {
    'food': 'Food',
    'beverages': 'Beverages',
    'other-services': 'Other Services',
};
