import { Request, Response } from "express";
import duckDbClient from "../config/duckDbClient";

export const testController = async (req: Request, res: Response) => {
    await duckDbClient.connect();

    let data = {};
    if (duckDbClient.db) {
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
        `;
        const q2 = `
            WITH activity_pairs AS (
                -- Assign row numbers to each activity partitioned by user_id and contest_id and ordered by timestamp
                SELECT
                    id,
                    contest_id,
                    user_id,
                    activity,
                    time,
                    LEAD(time) OVER (PARTITION BY user_id, contest_id ORDER BY time) AS next_activity_time,
                    LEAD(activity) OVER (PARTITION BY user_id, contest_id ORDER BY time) AS next_activity
                FROM user_activities
                WHERE user_id = 'd7426557-82a7-470b-bb9a-68a99dc8daa8'  -- Pass the user_id you want
                AND contest_id = '4c035bef-fdf3-4eda-823b-f5928d5c1775'  -- Pass the contest_id you want
            )

            -- Calculate the time difference between offline and next online activities
            SELECT
                user_id,
                contest_id,
                SUM(EXTRACT(EPOCH FROM (next_activity_time - time)) / 60) AS total_offline_time_minutes
            FROM activity_pairs
            WHERE activity = 'went offline' AND next_activity = 'came online'  -- Ensure pairing offline with next online activity
            GROUP BY user_id, contest_id;
        `;

        const q3 = `
WITH activity_pairs AS (
    -- Assign row numbers to each activity partitioned by user_id and contest_id and ordered by timestamp
    SELECT
        id,
        contest_id,
        user_id,
        activity,
        time,
        LEAD(time) OVER (PARTITION BY user_id, contest_id ORDER BY time) AS next_activity_time,
        LEAD(activity) OVER (PARTITION BY user_id, contest_id ORDER BY time) AS next_activity
    FROM user_activities
    WHERE contest_id = '4c035bef-fdf3-4eda-823b-f5928d5c1775'  -- Replace with contest_id you want
),
offline_times AS (
    -- Calculate the total offline time in seconds for each user
    SELECT
        user_id,
        CEIL(SUM(EXTRACT(EPOCH FROM (next_activity_time - time)))) AS total_offline_time_seconds
    FROM activity_pairs
    WHERE activity = 'went offline'
      AND next_activity = 'came online'
      AND next_activity_time IS NOT NULL
    GROUP BY user_id
),
latest_activity AS (
    -- Get the latest activity for each user in the contest
    SELECT
        user_id,
        activity AS current_status
    FROM (
        SELECT 
            user_id,
            activity,
            ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY time DESC) AS rn
        FROM user_activities
        WHERE contest_id = '4c035bef-fdf3-4eda-823b-f5928d5c1775'  -- Replace with contest_id you want
    ) AS subquery
    WHERE rn = 1
)
-- Combine offline time and last activity data
SELECT
    u.user_id,
    COALESCE(o.total_offline_time_seconds, 0) AS total_offline_time_seconds,
    COALESCE(l.current_status, 'No activity') AS current_status
FROM (SELECT DISTINCT user_id FROM user_activities WHERE contest_id = '4c035bef-fdf3-4eda-823b-f5928d5c1775') u
LEFT JOIN offline_times o ON u.user_id = o.user_id
LEFT JOIN latest_activity l ON u.user_id = l.user_id
ORDER BY u.user_id;

        `;
        data = await duckDbClient.query(q3);
        // const prepared = await duckDbClient.db.prepare('INSERT INTO user_activities (id, contest_id, user_id, activity, time) VALUES ($1, $2, $3, $4, $5)');
        // const result = await prepared.run();
        // data = await result.getRows();
    }

    console.log(data);

    res.json({ data: "" });
};
