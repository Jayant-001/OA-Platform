import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contest } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";

interface ContestCardProps {
    contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
    const location = useLocation();
    const navigate = useNavigate();

    // Check if the route includes 'dashboard'
    const isDashboard = location.pathname.includes("/dashboard");

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle>{contest.title}</CardTitle>
                <CardDescription>
                    Starts: {new Date(contest.start_time).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col justify-between items-stretch h-[100%] border">
                    <div className="flex-grow">
                        <p className="mb-4">Code: {contest.contest_code} </p>
                        <p className="mb-4">
                            Join Duration: {contest.join_duration}
                        </p>
                    </div>

                    <Button
                        onClick={() => navigate(`contests/${contest.id}`)}
                        variant="outline"
                    >
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
