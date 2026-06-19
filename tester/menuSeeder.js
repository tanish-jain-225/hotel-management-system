import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, ".env");

const DB_NAME = "hotelMenu";
const COLLECTIONS = {
    menuItems: "menuItems",
};

// Image URLs are hardcoded in the data and must be valid HTTP(S) links.

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return false;

    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        process.env[key] = value;
    }

    return true;
}

loadEnvFile(ENV_PATH);

const MONGO_URI = process.env.MONGO_URI;

const menuItems = [
    {
        name: "Paneer Tikka",
        cuisine: "North Indian",
        section: "Starters",
        price: 249,
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=900&q=80",
        info: "Char-grilled paneer cubes marinated in spices and served with mint chutney.",
    },
    {
        name: "Chicken 65",
        cuisine: "South Indian",
        section: "Starters",
        price: 279,
        image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=900&q=80",
        info: "A spicy, crispy chicken starter with curry leaves and a bold red masala.",
    },
    {
        name: "Veg Spring Rolls",
        cuisine: "Asian",
        section: "Starters",
        price: 199,
        image: "https://images.unsplash.com/photo-1541014741259-de529411b96e?auto=format&fit=crop&w=900&q=80",
        info: "Golden-fried rolls stuffed with vegetables and served with dipping sauce.",
    },
    {
        name: "Tomato Soup",
        cuisine: "Continental",
        section: "Soups",
        price: 149,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        info: "Smooth tomato soup finished with cream and herbs.",
    },
    {
        name: "Manchow Soup",
        cuisine: "Indo-Chinese",
        section: "Soups",
        price: 159,
        image: "https://images.unsplash.com/photo-1547592180-6047a3c5d6d1?auto=format&fit=crop&w=900&q=80",
        info: "Hot and savoury soup with vegetables, garlic, and crispy noodles.",
    },
    {
        name: "Hot & Sour Soup",
        cuisine: "Indo-Chinese",
        section: "Soups",
        price: 169,
        image: "https://images.unsplash.com/photo-1547592180-39fbc3d1b1f3?auto=format&fit=crop&w=900&q=80",
        info: "A balanced bowl of tangy, spicy broth with vegetables and mushrooms.",
    },
    {
        name: "Butter Chicken",
        cuisine: "North Indian",
        section: "Main Course",
        price: 399,
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80",
        info: "Classic creamy tomato-based chicken curry served with rich spices.",
    },
    {
        name: "Paneer Tikka Masala",
        cuisine: "North Indian",
        section: "Main Course",
        price: 369,
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
        info: "Paneer cubes simmered in a smoky onion-tomato gravy.",
    },
    {
        name: "Dal Tadka",
        cuisine: "North Indian",
        section: "Main Course",
        price: 219,
        image: "https://images.unsplash.com/photo-1626508035297-45c3c9877de0?auto=format&fit=crop&w=900&q=80",
        info: "Yellow lentils tempered with cumin, garlic, and ghee.",
    },
    {
        name: "Veg Kofta Curry",
        cuisine: "North Indian",
        section: "Main Course",
        price: 329,
        image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
        info: "Vegetable dumplings in a smooth, mildly spiced gravy.",
    },
    {
        name: "Chicken Biryani",
        cuisine: "Hyderabadi",
        section: "Biryani",
        price: 349,
        image: "https://images.unsplash.com/photo-1563379091339-03246963d595?auto=format&fit=crop&w=900&q=80",
        info: "Fragrant basmati rice layered with marinated chicken and saffron spices.",
    },
    {
        name: "Veg Biryani",
        cuisine: "Hyderabadi",
        section: "Biryani",
        price: 279,
        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=900&q=80",
        info: "Aromatic rice cooked with vegetables, herbs, and whole spices.",
    },
    {
        name: "Mutton Biryani",
        cuisine: "Hyderabadi",
        section: "Biryani",
        price: 449,
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80",
        info: "Slow-cooked mutton layered with spiced rice for a premium main dish.",
    },
    {
        name: "Veg Hakka Noodles",
        cuisine: "Indo-Chinese",
        section: "Chinese",
        price: 239,
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80",
        info: "Stir-fried noodles tossed with vegetables, soy, and garlic.",
    },
    {
        name: "Veg Manchurian",
        cuisine: "Indo-Chinese",
        section: "Chinese",
        price: 259,
        image: "https://images.unsplash.com/photo-1625937329934-5e9a2d2e30f7?auto=format&fit=crop&w=900&q=80",
        info: "Crispy vegetable balls served in a savoury manchurian sauce.",
    },
    {
        name: "Chilli Chicken",
        cuisine: "Indo-Chinese",
        section: "Chinese",
        price: 319,
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc500f?auto=format&fit=crop&w=900&q=80",
        info: "A spicy stir-fried chicken dish with peppers, garlic, and soy glaze.",
    },
    {
        name: "Masala Dosa",
        cuisine: "South Indian",
        section: "South Indian",
        price: 199,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
        info: "Crispy dosa filled with spiced potato masala and served with chutneys.",
    },
    {
        name: "Idli Sambar",
        cuisine: "South Indian",
        section: "South Indian",
        price: 179,
        image: "https://images.unsplash.com/photo-1626132647523-66df1f3d2f6d?auto=format&fit=crop&w=900&q=80",
        info: "Soft steamed idlis served with sambar and coconut chutney.",
    },
    {
        name: "Uttapam",
        cuisine: "South Indian",
        section: "South Indian",
        price: 189,
        image: "https://images.unsplash.com/photo-1617622141664-bb564f22f8ae?auto=format&fit=crop&w=900&q=80",
        info: "Thick rice pancake topped with onions, tomatoes, and herbs.",
    },
    {
        name: "Cold Coffee",
        cuisine: "Beverages",
        section: "Beverages",
        price: 129,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1f4f6?auto=format&fit=crop&w=900&q=80",
        info: "Chilled coffee blended with milk and a smooth frothy finish.",
    },
    {
        name: "Fresh Lime Soda",
        cuisine: "Beverages",
        section: "Beverages",
        price: 99,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
        info: "A refreshing citrus drink served sweet or salty.",
    },
    {
        name: "Mango Lassi",
        cuisine: "Beverages",
        section: "Beverages",
        price: 139,
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=900&q=80",
        info: "Creamy yogurt drink blended with ripe mango pulp.",
    },
    {
        name: "Gulab Jamun",
        cuisine: "Desserts",
        section: "Desserts",
        price: 129,
        image: "https://images.unsplash.com/photo-1605197348512-6f52b4f0a0c4?auto=format&fit=crop&w=900&q=80",
        info: "Soft milk dumplings soaked in warm sugar syrup.",
    },
    {
        name: "Chocolate Brownie",
        cuisine: "Desserts",
        section: "Desserts",
        price: 149,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
        info: "Rich chocolate brownie served as a warm indulgent dessert.",
    },
    {
        name: "Ice Cream Sundae",
        cuisine: "Desserts",
        section: "Desserts",
        price: 169,
        image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=900&q=80",
        info: "Layered ice cream dessert topped with syrup and nuts.",
    },
];

