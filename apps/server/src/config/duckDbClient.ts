import { DuckDBInstance, DuckDBConnection, DuckDBResult } from '@duckdb/node-api';

class DBService {
    private instance: DuckDBInstance | null = null;
    public db: DuckDBConnection | null = null;

    constructor() {
        this.connect();
    }

    // Connect to the database
    async connect(): Promise<void> {
        if (!this.db) {
            try {
                this.instance = await DuckDBInstance.create('./duckdb.db'); // Persistent DB
                this.db = await this.instance.connect();
                console.log('DuckDB connection established');
            } catch (error) {
                console.error('Error establishing database connection:', error);
                throw error;
            }
        }
    }

    // Run a query
    async query(sql: string): Promise<any[]> {
        await this.connect();
        try {
            const result: DuckDBResult = await this.db!.run(sql);
            return await result.getRows();
        } catch (error) {
            console.error('Error running query:', error);
            throw error;
        }
    }

    // Close the database connection
    async close(): Promise<void> {
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
export default db;