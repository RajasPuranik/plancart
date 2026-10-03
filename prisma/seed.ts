import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categoriesData = [
  { name: 'Furniture', slug: 'furniture', description: 'Quality furniture for every room.', icon: 'sofa' },
  { name: 'Home Decor', slug: 'home-decor', description: 'Aesthetic decorations for your home.', icon: 'palette' },
  { name: 'Lighting', slug: 'lighting', description: 'Illuminate your space with style.', icon: 'lamp' },
  { name: 'Appliances', slug: 'appliances', description: 'Smart and durable home appliances.', icon: 'refrigerator' },
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and electronic items.', icon: 'smartphone' },
  { name: 'Fashion', slug: 'fashion', description: 'Trendy apparel and accessories.', icon: 'shirt' },
  { name: 'Kitchen', slug: 'kitchen', description: 'Essentials for your culinary adventures.', icon: 'cooking-pot' },
  { name: 'Bedding & Bath', slug: 'bedding-bath', description: 'Comfortable bedding and bath accessories.', icon: 'bed' }
];

const furnitureImages = ['1555041469-a586c1dc-9fbe', '1506439773649-6e0eb8cfb237', '1524758631624-e2822e304c36', '1493663284031-b7e3aefcae8e', '1550581190-9c1c48d21d6c', '1538688525198-9b88f6f53126'];
const decorImages = ['1513519245088-0e12902e5a38', '1507003211169-0a1dd7228f2d', '1490312278390-ab64016e0aa9'];
const lightingImages = ['1507473885765-e6ed057ab6fe', '1513506003901-1e6a229e2d15', '1524484485831-a92ffc0de03f'];
const electronicsImages = ['1505740420928-5e560c06d30e', '1517336714731-489689fd1ca4', '1546868871-af0de0601bbe'];
const fashionImages = ['1489987707025-afc232f7ea0f', '1434389677669-e08b4cac3105', '1490481651871-ab68de25d43a'];
const kitchenImages = ['1556909114-f6e7ad7d3136', '1585515320754-f4c3d0b940ab'];
const appliancesImages = ['1558618666-fcd25c85f82e', '1574269909862-7e1d70bb8078'];
const beddingImages = ['1555041469-a586c1dc-9fbe', '1506439773649-6e0eb8cfb237'];

function getImages(categoryImages: string[], count: number) {
  return Array.from({ length: count }).map((_, i) => ({
    url: `https://images.unsplash.com/photo-${categoryImages[i % categoryImages.length]}?w=800&q=80`,
    isPrimary: i === 0
  }));
}

function getVariants() {
  return [
    { name: 'Midnight Blue', type: 'COLOR' as const, value: '#1a1a2e', stock: 20 },
    { name: 'Sage Green', type: 'COLOR' as const, value: '#87ae73', stock: 15 }
  ];
}

