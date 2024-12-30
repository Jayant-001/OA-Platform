import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Code, ArrowRight, Timer } from "lucide-react";
import { Contest } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";
import { format, addMinutes } from "date-fns";

interface ContestCardProps {
    contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if the route includes 'dashboard'
    const isDashboard = location.pathname.includes("/dashboard");

    const getStatusBadge = () => {
        const status = {
            live: "bg-green-100 text-green-700 border-green-200",
            upcoming: "bg-blue-100 text-blue-700 border-blue-200",
            past: "bg-slate-100 text-slate-700 border-slate-200",
        }[contest.status || "upcoming"];

        return (
            <span className={`px-2 py-1 rounded-full text-sm border ${status}`}>
                {contest.status?.toUpperCase()}
            </span>
        );
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-purple-200">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">
                        {contest.title}
                    </CardTitle>
                    {getStatusBadge()}
                </div>
                <CardDescription className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                            Starts:{" "}
                            {format(new Date(contest.start_time), "PPp")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                            Ends:{" "}
                            {format(
                                addMinutes(
                                    new Date(contest.start_time),
                                    contest.duration
                                ),
                                "PPpp"
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        <span>Duration: {contest.duration} minutes</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        {isDashboard && (
                            <div className="flex items-center gap-2 text-slate-600">
                                <Code className="w-4 h-4" />
                                <span>Code: {contest.contest_code}</span>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => navigate(`contests/${contest.id}`)}
                        variant="default"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
