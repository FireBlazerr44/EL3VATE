const defaultShoeSizes = ['6', '7', '8', '9', '10', '11', '12'];
const defaultClothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const defaultAccessorySizes = ['One Size'];

function generateDefaultSizes(category) {
    if (category === 'shoes') {
        return defaultShoeSizes.map(size => ({ size, stock: Math.floor(Math.random() * 20) + 5 }));
    } else if (category === 'clothing') {
        return defaultClothingSizes.map(size => ({ size, stock: Math.floor(Math.random() * 15) + 5 }));
    } else if (category === 'accessories' || category === 'equipment') {
        return [{ size: 'One Size', stock: Math.floor(Math.random() * 30) + 10 }];
    }
    return [{ size: 'One Size', stock: 10 }];
}

const products = [
    {
        id: 1,
        name: "Nike Air Max 90",
        category: "shoes",
        price: 134.99,
        image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop",
        new: true,
        description: "The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic TPU details.",
        sizes: [
            { size: '6', stock: 8 },
            { size: '7', stock: 12 },
            { size: '8', stock: 15 },
            { size: '9', stock: 20 },
            { size: '10', stock: 18 },
            { size: '11', stock: 10 },
            { size: '12', stock: 6 }
        ]
    },
    {
        id: 2,
        name: "Nike Air Force 1 '07",
        category: "shoes",
        price: 109.99,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop",
        new: false,
        description: "The radiance lives on in the Nike Air Force 1 '07. Bold design details let you represent your style everywhere.",
        sizes: [
            { size: '6', stock: 10 },
            { size: '7', stock: 15 },
            { size: '8', stock: 20 },
            { size: '9', stock: 25 },
            { size: '10', stock: 22 },
            { size: '11', stock: 14 },
            { size: '12', stock: 8 }
        ]
    },
    {
        id: 3,
        name: "Nike Dunk Low Retro",
        category: "shoes",
        price: 115.99,
        image: "https://images.unsplash.com/photo-1612902376491-2a8d4d5b48e8?w=400&h=400&fit=crop",
        new: true,
        description: "Created for the hardwood but taken to the streets, the Nike Dunk Low returns with crisp overlays and original team colors.",
        sizes: [
            { size: '6', stock: 5 },
            { size: '7', stock: 10 },
            { size: '8', stock: 18 },
            { size: '9', stock: 22 },
            { size: '10', stock: 16 },
            { size: '11', stock: 9 },
            { size: '12', stock: 4 }
        ]
    },
    {
        id: 4,
        name: "Nike Air Max 97",
        category: "shoes",
        price: 174.99,
        image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&h=400&fit=crop",
        new: false,
        description: "The Nike Air Max 97 puts a fresh spin on a running icon. Its revolutionary full-length visible Air unit adds unmatched cushioning.",
        sizes: [
            { size: '6', stock: 6 },
            { size: '7', stock: 11 },
            { size: '8', stock: 14 },
            { size: '9', stock: 19 },
            { size: '10', stock: 15 },
            { size: '11', stock: 8 },
            { size: '12', stock: 5 }
        ]
    },
    {
        id: 5,
        name: "Nike Air Jordan 1 Mid",
        category: "shoes",
        price: 159.99,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&h=400&fit=crop",
        new: true,
        description: "The Air Jordan 1 Mid brings back the iconic design of the original with a fresh mix of materials and colors.",
        sizes: [
            { size: '6', stock: 7 },
            { size: '7', stock: 13 },
            { size: '8', stock: 17 },
            { size: '9', stock: 21 },
            { size: '10', stock: 17 },
            { size: '11', stock: 11 },
            { size: '12', stock: 6 }
        ]
    },
    {
        id: 6,
        name: "Nike React Infinity Run",
        category: "shoes",
        price: 159.99,
        image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop",
        new: false,
        description: "Continuing the revolution, the Nike React Infinity Run delivers high-energy return and smooth transitions.",
        sizes: [
            { size: '6', stock: 4 },
            { size: '7', stock: 9 },
            { size: '8', stock: 12 },
            { size: '9', stock: 16 },
            { size: '10', stock: 14 },
            { size: '11', stock: 7 },
            { size: '12', stock: 3 }
        ]
    },
    {
        id: 7,
        name: "Nike Dri-FIT Victory",
        category: "clothing",
        price: 45.99,
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop",
        new: true,
        description: "The Nike Dri-FIT Victory Golf Polo features lightweight, breathable fabric to help keep you cool.",
        sizes: [
            { size: 'XS', stock: 8 },
            { size: 'S', stock: 15 },
            { size: 'M', stock: 20 },
            { size: 'L', stock: 18 },
            { size: 'XL', stock: 12 },
            { size: 'XXL', stock: 6 }
        ]
    },
    {
        id: 8,
        name: "Nike Sportswear Essentials",
        category: "clothing",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
        new: false,
        description: "The Nike Sportswear Essential Fleece Crew is made for everyday comfort with soft brushed-back fleece.",
        sizes: [
            { size: 'XS', stock: 10 },
            { size: 'S', stock: 18 },
            { size: 'M', stock: 25 },
            { size: 'L', stock: 22 },
            { size: 'XL', stock: 15 },
            { size: 'XXL', stock: 8 }
        ]
    },
    {
        id: 9,
        name: "Nike Pro Core",
        category: "clothing",
        price: 35.99,
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
        new: false,
        description: "The Nike Pro Core Men's Short-Sleeve Top is made for high-intensity training with lightweight Dri-FIT technology.",
        sizes: [
            { size: 'XS', stock: 6 },
            { size: 'S', stock: 12 },
            { size: 'M', stock: 18 },
            { size: 'L', stock: 16 },
            { size: 'XL', stock: 10 },
            { size: 'XXL', stock: 5 }
        ]
    },
    {
        id: 10,
        name: "Nike Air Max Jacket",
        category: "clothing",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
        new: true,
        description: "Lightweight warmth with innovative Tech Fleece. Smooth on both sides, lightweight and breathable.",
        sizes: [
            { size: 'XS', stock: 5 },
            { size: 'S', stock: 10 },
            { size: 'M', stock: 15 },
            { size: 'L', stock: 14 },
            { size: 'XL', stock: 8 },
            { size: 'XXL', stock: 4 }
        ]
    },
    {
        id: 11,
        name: "Nike Heritage Hip Pack",
        category: "accessories",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        new: false,
        description: "The Nike Heritage Hip Pack keeps your essentials secure with a compact design.",
        sizes: [{ size: 'One Size', stock: 30 }]
    },
    {
        id: 12,
        name: "Nike Brasilia Training Bag",
        category: "accessories",
        price: 54.99,
        image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400&h=400&fit=crop",
        new: true,
        description: "The Nike Brasilia 9.5 Training Bag has a spacious main compartment and wet shoe compartment.",
        sizes: [{ size: 'One Size', stock: 25 }]
    },
    {
        id: 13,
        name: "Nike Running Hat",
        category: "accessories",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
        new: false,
        description: "Lightweight running cap with breathable mesh panels. Adjustable fit and sweat-wicking forehead band.",
        sizes: [{ size: 'One Size', stock: 40 }]
    },
    {
        id: 14,
        name: "Nike Elite Crew Socks",
        category: "accessories",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop",
        new: false,
        description: "The Nike Elite Crew Socks have a contoured footbed with zonal cushioning for targeted support.",
        sizes: [{ size: 'One Size', stock: 50 }]
    },
    {
        id: 15,
        name: "Nike Training Gloves",
        category: "accessories",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1595078745321-1c1c3f1e8450?w=400&h=400&fit=crop",
        new: true,
        description: "Get a grip with the Nike Training Gloves. Synthetic leather palm provides durable grip during lifts.",
        sizes: [{ size: 'One Size', stock: 35 }]
    },
    {
        id: 16,
        name: "Nike Basketball",
        category: "equipment",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1519861531473-92002639313c?w=400&h=400&fit=crop",
        new: true,
        description: "The Nike Basketball provides exceptional durability and optimal air retention for serious players.",
        sizes: [{ size: 'One Size', stock: 20 }]
    }
];
