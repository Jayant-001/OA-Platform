import { Request, Response } from "express"
import duckDbClient from "../config/duckDbClient";


export const testController = async (req: Request, res: Response) => {
    await duckDbClient.connect();
    
    let data = {}
    if(duckDbClient.db) {
        const query = `
            WITH ranked_activities AS (
                SELECT 
                    contest_id,
                    user_id,
                    activity,
                    time,
                    ROW_NUMBER() OVER (PARTITION BY user_id, contest_id ORDER BY time DESC) AS rn
                FROM user_activities
            )
            SELECT 
                contest_id,
                user_id,
                activity,
                time
            FROM ranked_activities
            WHERE rn = 1;
        `
        data = await duckDbClient.query(query);
        // const prepared = await duckDbClient.db.prepare('INSERT INTO user_activities (id, contest_id, user_id, activity, time) VALUES ($1, $2, $3, $4, $5)');
        // const result = await prepared.run();
        // data = await result.getRows();
    }

    console.log(data)

    res.json({data: ""})
}