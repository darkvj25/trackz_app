export const mockProducts = [
  // Burger Craft & Grills (merch-1)
  {
    id: 'prod-101',
    merchantId: 'merch-1',
    merchantName: 'Burger Craft & Grills',
    name: 'Trakz Supreme Double Smash Burger',
    description: 'Two 100% Angus beef smashed patties, melted cheddar cheese, caramelized onions, crisp pickles, and signature Trakz sauce on toasted brioche.',
    price: 289,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category: 'Gourmet Burgers',
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    variants: [
      { id: 'v1', name: 'Double Patty (Standard)', price: 0 },
      { id: 'v2', name: 'Triple Monster Patty', price: 80 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Crispy Bacon', price: 45 },
      { id: 'a2', name: 'Melted Truffle Cheese', price: 35 },
      { id: 'a3', name: 'Extra Trakz Sauce', price: 20 },
      { id: 'a4', name: 'Jalapeño Slices', price: 25 }
    ]
  },
  {
    id: 'prod-102',
    merchantId: 'merch-1',
    merchantName: 'Burger Craft & Grills',
    name: 'Truffle Mushroom Cheeseburger',
    description: 'Single Angus patty topped with wild sauted mushrooms, Swiss cheese, and fragrant black truffle mayo.',
    price: 310,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    category: 'Gourmet Burgers',
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    variants: [
      { id: 'v1', name: 'Single Patty', price: 0 },
      { id: 'v2', name: 'Double Patty', price: 70 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Bacon', price: 45 },
      { id: 'a2', name: 'Extra Truffle Mayo', price: 25 }
    ]
  },
  {
    id: 'prod-103',
    merchantId: 'merch-1',
    merchantName: 'Burger Craft & Grills',
    name: 'Loaded Cajun Cheese Fries',
    description: 'Golden skin-on fries tossed in spicy Cajun seasoning, smothered with warm cheddar cheese sauce and bacon bits.',
    price: 145,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    category: 'Sides & Fries',
    isAvailable: true,
    isPopular: true,
    rating: 4.7,
    variants: [
      { id: 'v1', name: 'Regular Size', price: 0 },
      { id: 'v2', name: 'Sharing Size', price: 50 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Cheese Sauce', price: 25 },
      { id: 'a2', name: 'Jalapeños', price: 20 }
    ]
  },
  {
    id: 'prod-104',
    merchantId: 'merch-1',
    merchantName: 'Burger Craft & Grills',
    name: 'Thick Salted Caramel Milkshake',
    description: 'Hand-spun vanilla bean ice cream blended with house-made salted caramel and whipped cream.',
    price: 165,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    category: 'Milkshakes & Beverages',
    isAvailable: true,
    isPopular: false,
    rating: 4.8,
    variants: [],
    addOns: []
  },

  // Bella Napoli Woodfired Pizza (merch-2)
  {
    id: 'prod-201',
    merchantId: 'merch-2',
    merchantName: 'Bella Napoli Woodfired Pizza',
    name: 'Truffle Prosciutto Speciale Pizza 12"',
    description: 'Fresh mozzarella, San Marzano tomato sauce, aged prosciutto di Parma, wild rocket arugula, and white truffle oil spray.',
    price: 495,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    category: 'Chef Signature Pizzas',
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    variants: [
      { id: 'v1', name: '12-inch Personal (8 slices)', price: 0 },
      { id: 'v2', name: '16-inch Family (12 slices)', price: 180 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Mozzarella Di Bufala', price: 60 },
      { id: 'a2', name: 'Hot Honey Drizzle', price: 35 },
      { id: 'a3', name: 'Garlic Butter Crust Dip', price: 25 }
    ]
  },
  {
    id: 'prod-202',
    merchantId: 'merch-2',
    merchantName: 'Bella Napoli Woodfired Pizza',
    name: 'Classic Margherita Supreme',
    description: 'San Marzano tomatoes, fresh basil leaves, extra virgin olive oil, and melted Italian mozzarella.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80',
    category: 'Classic Pizzas',
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    variants: [
      { id: 'v1', name: '12-inch Personal', price: 0 },
      { id: 'v2', name: '16-inch Family', price: 150 }
    ],
    addOns: [
      { id: 'a1', name: 'Pepperoni Topping', price: 55 },
      { id: 'a2', name: 'Extra Basil & Garlic', price: 20 }
    ]
  },
  {
    id: 'prod-203',
    merchantId: 'merch-2',
    merchantName: 'Bella Napoli Woodfired Pizza',
    name: 'Creamy Truffle Mushroom Lasagna',
    description: 'Layers of fresh pasta, rich parmesan béchamel sauce, roasted forest mushrooms, and braised beef ragù.',
    price: 340,
    image: 'https://images.unsplash.com/photo-1621996346565-e3def616327d?auto=format&fit=crop&w=600&q=80',
    category: 'Pasta & Lasagna',
    isAvailable: true,
    isPopular: false,
    rating: 4.7,
    variants: [],
    addOns: [
      { id: 'a1', name: 'Garlic Bread Slice', price: 30 }
    ]
  },

  // Boba Haven & Tea House (merch-3)
  {
    id: 'prod-301',
    merchantId: 'merch-3',
    merchantName: 'Boba Haven & Tea House',
    name: 'Brown Sugar Fresh Milk Boba',
    description: 'Warm slow-cooked tapioca boba coated in rich brown sugar syrup, layered with cold fresh dairy milk and mousse top.',
    price: 135,
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=600&q=80',
    category: 'Signature Milk Teas',
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    variants: [
      { id: 'v1', name: 'Medium 16oz', price: 0 },
      { id: 'v2', name: 'Large 22oz', price: 20 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Brown Sugar Boba', price: 25 },
      { id: 'a2', name: 'Cheese Mousse Foam', price: 30 },
      { id: 'a3', name: 'Egg Pudding', price: 20 },
      { id: 'a4', name: 'Grass Jelly', price: 20 }
    ]
  },
  {
    id: 'prod-302',
    merchantId: 'merch-3',
    merchantName: 'Boba Haven & Tea House',
    name: 'Mango Passionfruit Chezzo Fruit Tea',
    description: 'Real brewed jasmine green tea infused with fresh mango puree and passionfruit seeds, topped with salted cheese top.',
    price: 145,
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
    category: 'Fresh Fruit Series',
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    variants: [
      { id: 'v1', name: 'Medium 16oz', price: 0 },
      { id: 'v2', name: 'Large 22oz', price: 20 }
    ],
    addOns: [
      { id: 'a1', name: 'Aloe Vera Cubes', price: 20 },
      { id: 'a2', name: 'Popping Boba', price: 25 }
    ]
  },

  // Tokyo Ramen & Donburi Express (merch-4)
  {
    id: 'prod-401',
    merchantId: 'merch-4',
    merchantName: 'Tokyo Ramen & Donburi Express',
    name: 'Signature Tonkotsu Black Garlic Ramen',
    description: '12-hour simmered pork bone broth, thin handmade ramen noodles, chashu pork belly slices, ajitsuke tamago egg, wood ear mushroom, and black garlic oil.',
    price: 360,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    category: 'Ramen Special',
    isAvailable: true,
    isPopular: true,
    rating: 4.9,
    variants: [
      { id: 'v1', name: 'Regular Spice', price: 0 },
      { id: 'v2', name: 'Extra Spicy Level 2', price: 15 },
      { id: 'v3', name: 'Fiery Spicy Level 5', price: 25 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Chashu Pork (2 pcs)', price: 65 },
      { id: 'a2', name: 'Extra Ajitama Soft Boiled Egg', price: 35 },
      { id: 'a3', name: 'Extra Noodle Kaedama', price: 40 }
    ]
  },

  // Crispy Crunch Fried Chicken (merch-5)
  {
    id: 'prod-501',
    merchantId: 'merch-5',
    merchantName: 'Crispy Crunch Fried Chicken',
    name: '6-Piece Crispy Chicken Bucket Meal',
    description: '6 pieces of golden double-fried chicken with 2 butter rice, 2 mashed potatoes, and 2 signature gravy cups.',
    price: 480,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80',
    category: 'Chicken Buckets',
    isAvailable: true,
    isPopular: true,
    rating: 4.8,
    variants: [
      { id: 'v1', name: 'Original Crispy', price: 0 },
      { id: 'v2', name: 'Spicy Honey Garlic', price: 30 }
    ],
    addOns: [
      { id: 'a1', name: 'Extra Garlic Rice', price: 25 },
      { id: 'a2', name: 'Extra Large Gravy', price: 20 }
    ]
  }
];