function validateMenuItem(item) {
    const requiredFields = ["name", "cuisine", "section", "price", "image", "info"];

    for (const field of requiredFields) {
        if (!(field in item) || item[field] === "" || item[field] === null || item[field] === undefined) {
            throw new Error(`Invalid menu item: missing ${field}`);
        }
    }

    const parsedPrice = Number(item.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error(`Invalid price for menu item: ${item.name}`);
    }

    // validate image URL; fallback to placeholder when invalid
    // validate image URL strictly — must be a proper http(s) URL
    const imageUrl = String(item.image).trim();
    try {
        const u = new URL(imageUrl);
        if (!["http:", "https:"].includes(u.protocol)) throw new Error("invalid protocol");
    } catch (e) {
        throw new Error(`Invalid image URL for menu item: ${item.name} -> ${imageUrl}`);
    }

    return {
        name: String(item.name).trim(),
        cuisine: String(item.cuisine).trim(),
        section: String(item.section).trim(),
        price: parsedPrice,
        image: imageUrl,
        info: String(item.info).trim(),
    };
}

async function seedMenu() {
    const args = new Set(process.argv.slice(2));
    const reset = args.has("--reset");
    const dryRun = args.has("--dry-run");

    const normalizedMenuItems = menuItems.map(validateMenuItem);

    if (dryRun) {
        console.log(`[dry-run] ${normalizedMenuItems.length} menu items ready to seed in ${DB_NAME}.${COLLECTIONS.menuItems}.`);
        return;
    }

    if (!MONGO_URI) {
        throw new Error(
            "Missing MONGO_URI. Add it to tester/.env or set it in your environment before running the seeder."
        );
    }

    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const menuCollection = db.collection(COLLECTIONS.menuItems);

        let existingCount = await menuCollection.countDocuments();

        if (reset) {
            const deleteResult = await menuCollection.deleteMany({});
            console.log(`Cleared ${deleteResult.deletedCount} existing menu items.`);

            existingCount = 0;
        } else if (existingCount > 0) {
            console.log(
                `Skipped seeding because ${existingCount} menu items already exist in ${DB_NAME}.${COLLECTIONS.menuItems}. Make sure database is empty to seed new items for testing.`
            );
            return;
        }
        const insertResult = await menuCollection.insertMany(normalizedMenuItems, { ordered: true });
        const totalCount = await menuCollection.countDocuments();
        console.log("Menu seeding complete.");
        console.log(
            `Inserted: ${insertResult.insertedCount}, Updated: 0, Total menu items: ${totalCount}`
        );
    } finally {
        await client.close();
    }
}

seedMenu().catch((error) => {
    console.error("Menu seeding failed:", error.message || error);
    process.exitCode = 1;
});
