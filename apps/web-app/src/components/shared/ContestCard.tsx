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
                    Starts: {new Date(contest.startTime).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Problems: {contest.problemCount}</p>
                <p className="mb-4">Duration: {contest.duration} minutes</p>
                {isDashboard ? (
                    <Button
                        onClick={() =>
                            navigate(`contests/${contest.id}/update`)
                        }
                        variant="outline"
                    >
                        Update Contest
                    </Button>
                ) : (
                    <Button
                        onClick={() => navigate(`contests/${contest.id}`)}
                        variant="outline"
                    >
                        View Details
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
