import duckDbClient from "../config/duckDbClient";
import { v4 as uuidv4 } from 'uuid';  // Use 'uuid' library for UUID generation

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
}

export default ActivityRepository;
