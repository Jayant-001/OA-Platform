import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import ActivityRepository from "../repositories/ActivityRepository";

export class SocketController {
    private io: Server<
        DefaultEventsMap,
        DefaultEventsMap,
        DefaultEventsMap,
        any
    >;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
    private activityRepository;

    constructor(io: Server) {
        this.io = io;
        this.setupEventHandlers();
        this.activityRepository = new ActivityRepository();
    }

    private setupEventHandlers() {
        this.io.on("connection", (socket: Socket) => {
            console.log("Client connected:", socket.id);

            socket.on("activity:change", async (data) => {
                try {
                    const {userId, activityType, timestamp, contestId} = data;
                    this.activityRepository.addActivity(contestId, userId, activityType, timestamp);
                    console.log("Activity data: ", data);
                } catch (error) {
                    console.log(error);
                }
            });

            // Handle user joining contest
            socket.on("join-contest", (contestId: string, userId: string) => {
                socket.join(`contest:${contestId}`);
                this.connectedUsers.set(userId, socket.id);
                console.log(`User ${userId} joined contest ${contestId}`);
            });

            // Handle user leaving contest
            socket.on("leave-contest", (contestId: string, userId: string) => {
                socket.leave(`contest:${contestId}`);
                this.connectedUsers.delete(userId);
                console.log(`User ${userId} left contest ${contestId}`);
            });

            // Handle submission updates
            socket.on(
                "submission-update",
                (data: {
                    contestId: string;
                    userId: string;
                    status: string;
                }) => {
                    this.io
                        .to(`contest:${data.contestId}`)
                        .emit("leaderboard-update", {
                            userId: data.userId,
                            status: data.status,
                            timestamp: new Date(),
                        });
                }
            );

            // Handle user activity monitoring
            socket.on(
                "user-activity",
                (data: {
                    userId: string;
                    status: "online" | "offline";
                    contestId: string;
                }) => {
                    this.io
                        .to(`contest:${data.contestId}`)
                        .emit("activity-update", {
                            userId: data.userId,
                            status: data.status,
                            timestamp: new Date(),
                        });
                }
            );

            // Handle disconnection
            socket.on("disconnect", () => {
                // Find and remove disconnected user
                for (const [
                    userId,
                    socketId,
                ] of this.connectedUsers.entries()) {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        break;
                    }
                }
            });
        });
    }

    // Utility methods for other parts of the application to use
    public notifyLeaderboardUpdate(contestId: string, data: any) {
        this.io.to(`contest:${contestId}`).emit("leaderboard-update", data);
    }

    public notifyContestUpdate(contestId: string, data: any) {
        this.io.to(`contest:${contestId}`).emit("contest-update", data);
    }

    public isUserConnected(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }
}
