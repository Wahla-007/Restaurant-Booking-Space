export const restaurants = [
    {
        id: 1,
        name: "Nebula Dining",
        cuisine: "Molecular Gastronomy",
        rating: 4.9,
        reviewCount: 342,
        price: "$$$$",
        location: "Downtown",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        images: [
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Experience food at the atomic level in a setting that defies gravity. Our chefs use state-of-the-art techniques to transform familiar flavors into unexpected textures and forms.",
        menu: {
            highlights: [
                { name: "Liquid Nitrogen Olive", price: 12, description: "Spherical olive essence encasing pure flavor." },
                { name: "Deconstructed Lasagna", price: 34, description: "Layers of foam, gel, and crisp pasta." },
                { name: "Edible Helium Balloon", price: 18, description: "Green apple taffy filled with helium." }
            ]
        },
        reviews: [
            { user: "Alex T.", rating: 5, date: "2 days ago", text: "Mind-blowing experience. The helium balloon was fun and delicious!", initial: "A" },
            { user: "Sarah J.", rating: 4, date: "1 week ago", text: "Expensive, but worth it for the show.", initial: "S" }
        ],
        tags: ["Romantic", "Special Occasion", "Innovative"]
    },
    {
        id: 2,
        name: "The Glass House",
        cuisine: "Modern European",
        rating: 4.7,
        reviewCount: 128,
        price: "$$$",
        location: "West End",
        coordinates: { lat: 40.7580, lng: -73.9855 },
        images: [
            "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Transparency in every ingredient, served in a crystal-clear environment. Enjoy panoramic views of the city skyline while dining.",
        menu: {
            highlights: [
                { name: "Truffle Risotto", price: 28, description: "Aged arborio rice with black truffle shavings." },
                { name: "Pan-Seared Scallops", price: 32, description: "Cauliflower purée, caper raisin emulsion." }
            ]
        },
        reviews: [
            { user: "Michael B.", rating: 5, date: "3 weeks ago", text: "The view is stunning and the risotto is to die for.", initial: "M" }
        ],
        tags: ["View", "Outdoor Seating", "Chic"]
    },
    {
        id: 3,
        name: "Sakura Zen",
        cuisine: "Japanese Fusion",
        rating: 4.8,
        reviewCount: 512,
        price: "$$$",
        location: "Financial District",
        images: [
            "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&q=80&w=800"
        ],
        description: "A peaceful retreat offering the finest sushi and sake pairings. Traditional techniques meet modern flavors.",
        menu: {
            highlights: [
                { name: "Omakase Experience", price: 120, description: "Chef's selection of 12 seasonal nigiri." },
                { name: "Wagyu Beef Tataki", price: 45, description: "Seared A5 Wagyu with ponzu sauce." }
            ]
        },
        reviews: [
            { user: "Jin K.", rating: 5, date: "Yesterday", text: "Best sushi in the city, hands down.", initial: "J" }
        ],
        tags: ["Sushi", "Quiet", "Business Dining"]
    },
    {
        id: 4,
        name: "El Fuego",
        cuisine: "Spanish Tapas",
        rating: 4.5,
        reviewCount: 89,
        price: "$$",
        location: "SoHo",
        images: [
            "https://images.unsplash.com/photo-1563507466359-2614ddf65f0a?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Fiery flavors and passionate performances every night. Features live flamenco music on weekends.",
        menu: {
            highlights: [
                { name: "Patatas Bravas", price: 10, description: "Crispy potatoes with spicy tomato sauce." },
                { name: "Gambas al Ajillo", price: 16, description: "Shrimp sautéed in garlic and chili oil." }
            ]
        },
        reviews: [
            { user: "Elena R.", rating: 4, date: "1 month ago", text: "Great vibes, but gets a bit loud.", initial: "E" }
        ],
        tags: ["Live Music", "Groups", "Lively"]
    },
    {
        id: 5,
        name: "Azure Coast",
        cuisine: "Mediterranean",
        rating: 4.6,
        reviewCount: 210,
        price: "$$$",
        location: "Harbor Front",
        images: [
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1529312266912-b33cf6227e2f?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Fresh seafood and ocean breezes in the heart of the city. Inspired by the French Riviera.",
        menu: {
            highlights: [
                { name: "Grilled Branzino", price: 36, description: "Whole fish with herbs and lemon." },
                { name: "Mezze Platter", price: 24, description: "Hummus, babaganoush, tabbouleh, and pita." }
            ]
        },
        reviews: [],
        tags: ["Seafood", "Patio", "Casual Elegant"]
    },
    {
        id: 6,
        name: "Urban Roots",
        cuisine: "Farm-to-Table",
        rating: 4.7,
        reviewCount: 156,
        price: "$$",
        location: "Chelsea",
        images: [
            "https://images.unsplash.com/photo-1466978913421-dad93866169b?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=800"
        ],
        description: "Sustainable, organic, and incredibly delicious plant-forward dishes. We source everything within 100 miles.",
        menu: {
            highlights: [
                { name: "Harvest Bowl", price: 18, description: "Quinoa, roasted root vegetables, tahini dressing." },
                { name: "Mushroom Bolognese", price: 22, description: "House-made tagliatelle with wild mushroom ragu." }
            ]
        },
        reviews: [],
        tags: ["Vegan Friendly", "Healthy", "Sustainable"]
    }
];
