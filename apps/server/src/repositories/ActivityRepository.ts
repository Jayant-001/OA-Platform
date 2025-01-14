import duckDbClient from "../config/duckDbClient";
import { v4 as uuidv4 } from 'uuid';  // Use 'uuid' library for UUID generation
import { ACTIVITY } from "../types/constants";

class ActivityRepository {
    async createTable() {
        const query = `CREATE TABLE user_activities (id string PRIMARY KEY, contest_id string, user_id string, activity varchar(30), time timestamp)`;
        return await duckDbClient.query(query);
    }

    async dropTable() {
        const query = `drop table user_activities`
        return await duckDbClient.query(query);
    }

    async addActivity (contest_id: string, user_id: string, activity: string, time: string) {
        await duckDbClient.connect();
        if(duckDbClient.db) {
            const prepared = await duckDbClient.db.prepare('INSERT INTO user_activities (id, contest_id, user_id, activity, time) VALUES ($1, $2, $3, $4, $5)');
            prepared.bindVarchar(1, uuidv4())
            prepared.bindVarchar(2, contest_id);
            prepared.bindVarchar(3, user_id);
            prepared.bindVarchar(4, activity);
            prepared.bindVarchar(5, time);
            const result = await prepared.run();
            return await result.getRows();
        }
    }

    async getActivitiesByContestId(contestId: string) {
        await duckDbClient.connect();
        if(duckDbClient.db) {
            const prepared = await duckDbClient.db.prepare('select * from user_activities where contest_id = $1');
            prepared.bindVarchar(1, contestId);
            const result = await prepared.run();
            return await result.getRows();
        }
        return null;
    }

    async getContestActivitiesByUserId(contestId: string, userId: string) {
        await duckDbClient.connect();
        if(duckDbClient.db) {
            const prepared = await duckDbClient.db.prepare('select * from user_activities where contest_id = $1 AND user_id = $2');
            prepared.bindVarchar(1, contestId);
            prepared.bindVarchar(2, userId);
            const result = await prepared.run();
            return await result.getRows();
        }
        return null;
    }
    
    async getAllActivities() {
        try {
            await duckDbClient.connect();
            if(duckDbClient.db) {
                const query = `select * from user_activities`;
                return await duckDbClient.query(query);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getOfflineSecondsForUser(contestId: string, userId: string) {
        const query = `
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
                WHERE user_id = $1  -- Pass the user_id
                AND contest_id = $2  -- Pass the contest_id
            )

            -- Calculate the total offline time in seconds
            SELECT
                SUM(EXTRACT(EPOCH FROM (next_activity_time - time))) AS total_offline_time_seconds
            FROM activity_pairs
            WHERE activity = '${ACTIVITY.OFFLINE}' 
            AND next_activity = '${ACTIVITY.ONLINE}'  -- Ensure pairing offline with next online activity
            AND next_activity_time IS NOT NULL;  -- To ensure the next activity exists
        `;

        await duckDbClient.connect();
        if(duckDbClient.db) {
            const prepared = await duckDbClient.db.prepare(query);
            prepared.bindVarchar(1, userId);
            prepared.bindVarchar(2, contestId);
            const result = await prepared.run();
            return await result.getRows();
        }
        return null;
    }

    async getActivitySummaryByContestId (contestId: string) {
        const query = `
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
                WHERE contest_id = $1  -- Replace with contest_id you want
            ),
            offline_times AS (
                -- Calculate the total offline time in seconds for each user
                SELECT
                    user_id,
                    CEIL(SUM(EXTRACT(EPOCH FROM (next_activity_time - time)))) AS total_offline_time_seconds
                FROM activity_pairs
                WHERE activity = '${ACTIVITY.OFFLINE}'
                AND next_activity = '${ACTIVITY.ONLINE}'
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
                    WHERE contest_id = $2  -- Replace with contest_id you want
                ) AS subquery
                WHERE rn = 1
            )
            -- Combine offline time and last activity data
            SELECT
                u.user_id,
                COALESCE(o.total_offline_time_seconds, 0) AS total_offline_time_seconds,
                COALESCE(l.current_status, 'No activity') AS current_status
            FROM (SELECT DISTINCT user_id FROM user_activities WHERE contest_id = $3) u
            LEFT JOIN offline_times o ON u.user_id = o.user_id
            LEFT JOIN latest_activity l ON u.user_id = l.user_id
            ORDER BY u.user_id;
        `;
        await duckDbClient.connect();
        if(duckDbClient.db) {
            const prepared = await duckDbClient.db.prepare(query);
            prepared.bindVarchar(1, contestId);
            prepared.bindVarchar(2, contestId);
            prepared.bindVarchar(3, contestId);
            const result = await prepared.run();
            return await result.getRows();
        }
        return null;
    }
}

export default ActivityRepository;
