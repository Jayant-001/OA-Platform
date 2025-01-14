import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Timer, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LeaderboardUser } from "@/types";

const mockUsers: LeaderboardUser[] = [
    { id: "1", name: "Alex Johnson", score: 300, finishTime: "1:45:30", rank: 3 },
    { id: "2", name: "Sarah Smith", score: 275, finishTime: "1:50:20", rank: 3 },
    { id: "3", name: "Michael Brown", score: 250, finishTime: "2:00:15", rank: 3 },
    { id: "4", name: "Emily Davis", score: 225, finishTime: "2:15:45", rank: 3 },
    { id: "5", name: "David Wilson", score: 200, finishTime: "2:30:00", rank: 3 },
];

export function LeaderboardCard({leaderboardUsers}: {leaderboardUsers: LeaderboardUser[]}) {
    const navigate = useNavigate();

    return (
        <Card className="backdrop-blur-sm bg-white/90 border-slate-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    Top Performers
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-2 pb-2 mb-2 border-b text-sm font-medium text-slate-600">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2 text-right">Score</div>
                    <div className="col-span-3 text-right">Finish Time</div>
                </div>
                
                <div className="space-y-4">
                    {leaderboardUsers.slice(0, 5).map((user, index) => (
                        <div
                            key={user.id}
                            className="grid grid-cols-12 gap-2 py-2 border-b last:border-b-0 items-center"
                        >
                            <div className="col-span-2 flex items-center justify-start">
                                {index < 3 ? (
                                    <Medal className={`w-4 h-4 ${
                                        index === 0 ? "text-yellow-500" :
                                        index === 1 ? "text-slate-400" :
                                        "text-amber-600"
                                    }`} />
                                ) : (
                                    <span className="text-slate-600 flex items-center">
                                        <Hash className="w-3 h-3 mr-0.5" />
                                        {user.rank}
                                    </span>
                                )}
                            </div>
                            <div className="col-span-5 font-medium truncate">
                                {user.name}
                            </div>
                            <div className="col-span-2 text-right text-purple-600 font-semibold">
                                {user.score}
                            </div>
                            <div className="col-span-3 flex items-center justify-end gap-1 text-sm text-slate-500">
                                <Timer className="w-3 h-3" />
                                <span>{user.finishTime.substring(0, 4)}</span>
                            </div>
                        </div>
                    ))}
                </div>
                
                <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("leaderboard")}
                >
                    View Full Leaderboard
                </Button>
            </CardContent>
        </Card>
    );
}
