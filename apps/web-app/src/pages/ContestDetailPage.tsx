import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Contest } from "@/types";
import { contests } from "@/data";

export function ContestDetailPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState<Contest | null>(null);

    const location = useLocation();
    // Check if the route includes 'dashboard'
    const isDashboard = location.pathname.includes("/dashboard/");

    useEffect(() => {
        if (contest_id) {
            setContest(
                contests.find((contest) => contest.id === contest_id) || null
            );
        }
    }, [contest_id]);

    if (!contest) return <div>Loading...</div>;

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>{contest.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">Rules</h3>
                        <ul className="list-disc pl-6">
                            {/* {contest.rules.map((rule, index) => (
                                <li key={index}>{rule}</li>
                            ))} */}
                            {contest.description}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Start Time</h3>
                            <p>
                                {new Date(contest.startTime).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Duration</h3>
                            <p>{contest.duration} minutes</p>
                        </div>
                    </div>

                    <>
                        {isDashboard ? (
                            <div className="space-y-5">
                                <Button
                                    onClick={() =>
                                        navigate(
                                            `/contests/${contest_id}/update`
                                        )
                                    }
                                    className="w-full"
                                >
                                    Update Contest
                                </Button>
                                <Button
                                    variant={"destructive"}
                                    onClick={() => {
                                        // Delete contest api call
                                    }}
                                    className="w-full"
                                >
                                    Delete Contest
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Button
                                    onClick={() =>
                                        navigate(
                                            `/contests/${contest_id}/problems`
                                        )
                                    }
                                    className="w-full"
                                >
                                    Join Contest
                                </Button>
                            </>
                        )}
                    </>
                </CardContent>
            </Card>
        </div>
    );
}