const productsData = [
  // Furniture
  { category: 'furniture', name: 'Oslo Velvet 3-Seater Sofa', slug: 'oslo-velvet-3-seater-sofa', brand: 'Nilkamal', price: 24999, mrp: 34999, isFeatured: true, tags: ['sofa', 'velvet', 'living room'], rating: 4.5, reviewCount: 120, stock: 50 },
  { category: 'furniture', name: 'Zen Solid Wood Coffee Table', slug: 'zen-solid-wood-coffee-table', brand: 'Godrej Interio', price: 8499, mrp: 12999, isFeatured: false, tags: ['coffee table', 'wood', 'living room'], rating: 4.2, reviewCount: 85, stock: 30 },
  { category: 'furniture', name: 'ErgoMax Mesh Office Chair', slug: 'ergomax-mesh-office-chair', brand: 'Green Soul', price: 11999, mrp: 18999, isFeatured: true, tags: ['chair', 'office', 'ergonomic'], rating: 4.8, reviewCount: 500, stock: 150 },
  { category: 'furniture', name: 'Kyoto Platform Bed King Size', slug: 'kyoto-platform-bed-king-size', brand: 'Urban Ladder', price: 29999, mrp: 39999, isFeatured: false, tags: ['bed', 'king size', 'bedroom'], rating: 4.6, reviewCount: 220, stock: 20 },
  { category: 'furniture', name: 'Scandinavian Dining Table Set', slug: 'scandinavian-dining-table-set', brand: 'HomeTown', price: 19999, mrp: 28999, isFeatured: true, tags: ['dining', 'table', 'set'], rating: 4.3, reviewCount: 110, stock: 25 },
  { category: 'furniture', name: 'Minimalist TV Unit with Storage', slug: 'minimalist-tv-unit', brand: 'Wakefit', price: 7999, mrp: 11999, isFeatured: false, tags: ['tv unit', 'storage', 'living room'], rating: 4.1, reviewCount: 75, stock: 40 },
  { category: 'furniture', name: 'Compact Shoe Rack (5 Tier)', slug: 'compact-shoe-rack', brand: 'Amazon Basics', price: 2499, mrp: 3999, isFeatured: false, tags: ['shoe rack', 'storage', 'entryway'], rating: 4.0, reviewCount: 300, stock: 200 },
  { category: 'furniture', name: 'Floating Wall Bookshelf Set', slug: 'floating-wall-bookshelf-set', brand: 'Wooden Street', price: 4999, mrp: 6999, isFeatured: true, tags: ['bookshelf', 'wall mount', 'study'], rating: 4.4, reviewCount: 150, stock: 60 },
  { category: 'furniture', name: 'Recliner Sofa Single Seater', slug: 'recliner-sofa-single-seater', brand: 'Durian', price: 15999, mrp: 22999, isFeatured: false, tags: ['recliner', 'sofa', 'single'], rating: 4.7, reviewCount: 90, stock: 15 },
  { category: 'furniture', name: 'L-Shaped Corner Sofa', slug: 'l-shaped-corner-sofa', brand: 'Pepperfry', price: 34999, mrp: 45999, isFeatured: true, tags: ['sofa', 'l-shaped', 'corner'], rating: 4.5, reviewCount: 180, stock: 10 },
  { category: 'furniture', name: 'Folding Study Table', slug: 'folding-study-table', brand: 'Solimo', price: 3499, mrp: 4999, isFeatured: false, tags: ['study table', 'folding', 'portable'], rating: 4.2, reviewCount: 400, stock: 100 },
  { category: 'furniture', name: 'Dressing Table with Mirror', slug: 'dressing-table-with-mirror', brand: 'Spacewood', price: 9999, mrp: 14999, isFeatured: false, tags: ['dressing table', 'mirror', 'bedroom'], rating: 4.3, reviewCount: 120, stock: 35 },
  { category: 'furniture', name: 'Outdoor Patio Chair', slug: 'outdoor-patio-chair', brand: 'Nilkamal', price: 1599, mrp: 2599, isFeatured: false, tags: ['outdoor', 'patio', 'chair'], rating: 4.0, reviewCount: 65, stock: 80 },

  // Home Decor
  { category: 'home-decor', name: 'Macrame Wall Hanging', slug: 'macrame-wall-hanging', brand: 'Artisanal Weaves', price: 1299, mrp: 1999, isFeatured: true, tags: ['wall hanging', 'macrame', 'decor'], rating: 4.6, reviewCount: 85, stock: 45 },
  { category: 'home-decor', name: 'Set of 3 Canvas Art Prints', slug: 'set-of-3-canvas-art-prints', brand: 'Painting Mantra', price: 999, mrp: 1499, isFeatured: false, tags: ['art', 'canvas', 'prints'], rating: 4.1, reviewCount: 200, stock: 100 },
  { category: 'home-decor', name: 'Ceramic Table Vase Set', slug: 'ceramic-table-vase-set', brand: 'EkHathKala', price: 1599, mrp: 2499, isFeatured: false, tags: ['vase', 'ceramic', 'table decor'], rating: 4.4, reviewCount: 150, stock: 55 },
  { category: 'home-decor', name: 'Bohemian Floor Cushion', slug: 'bohemian-floor-cushion', brand: 'Fab India', price: 2499, mrp: 3499, isFeatured: true, tags: ['cushion', 'bohemian', 'floor seating'], rating: 4.7, reviewCount: 300, stock: 80 },
  { category: 'home-decor', name: 'Decorative Wall Mirror Round', slug: 'decorative-wall-mirror-round', brand: 'JEENIDHI', price: 3999, mrp: 5499, isFeatured: false, tags: ['mirror', 'wall decor', 'round'], rating: 4.3, reviewCount: 95, stock: 40 },
  { category: 'home-decor', name: 'Aromatherapy Candle Set (6pcs)', slug: 'aromatherapy-candle-set-6pcs', brand: 'Ekam', price: 899, mrp: 1299, isFeatured: true, tags: ['candle', 'aromatherapy', 'set'], rating: 4.8, reviewCount: 500, stock: 200 },
  { category: 'home-decor', name: 'Indoor Plant Stand Metal', slug: 'indoor-plant-stand-metal', brand: 'Green Gardenia', price: 1799, mrp: 2599, isFeatured: false, tags: ['plant stand', 'metal', 'indoor'], rating: 4.2, reviewCount: 110, stock: 65 },
  { category: 'home-decor', name: 'Photo Frame Set (8pcs)', slug: 'photo-frame-set-8pcs', brand: 'Art Street', price: 1199, mrp: 1899, isFeatured: false, tags: ['photo frame', 'set', 'wall decor'], rating: 4.0, reviewCount: 250, stock: 120 },
  { category: 'home-decor', name: 'Handwoven Jute Rug 5x7ft', slug: 'handwoven-jute-rug-5x7ft', brand: 'Saral Home', price: 3499, mrp: 4999, isFeatured: true, tags: ['rug', 'jute', 'handwoven'], rating: 4.5, reviewCount: 180, stock: 30 },
  { category: 'home-decor', name: 'Decorative Throw Pillows Set of 4', slug: 'decorative-throw-pillows-set-4', brand: 'STITCHNEST', price: 1299, mrp: 1799, isFeatured: false, tags: ['pillows', 'throw', 'decorative'], rating: 4.3, reviewCount: 140, stock: 90 },

  // Lighting
  { category: 'lighting', name: 'Prism LED Desk Lamp Touch', slug: 'prism-led-desk-lamp-touch', brand: 'Philips', price: 2499, mrp: 3499, isFeatured: true, tags: ['desk lamp', 'led', 'touch'], rating: 4.6, reviewCount: 320, stock: 100 },
  { category: 'lighting', name: 'Minimalist Floor Lamp', slug: 'minimalist-floor-lamp', brand: 'Wipro', price: 3999, mrp: 5999, isFeatured: false, tags: ['floor lamp', 'minimalist', 'living room'], rating: 4.4, reviewCount: 180, stock: 45 },
  { category: 'lighting', name: 'Smart LED Bulb 9W (Pack of 4)', slug: 'smart-led-bulb-9w-pack-4', brand: 'Syska', price: 799, mrp: 1299, isFeatured: true, tags: ['led bulb', 'smart', 'pack'], rating: 4.7, reviewCount: 800, stock: 300 },
  { category: 'lighting', name: 'Crystal Chandelier 8-Light', slug: 'crystal-chandelier-8-light', brand: 'Jainsons Emporio', price: 12999, mrp: 18999, isFeatured: false, tags: ['chandelier', 'crystal', 'ceiling'], rating: 4.2, reviewCount: 50, stock: 15 },
  { category: 'lighting', name: 'Industrial Pendant Light', slug: 'industrial-pendant-light', brand: 'Homesake', price: 2999, mrp: 4499, isFeatured: false, tags: ['pendant light', 'industrial', 'ceiling'], rating: 4.5, reviewCount: 120, stock: 60 },
  { category: 'lighting', name: 'Solar Garden Lights (Pack of 6)', slug: 'solar-garden-lights-pack-6', brand: 'Hardoll', price: 1499, mrp: 2299, isFeatured: true, tags: ['solar', 'garden', 'outdoor'], rating: 4.3, reviewCount: 250, stock: 150 },
  { category: 'lighting', name: 'LED Strip Lights 5m RGB', slug: 'led-strip-lights-5m-rgb', brand: 'Voltas', price: 699, mrp: 1099, isFeatured: false, tags: ['led strip', 'rgb', 'decor'], rating: 4.1, reviewCount: 400, stock: 250 },
  { category: 'lighting', name: 'Bedside Table Lamp Ceramic', slug: 'bedside-table-lamp-ceramic', brand: 'Orange Tree', price: 1999, mrp: 2999, isFeatured: false, tags: ['table lamp', 'ceramic', 'bedroom'], rating: 4.6, reviewCount: 95, stock: 40 },
  { category: 'lighting', name: 'Motion Sensor Night Light (3pk)', slug: 'motion-sensor-night-light-3pk', brand: 'Mi', price: 499, mrp: 799, isFeatured: true, tags: ['night light', 'sensor', 'pack'], rating: 4.8, reviewCount: 600, stock: 200 },
  { category: 'lighting', name: 'Outdoor Wall Sconce', slug: 'outdoor-wall-sconce', brand: 'Fos Lighting', price: 2799, mrp: 3999, isFeatured: false, tags: ['wall sconce', 'outdoor', 'lighting'], rating: 4.4, reviewCount: 110, stock: 55 },

  // Electronics
  { category: 'electronics', name: 'TWS Earbuds Active Noise Cancelling', slug: 'tws-earbuds-anc', brand: 'boAt', price: 1999, mrp: 3999, isFeatured: true, tags: ['tws', 'earbuds', 'audio'], rating: 4.5, reviewCount: 1500, stock: 400 },
  { category: 'electronics', name: '27" 4K IPS Monitor', slug: '27-4k-ips-monitor', brand: 'LG', price: 22999, mrp: 32999, isFeatured: false, tags: ['monitor', '4k', 'ips'], rating: 4.7, reviewCount: 320, stock: 50 },
  { category: 'electronics', name: 'Wireless Mechanical Keyboard', slug: 'wireless-mechanical-keyboard', brand: 'Cosmic Byte', price: 3499, mrp: 5499, isFeatured: true, tags: ['keyboard', 'wireless', 'mechanical'], rating: 4.4, reviewCount: 450, stock: 120 },
  { category: 'electronics', name: '10000mAh Power Bank', slug: '10000mah-power-bank', brand: 'Ambrane', price: 899, mrp: 1499, isFeatured: false, tags: ['power bank', 'portable', 'charging'], rating: 4.3, reviewCount: 2100, stock: 500 },
  { category: 'electronics', name: 'Smart Watch with SpO2', slug: 'smart-watch-spo2', brand: 'Noise', price: 2499, mrp: 4999, isFeatured: true, tags: ['smart watch', 'fitness', 'wearable'], rating: 4.2, reviewCount: 3500, stock: 300 },
  { category: 'electronics', name: 'Portable Bluetooth Speaker 20W', slug: 'portable-bluetooth-speaker-20w', brand: 'JBL', price: 3999, mrp: 5999, isFeatured: false, tags: ['speaker', 'bluetooth', 'audio'], rating: 4.6, reviewCount: 1200, stock: 150 },
  { category: 'electronics', name: 'USB-C Hub 7-in-1', slug: 'usb-c-hub-7-in-1', brand: 'Anker', price: 2799, mrp: 3999, isFeatured: false, tags: ['usb c', 'hub', 'accessories'], rating: 4.5, reviewCount: 800, stock: 200 },
  { category: 'electronics', name: 'Webcam Full HD 1080p', slug: 'webcam-full-hd-1080p', brand: 'Logitech', price: 4999, mrp: 6999, isFeatured: true, tags: ['webcam', '1080p', 'video'], rating: 4.8, reviewCount: 950, stock: 80 },
  { category: 'electronics', name: 'Wireless Gaming Mouse', slug: 'wireless-gaming-mouse', brand: 'Redgear', price: 999, mrp: 1599, isFeatured: false, tags: ['mouse', 'wireless', 'gaming'], rating: 4.1, reviewCount: 1800, stock: 250 },
  { category: 'electronics', name: '65" 4K Smart TV', slug: '65-4k-smart-tv', brand: 'Samsung', price: 54999, mrp: 74999, isFeatured: true, tags: ['tv', '4k', 'smart'], rating: 4.9, reviewCount: 420, stock: 30 },
  { category: 'electronics', name: 'Tablet 10.4" 6GB RAM', slug: 'tablet-10-4-6gb-ram', brand: 'Lenovo', price: 18999, mrp: 24999, isFeatured: false, tags: ['tablet', 'android', 'portable'], rating: 4.4, reviewCount: 600, stock: 90 },
  { category: 'electronics', name: 'Over-Ear Headphones', slug: 'over-ear-headphones', brand: 'Sony', price: 7999, mrp: 11999, isFeatured: false, tags: ['headphones', 'audio', 'over-ear'], rating: 4.7, reviewCount: 1100, stock: 100 },

  // Fashion
  { category: 'fashion', name: 'Slim Fit Cotton Shirt', slug: 'slim-fit-cotton-shirt', brand: 'Allen Solly', price: 1299, mrp: 2199, isFeatured: true, tags: ['shirt', 'cotton', 'men'], rating: 4.3, reviewCount: 450, stock: 150 },
  { category: 'fashion', name: 'High-Waist Palazzo Pants', slug: 'high-waist-palazzo-pants', brand: 'W', price: 899, mrp: 1499, isFeatured: false, tags: ['pants', 'palazzo', 'women'], rating: 4.2, reviewCount: 320, stock: 200 },
  { category: 'fashion', name: 'Running Shoes Ultra Boost', slug: 'running-shoes-ultra-boost', brand: 'Puma', price: 4999, mrp: 7999, isFeatured: true, tags: ['shoes', 'running', 'sports'], rating: 4.6, reviewCount: 850, stock: 80 },
  { category: 'fashion', name: 'Leather Crossbody Bag', slug: 'leather-crossbody-bag', brand: 'Hidesign', price: 3999, mrp: 5999, isFeatured: false, tags: ['bag', 'leather', 'accessories'], rating: 4.8, reviewCount: 210, stock: 45 },
  { category: 'fashion', name: 'Analog Watch Rose Gold', slug: 'analog-watch-rose-gold', brand: 'Titan', price: 5999, mrp: 8499, isFeatured: true, tags: ['watch', 'analog', 'accessories'], rating: 4.7, reviewCount: 500, stock: 60 },
  { category: 'fashion', name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', brand: 'Ray-Ban', price: 6499, mrp: 8999, isFeatured: false, tags: ['sunglasses', 'eyewear', 'accessories'], rating: 4.5, reviewCount: 380, stock: 75 },
  { category: 'fashion', name: 'Printed Kurta Set 3pc', slug: 'printed-kurta-set-3pc', brand: 'Biba', price: 2499, mrp: 4999, isFeatured: false, tags: ['kurta', 'ethnic', 'women'], rating: 4.4, reviewCount: 600, stock: 120 },
  { category: 'fashion', name: 'Denim Jacket Classic', slug: 'denim-jacket-classic', brand: 'Levi\'s', price: 3999, mrp: 5499, isFeatured: true, tags: ['jacket', 'denim', 'unisex'], rating: 4.6, reviewCount: 420, stock: 90 },
  { category: 'fashion', name: 'Sports Bra Medium Impact', slug: 'sports-bra-medium-impact', brand: 'Nike', price: 1799, mrp: 2499, isFeatured: false, tags: ['activewear', 'bra', 'sports'], rating: 4.5, reviewCount: 310, stock: 110 },
  { category: 'fashion', name: 'Wool Blend Sweater', slug: 'wool-blend-sweater', brand: 'Monte Carlo', price: 2299, mrp: 3499, isFeatured: false, tags: ['sweater', 'winter', 'wool'], rating: 4.3, reviewCount: 250, stock: 130 },

  // Kitchen
  { category: 'kitchen', name: 'Non-Stick Cookware Set 5pc', slug: 'non-stick-cookware-set-5pc', brand: 'Prestige', price: 2999, mrp: 4499, isFeatured: true, tags: ['cookware', 'non-stick', 'set'], rating: 4.5, reviewCount: 800, stock: 150 },
  { category: 'kitchen', name: 'Mixer Grinder 750W', slug: 'mixer-grinder-750w', brand: 'Bajaj', price: 3499, mrp: 4999, isFeatured: false, tags: ['mixer', 'grinder', 'appliance'], rating: 4.3, reviewCount: 1200, stock: 200 },
  { category: 'kitchen', name: 'Stainless Steel Water Bottle 1L', slug: 'stainless-steel-water-bottle-1l', brand: 'Milton', price: 499, mrp: 799, isFeatured: false, tags: ['bottle', 'steel', 'hydration'], rating: 4.6, reviewCount: 2500, stock: 400 },
  { category: 'kitchen', name: 'Air Fryer 4.5L Digital', slug: 'air-fryer-4-5l-digital', brand: 'Pigeon', price: 4999, mrp: 7999, isFeatured: true, tags: ['air fryer', 'cooking', 'appliance'], rating: 4.7, reviewCount: 650, stock: 80 },
  { category: 'kitchen', name: 'Glass Storage Containers Set', slug: 'glass-storage-containers-set', brand: 'Borosil', price: 1299, mrp: 1899, isFeatured: false, tags: ['storage', 'glass', 'containers'], rating: 4.8, reviewCount: 950, stock: 120 },
  { category: 'kitchen', name: 'Induction Cooktop 2100W', slug: 'induction-cooktop-2100w', brand: 'Havells', price: 2499, mrp: 3999, isFeatured: true, tags: ['induction', 'cooktop', 'appliance'], rating: 4.4, reviewCount: 1100, stock: 100 },
  { category: 'kitchen', name: 'Electric Kettle 1.5L', slug: 'electric-kettle-1-5l', brand: 'Butterfly', price: 899, mrp: 1299, isFeatured: false, tags: ['kettle', 'electric', 'appliance'], rating: 4.5, reviewCount: 3200, stock: 350 },
  { category: 'kitchen', name: 'Cast Iron Tawa 12"', slug: 'cast-iron-tawa-12', brand: 'Lodge', price: 2999, mrp: 4299, isFeatured: false, tags: ['tawa', 'cast iron', 'cookware'], rating: 4.6, reviewCount: 420, stock: 60 },
  { category: 'kitchen', name: 'Spice Rack Revolving 16 Jars', slug: 'spice-rack-revolving-16-jars', brand: 'Amazon Basics', price: 799, mrp: 1199, isFeatured: false, tags: ['spice rack', 'storage', 'kitchen'], rating: 4.2, reviewCount: 850, stock: 180 },
  { category: 'kitchen', name: 'Hand Blender 300W', slug: 'hand-blender-300w', brand: 'Philips', price: 1599, mrp: 2299, isFeatured: true, tags: ['blender', 'hand', 'appliance'], rating: 4.7, reviewCount: 1500, stock: 130 },

  // Appliances
  { category: 'appliances', name: 'Washing Machine 7kg Front Load', slug: 'washing-machine-7kg-front-load', brand: 'LG', price: 27999, mrp: 35999, isFeatured: true, tags: ['washing machine', 'front load', 'appliance'], rating: 4.8, reviewCount: 1200, stock: 40 },
  { category: 'appliances', name: 'Split AC 1.5 Ton 5 Star', slug: 'split-ac-1-5-ton-5-star', brand: 'Daikin', price: 36999, mrp: 48999, isFeatured: true, tags: ['ac', 'split', 'appliance'], rating: 4.6, reviewCount: 850, stock: 30 },
  { category: 'appliances', name: 'Refrigerator 260L Double Door', slug: 'refrigerator-260l-double-door', brand: 'Samsung', price: 23999, mrp: 31999, isFeatured: false, tags: ['refrigerator', 'double door', 'appliance'], rating: 4.5, reviewCount: 920, stock: 50 },
  { category: 'appliances', name: 'Robot Vacuum Cleaner', slug: 'robot-vacuum-cleaner', brand: 'Mi', price: 12999, mrp: 18999, isFeatured: true, tags: ['vacuum', 'robot', 'cleaning'], rating: 4.4, reviewCount: 600, stock: 75 },
  { category: 'appliances', name: 'Water Purifier RO+UV', slug: 'water-purifier-ro-uv', brand: 'Kent', price: 14999, mrp: 19999, isFeatured: false, tags: ['water purifier', 'ro', 'appliance'], rating: 4.3, reviewCount: 1100, stock: 65 },
  { category: 'appliances', name: 'Air Purifier HEPA', slug: 'air-purifier-hepa', brand: 'Dyson', price: 29999, mrp: 39999, isFeatured: true, tags: ['air purifier', 'hepa', 'appliance'], rating: 4.7, reviewCount: 450, stock: 25 },
  { category: 'appliances', name: 'Ceiling Fan BLDC Energy Saving', slug: 'ceiling-fan-bldc', brand: 'Atomberg', price: 3499, mrp: 4999, isFeatured: false, tags: ['fan', 'ceiling', 'energy saving'], rating: 4.8, reviewCount: 2200, stock: 150 },
  { category: 'appliances', name: 'Geyser 15L', slug: 'geyser-15l', brand: 'AO Smith', price: 8999, mrp: 11999, isFeatured: false, tags: ['geyser', 'water heater', 'appliance'], rating: 4.5, reviewCount: 800, stock: 90 },

  // Bedding & Bath
  { category: 'bedding-bath', name: 'Premium Cotton Bedsheet King', slug: 'premium-cotton-bedsheet-king', brand: 'Trident', price: 1299, mrp: 1999, isFeatured: true, tags: ['bedsheet', 'cotton', 'king size'], rating: 4.6, reviewCount: 1200, stock: 200 },
  { category: 'bedding-bath', name: 'Memory Foam Pillow Set of 2', slug: 'memory-foam-pillow-set-2', brand: 'Sleepyhead', price: 1999, mrp: 2999, isFeatured: false, tags: ['pillow', 'memory foam', 'set'], rating: 4.5, reviewCount: 850, stock: 150 },
  { category: 'bedding-bath', name: 'Lightweight Microfiber Comforter', slug: 'lightweight-microfiber-comforter', brand: 'Wakefit', price: 2499, mrp: 3499, isFeatured: true, tags: ['comforter', 'microfiber', 'bedding'], rating: 4.7, reviewCount: 1100, stock: 120 },
  { category: 'bedding-bath', name: 'Bath Towel Set 4pc Egyptian Cotton', slug: 'bath-towel-set-4pc', brand: 'Bombay Dyeing', price: 1799, mrp: 2599, isFeatured: false, tags: ['towel', 'bath', 'egyptian cotton'], rating: 4.4, reviewCount: 600, stock: 180 },
  { category: 'bedding-bath', name: 'Mattress Protector Waterproof', slug: 'mattress-protector-waterproof', brand: 'SleepyCat', price: 999, mrp: 1499, isFeatured: false, tags: ['mattress protector', 'waterproof', 'bedding'], rating: 4.3, reviewCount: 900, stock: 250 },
  { category: 'bedding-bath', name: 'Shower Curtain Designer', slug: 'shower-curtain-designer', brand: 'Kuber', price: 599, mrp: 899, isFeatured: false, tags: ['shower curtain', 'bath', 'designer'], rating: 4.2, reviewCount: 400, stock: 160 },
  { category: 'bedding-bath', name: 'Cotton Bath Mat Set of 2', slug: 'cotton-bath-mat-set-2', brand: 'Spaces', price: 799, mrp: 1199, isFeatured: false, tags: ['bath mat', 'cotton', 'set'], rating: 4.5, reviewCount: 350, stock: 210 },
  { category: 'bedding-bath', name: 'Weighted Blanket 7kg', slug: 'weighted-blanket-7kg', brand: 'Sunday Rest', price: 4999, mrp: 6999, isFeatured: true, tags: ['blanket', 'weighted', 'sleep'], rating: 4.8, reviewCount: 280, stock: 60 }
];

const sampleReviews = [
  { rating: 5, content: 'Absolutely love this product! The quality is top-notch and completely justifies the price.', userName: 'Rahul Sharma', isVerified: true },
  { rating: 4, content: 'Very good product, delivery was a bit delayed but overall satisfied with the purchase.', userName: 'Priya Patel', isVerified: true },
  { rating: 5, content: 'Exceeded my expectations. Looks exactly like the pictures and works perfectly.', userName: 'Amit Singh', isVerified: false },
  { rating: 4, content: 'Good value for money. Would recommend this to anyone looking for a reliable option.', userName: 'Neha Gupta', isVerified: true },
  { rating: 3, content: 'Decent product, but I feel there is room for improvement in the finish.', userName: 'Vikram Reddy', isVerified: true }
];

async function main() {
  console.log('Starting seed...');

  // Create a seed user for reviews
  const seedUser = await prisma.user.upsert({
    where: { email: 'seed@plancart.com' },
    update: {},
    create: {
      email: 'seed@plancart.com',
      name: 'PlanCart Reviewer',
      role: 'USER',
    },
  });

  // Create Categories
  for (const catData of categoriesData) {
    await prisma.category.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData
    });
  }
  console.log('Categories seeded.');

  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((c: { slug: string; id: string }) => [c.slug, c.id]));

  for (const product of productsData) {
    const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      console.error(`Category not found for product: ${product.name}`);
      continue;
    }

    const shortDescription = `${product.name} by ${product.brand} - A perfect choice for you.`;
    const description = `Discover the excellent quality of ${product.name} crafted carefully by ${product.brand}. This product is designed to meet your daily needs with style and efficiency. Enjoy the premium feel and long-lasting durability it brings to your lifestyle.`;
    const material = 'Premium Material';
    const dimensions = '30x30x30';
    const weight = 2.5;

    let catImages = [];
    switch (product.category) {
      case 'furniture': catImages = furnitureImages; break;
      case 'home-decor': catImages = decorImages; break;
      case 'lighting': catImages = lightingImages; break;
      case 'electronics': catImages = electronicsImages; break;
      case 'fashion': catImages = fashionImages; break;
      case 'kitchen': catImages = kitchenImages; break;
      case 'appliances': catImages = appliancesImages; break;
      case 'bedding-bath': catImages = beddingImages; break;
      default: catImages = furnitureImages;
    }

    const productImages = getImages(catImages, 3);
    const productVariants = getVariants();

    const createdProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description,
        shortDescription,
        brand: product.brand,
        material,
        dimensions,
        weight,
        price: product.price,
        mrp: product.mrp,
        discount,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        tags: product.tags,
        isFeatured: product.isFeatured,
        isActive: true,
        categoryId: categoryId,
        images: {
          deleteMany: {},
          create: productImages
        },
        variants: {
          deleteMany: {},
          create: productVariants
        }
      },
      create: {
        name: product.name,
        slug: product.slug,
        description,
        shortDescription,
        brand: product.brand,
        material,
        dimensions,
        weight,
        price: product.price,
        mrp: product.mrp,
        discount,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stock: product.stock,
        tags: product.tags,
        isFeatured: product.isFeatured,
        isActive: true,
        categoryId: categoryId,
        images: {
          create: productImages
        },
        variants: {
          create: productVariants
        }
      }
    });

    if (product.isFeatured) {
      // Add a couple of reviews for featured products
      for (let i = 0; i < 2; i++) {
        const review = sampleReviews[(Math.floor(Math.random() * sampleReviews.length))];
        await prisma.review.create({
          data: {
            rating: review.rating,
            title: review.rating >= 4 ? 'Great product!' : 'Decent product',
            content: review.content,
            isVerified: review.isVerified,
            productId: createdProduct.id,
            userId: seedUser.id,
          }
        }).catch((_e: unknown) => {
          // Ignore errors during re-seeding
        });
      }
    }
  }
  
  console.log('Products and Reviews seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
