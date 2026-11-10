export const services = [
  {
    id: 1,
    title: "Business Cards",
    description: "Professional business cards for your brand.",
    image: "/images/business-cards.jpg",
    price: 50,
  },
  {
    id: 2,
    title: "Flyers",
    description: "Eye-catching flyers for promotions.",
    image: "/images/flyers.jpg",
    price: 30,
  },
  {
    id: 3,
    title: "Banners",
    description: "Large banners for events and advertising.",
    image: "/images/banners.jpg",
    price: 100,
  },
  {
    id: 4,
    title: "Posters",
    description: "High-quality posters for various uses.",
    image: "/images/posters.jpg",
    price: 40,
  },
  {
    id: 5,
    title: "Brochures",
    description: "Informative brochures for your business.",
    image: "/images/brochures.jpg",
    price: 60,
  },
  {
    id: 6,
    title: "Stickers",
    description: "Custom stickers for branding.",
    image: "/images/stickers.jpg",
    price: 20,
  },
];

export const categories = [
  {
    id: 1,
    name: "Bundles",
    description: "Special bundle offers for multiple products.",
    image: "/images/bundles.jpg",
  },
  {
    id: 2,
    name: "Wedding Specials",
    description: "Special printing services for weddings.",
    image: "/images/wedding.jpg",
  },
  {
    id: 3,
    name: "Clothing Packaging",
    description: "Packaging solutions for clothing items.",
    image: "/images/clothing-packaging.jpg",
  },
  {
    id: 4,
    name: "Office Stationery",
    description: "Stationery items for office use.",
    image: "/images/office-stationery.jpg",
  },
  {
    id: 5,
    name: "Corporate Giveaways",
    description: "Branded giveaways for corporate events.",
    image: "/images/corporate-giveaways.jpg",
  },
  {
    id: 6,
    name: "Stickers",
    description: "Custom stickers for branding.",
    image: "/images/stickers.jpg",
  },
  {
    id: 7,
    name: "Labels & Tags",
    description: "Labels and tags for products.",
    image: "/images/labels-tags.jpg",
  },
  {
    id: 8,
    name: "Packaging",
    description: "General packaging solutions.",
    image: "/images/packaging.jpg",
  },
];

export const products = [
  {
    id: "1",
    name: "Mini Startup Packaging Bundle",
    categoryId: 1,
    productType: "bundle",
    bundleGroup: "Startup Bundle",
    price: 4000,
    compareAtPrice: 5000,
    discountText: "Get flat 20% off on whole bundle.",
    shortNote: "Perfect starter pack for boutique and handmade brands.",
    description: "A ready-to-order starter bundle with tags, cards, and stickers for product packaging.",
    images: [
      "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=900&q=80"
    ],
    materials: [
      "300gsm card material",
      "Premium quality sticker",
      "Single side glossy printing"
    ],
    bundleItems: [
      {
        title: "100 x 2x2 Inches Round Sticker",
        details: "Glossy thick material",
        price: 10,
        originalPrice: 12,
        image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=200&q=80"
      },
      {
        title: "100 x Shaped Hang Tags",
        details: "Custom die-cut hang tags",
        price: 10,
        originalPrice: 12,
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=200&q=80"
      },
      {
        title: "100 x Business Cards",
        details: "3.5x2 inches, single side",
        price: 7,
        originalPrice: 9,
        image: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=200&q=80"
      }
    ],
    uploadNote: "Upload your design (PDF source file recommended for quality printing output).",
    sku: "BND-START-001"
  },
  {
    id: "2",
    name: "Standard Business Card",
    categoryId: 4,
    price: 50,
    description: "Standard size business card.",
    image: "/images/business-card.jpg",
  },
  // Add more products as needed
];
