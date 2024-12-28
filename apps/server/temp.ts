import { CacheFactory } from "./src/services/redis-cache.service";
import { CacheStrategy } from "./src/types/cache.types";
import db from "./src/config/database";

interface Product {
    id: string;
    name: string;
}

const productCache = CacheFactory.create<Product>(
    { host: "localhost", port: 6379 },
    "product_cache",
    {
        strategy: CacheStrategy.LRU,
        maxEntries: 100,
        ttl: 3600,
    }
);

async function getProductById(id: string): Promise<Product | null> {
    const cachedProduct = await productCache.get(`product:${id}`);
    console.log('Cache data: ', cachedProduct)
    if(cachedProduct) return cachedProduct;

    const products = await db.any<Product>(`SELECT * FROM products WHERE id = $1`, [id]);
    console.log("products: ", products)
    const product = products[0] || null;

    console.log("Db data: ", product);

    if(product) {
        await productCache.set(`product:${id}`, product);
    }
    return product;
}

const data = getProductById("101")

console.log(data);