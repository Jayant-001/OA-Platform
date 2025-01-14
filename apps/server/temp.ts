// import { CacheFactory } from "./src/services/redis-cache.service";
// import { CacheStrategy } from "./src/types/cache.types";
// import db from "./src/config/database";

// interface Product {
//     id: string;
//     name: string;
// }

// const productCache = CacheFactory.create<Product>(
//     { host: "localhost", port: 6379 },
//     "product_cache",
//     {
//         strategy: CacheStrategy.LRU,
//         maxEntries: 100,
//         ttl: 3600,
//     }
// );

// async function getProductById(id: string): Promise<Product | null> {
//     const cachedProduct = await productCache.get(`product:${id}`);
//     console.log('Cache data: ', cachedProduct)
//     if(cachedProduct) return cachedProduct;

//     const products = await db.any<Product>(`SELECT * FROM products WHERE id = $1`, [id]);
//     console.log("products: ", products)
//     const product = products[0] || null;

//     console.log("Db data: ", product);

//     if(product) {
//         await productCache.set(`product:${id}`, product);
//     }
//     return product;
// }

// const data = getProductById("101")

// console.log(data);



import { DuckDBConnection, DuckDBInstance } from '@duckdb/node-api';
 
class DBService {
    private instance: DuckDBInstance | null = null;
    public db: DuckDBConnection | null = null;

    constructor() {
        this.instance = null;
        this.db = null;
    }

    async connect() {
        if (!this.db) {
            try {
                this.instance = await DuckDBInstance.create('./duckdb.db');  // Persistent DB
                this.db = await this.instance.connect();
                console.log('Database connection established');
            } catch (error) {
                console.error('Error establishing database connection:', error);
                throw error;
            }
        }
    }

    async query(sql) {
        await this.connect();
        if(!this.db) return null;
        try {
            const result = await this.db.run(sql);
            return await result.getRows();
        } catch (error) {
            console.error('Error running query:', error);
            throw error;
        }
    }
 
    async close() {
        try {
            if (this.db) {
                await this.db.close();
                console.log('Database connection closed');
            }
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}
 
const db = new DBService();  // Export singleton instance
 
(async () => {
    try {
        const data = await db.query('select * from user_activities');
        console.log(data);
    } catch (error) {
        console.log("Error: ", error)
    }
    finally {
        await db.close();
    }
 
})()