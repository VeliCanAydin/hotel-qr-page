export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    isVegetarian?: boolean;
    category: 'appetizers' | 'soups-salads' | 'main-courses' | 'sides' | 'desserts';
}

export const menuItems: MenuItem[] = [
    // Appetizers
    {
        id: 'pan-seared-scallops',
        name: 'Pan-Seared Scallops',
        description: 'Delicate sea scallops seared to perfection, served with a saffron risotto and a hint of lemon.',
        price: 32.00,
        image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=200&h=200&fit=crop',
        category: 'appetizers',
    },
    {
        id: 'burrata-caprese',
        name: 'Burrata Caprese',
        description: 'Fresh Italian burrata, heirloom tomatoes, basil, and a drizzle of aged balsamic glaze.',
        price: 24.00,
        image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'appetizers',
    },
    {
        id: 'grilled-octopus',
        name: 'Grilled Octopus',
        description: 'Tender octopus marinated in herbs and grilled, served with a citrus and chili vinaigrette.',
        price: 28.00,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=200&h=200&fit=crop',
        category: 'appetizers',
    },
    {
        id: 'truffle-parmesan-fries',
        name: 'Truffle & Parmesan Fries',
        description: 'Crispy golden fries tossed in truffle oil, topped with freshly grated Parmesan and chives.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'appetizers',
    },
    {
        id: 'beef-carpaccio',
        name: 'Beef Carpaccio',
        description: 'Thinly sliced prime beef tenderloin with arugula, capers, shaved Parmesan, and lemon-truffle aioli.',
        price: 26.00,
        image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=200&h=200&fit=crop',
        category: 'appetizers',
    },
    // Soups & Salads
    {
        id: 'lobster-bisque',
        name: 'Lobster Bisque',
        description: 'Creamy lobster bisque with a touch of brandy, topped with chive oil.',
        price: 18.00,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
        category: 'soups-salads',
    },
    {
        id: 'caesar-salad',
        name: 'Classic Caesar Salad',
        description: 'Crisp romaine lettuce, house-made Caesar dressing, croutons, and shaved Parmesan.',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'soups-salads',
    },
    {
        id: 'greek-salad',
        name: 'Mediterranean Greek Salad',
        description: 'Fresh cucumbers, tomatoes, olives, red onion, and feta cheese with olive oil dressing.',
        price: 15.00,
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'soups-salads',
    },
    // Main Courses
    {
        id: 'filet-mignon',
        name: 'Filet Mignon',
        description: 'Prime beef tenderloin grilled to your preference, served with truffle mashed potatoes and seasonal vegetables.',
        price: 58.00,
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop',
        category: 'main-courses',
    },
    {
        id: 'grilled-salmon',
        name: 'Grilled Atlantic Salmon',
        description: 'Fresh Atlantic salmon with lemon butter sauce, served with asparagus and wild rice.',
        price: 42.00,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
        category: 'main-courses',
    },
    {
        id: 'lobster-tail',
        name: 'Butter Poached Lobster Tail',
        description: 'Succulent lobster tail poached in butter, served with drawn butter and seasonal sides.',
        price: 65.00,
        image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=200&h=200&fit=crop',
        category: 'main-courses',
    },
    {
        id: 'mushroom-risotto',
        name: 'Wild Mushroom Risotto',
        description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and aged Parmesan.',
        price: 34.00,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'main-courses',
    },
    // Sides
    {
        id: 'truffle-mash',
        name: 'Truffle Mashed Potatoes',
        description: 'Creamy mashed potatoes infused with black truffle oil.',
        price: 12.00,
        image: 'https://images.unsplash.com/photo-1600984575359-310ae7b6e7c4?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'sides',
    },
    {
        id: 'grilled-asparagus',
        name: 'Grilled Asparagus',
        description: 'Fresh asparagus grilled with olive oil and sea salt.',
        price: 10.00,
        image: 'https://images.unsplash.com/photo-1515697320509-9c5c3aeaf903?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'sides',
    },
    // Desserts
    {
        id: 'chocolate-fondant',
        name: 'Chocolate Fondant',
        description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.',
        price: 16.00,
        image: 'https://images.unsplash.com/photo-1617625802912-cde586faf331?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'desserts',
    },
    {
        id: 'tiramisu',
        name: 'Classic Tiramisu',
        description: 'Traditional Italian dessert with mascarpone, espresso-soaked ladyfingers, and cocoa.',
        price: 14.00,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop',
        isVegetarian: true,
        category: 'desserts',
    },
];

export const categories = [
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'soups-salads', label: 'Soups & Salads' },
    { id: 'main-courses', label: 'Main Courses' },
    { id: 'sides', label: 'Sides' },
    { id: 'desserts', label: 'Desserts' },
] as const;
