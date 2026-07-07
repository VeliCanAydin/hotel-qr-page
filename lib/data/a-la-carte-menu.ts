import type { MenuItem } from '../types/menu'

export const menuItems: MenuItem[] = [
    // Appetizers
    { id: 'pan-seared-scallops', name: 'Pan-Seared Scallops', description: 'Delicate sea scallops seared to perfection, served with a saffron risotto and a hint of lemon.', price: 32.00, category: 'appetizers', allergens: ['shellfish'] },
    { id: 'burrata-caprese', name: 'Burrata Caprese', description: 'Fresh Italian burrata, heirloom tomatoes, basil, and a drizzle of aged balsamic glaze.', price: 24.00, isVegetarian: true, category: 'appetizers', allergens: ['dairy'] },
    { id: 'grilled-octopus', name: 'Grilled Octopus', description: 'Tender octopus marinated in herbs and grilled, served with a citrus and chili vinaigrette.', price: 28.00, category: 'appetizers', allergens: ['shellfish'] },
    { id: 'truffle-parmesan-fries', name: 'Truffle & Parmesan Fries', description: 'Crispy golden fries tossed in truffle oil, topped with freshly grated Parmesan and chives.', price: 18.00, isVegetarian: true, category: 'appetizers', allergens: ['dairy'] },
    { id: 'beef-carpaccio', name: 'Beef Carpaccio', description: 'Thinly sliced prime beef tenderloin with arugula, capers, shaved Parmesan, and lemon-truffle aioli.', price: 26.00, category: 'appetizers' },
    // Soups & Salads
    { id: 'lobster-bisque', name: 'Lobster Bisque', description: 'Creamy lobster bisque with a touch of brandy, topped with chive oil.', price: 18.00, category: 'soups-salads', allergens: ['shellfish','dairy'] },
    { id: 'caesar-salad', name: 'Classic Caesar Salad', description: 'Crisp romaine lettuce, house-made Caesar dressing, croutons, and shaved Parmesan.', price: 16.00, isVegetarian: true, category: 'soups-salads', allergens: ['dairy','egg','gluten'] },
    { id: 'greek-salad', name: 'Mediterranean Greek Salad', description: 'Fresh cucumbers, tomatoes, olives, red onion, and feta cheese with olive oil dressing.', price: 15.00, isVegetarian: true, category: 'soups-salads', allergens: ['dairy'] },
    // Main Courses
    { id: 'filet-mignon', name: 'Filet Mignon', description: 'Prime beef tenderloin grilled to your preference, served with truffle mashed potatoes and seasonal vegetables.', price: 58.00, category: 'main-courses' },
    { id: 'grilled-salmon', name: 'Grilled Atlantic Salmon', description: 'Fresh Atlantic salmon with lemon butter sauce, served with asparagus and wild rice.', price: 42.00, category: 'main-courses', allergens: ['fish','dairy'] },
    { id: 'lobster-tail', name: 'Butter Poached Lobster Tail', description: 'Succulent lobster tail poached in butter, served with drawn butter and seasonal sides.', price: 65.00, category: 'main-courses', allergens: ['shellfish','dairy'] },
    { id: 'mushroom-risotto', name: 'Wild Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and aged Parmesan.', price: 34.00, isVegetarian: true, category: 'main-courses', allergens: ['dairy'] },
    // Sides
    { id: 'truffle-mash', name: 'Truffle Mashed Potatoes', description: 'Creamy mashed potatoes infused with black truffle oil.', price: 12.00, isVegetarian: true, category: 'sides', allergens: ['dairy'] },
    { id: 'grilled-asparagus', name: 'Grilled Asparagus', description: 'Fresh asparagus grilled with olive oil and sea salt.', price: 10.00, isVegetarian: true, category: 'sides' },
    // Desserts
    { id: 'chocolate-fondant', name: 'Chocolate Fondant', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream.', price: 16.00, isVegetarian: true, category: 'desserts', allergens: ['gluten','dairy','egg'] },
    { id: 'tiramisu', name: 'Classic Tiramisu', description: 'Traditional Italian dessert with mascarpone, espresso-soaked ladyfingers, and cocoa.', price: 14.00, isVegetarian: true, category: 'desserts', allergens: ['dairy','gluten','egg'] },
];

export const categories: { id: string; label: string }[] = [
    { id: 'appetizers', label: 'Appetizers' },
    { id: 'soups-salads', label: 'Soups & Salads' },
    { id: 'main-courses', label: 'Main Courses' },
    { id: 'sides', label: 'Sides' },
    { id: 'desserts', label: 'Desserts' },
];
