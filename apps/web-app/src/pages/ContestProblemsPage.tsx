import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from "react-icons/fa";
import { useProblemContext } from "@/context/ProblemContext";

export function ContestProblemsPage() {
    const { contest_id } = useParams();
    const navigate = useNavigate();
    const { problems ,loading} = useProblemContext();

    // useEffect(() => {
    //     if (!contest_id) {
    //         toast.error("Contest ID not provided");
    //         return;
    //     }

    //    // if (problems.length === 0) {
    //         const fetchProblemsData = async () => {
    //             await fetchProblems(contest_id);
    //             setLoading(false);
    //        // };

    //         fetchProblemsData();
    //     // } else {
    //     //     setLoading(false);
    //      }
    // }, []);

    useEffect(() => {
        //console.log("Problems", problems);  
     }
    , [problems]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Solved':
                return 'text-green-600';
            case 'Attempted':
                return 'text-yellow-600';
            case 'Not Attempted':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Solved':
                return <FaCheckCircle className="mr-1" />;
            case 'Attempted':
                return <FaExclamationCircle className="mr-1" />;
            case 'Not Attempted':
                return <FaTimesCircle className="mr-1" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Contest Problems
                    </h1>
                    <p className="text-muted-foreground">
                        Solve all problems within the time limit to win the
                        contest
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, index) => (
                            <Card
                                key={index}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <Skeleton className="h-6 w-1/2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-8 w-24" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {problems.map((problem) => (
                            <Card
                                key={problem.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-xl">
                                        {problem.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                <b>Points:</b> {problem.points}
                                            </span>

                                            <Badge
                                                variant="outline"
                                                className={`flex items-center ${getStatusColor(problem.status)}`}
                                            >
                                                {getStatusIcon(problem.status)}
                                                {problem.status}
                                            </Badge>
                                        </div>
                                        <Button
                                            onClick={() =>
                                                navigate(`${problem.id}/solve`)
                                            }
                                            variant="outline"
                                        >
                                            Solve Problem
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
