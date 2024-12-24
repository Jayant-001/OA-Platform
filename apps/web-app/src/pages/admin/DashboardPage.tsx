import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContestCard } from "@/components/shared/ContestCard";
import { ProblemsList } from "@/components/problems/ProblemsList";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { Contest } from "@/types";
import apiService from "@/api/apiService";

export function DashboardPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [contests, setContests] = useState<Contest[] | null>(null);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const data = await apiService.get("/api/admins/contests");
                const contestsList = data;
                // Simulate API call
                const updatedContests = contestsList.map((contest) => {
                    const now = new Date();
                    const startTime = new Date(contest.startTime);
                    const endTime = new Date(
                        startTime.getTime() + contest.duration * 60000
                    );

                    let status: "live" | "upcoming" | "past";
                    if (now < startTime) {
                        status = "upcoming";
                    } else if (now >= startTime && now <= endTime) {
                        status = "live";
                    } else {
                        status = "past";
                    }

                    return { ...contest, status };
                });

                setContests(updatedContests);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            }
        };

        fetchContests();
    }, [])

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            <Tabs defaultValue="contests">
                <TabsList>
                    <TabsTrigger value="contests">Contests</TabsTrigger>
                    <TabsTrigger value="problems">Problems</TabsTrigger>
                </TabsList>

                <TabsContent value="contests">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Input
                                placeholder="Search contests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                            <Button onClick={() => navigate("contests/add")}>
                                Create Contest
                            </Button>
                        </div>

                        <Tabs defaultValue="live">
                            <TabsList>
                                <TabsTrigger value="live">Live</TabsTrigger>
                                <TabsTrigger value="upcoming">
                                    Upcoming
                                </TabsTrigger>
                                <TabsTrigger value="past">Past</TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="live"
                                className="grid grid-cols-3 gap-4"
                            >
                                {/* Contest cards will go here */}
                                {contests && contests.map((contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                ))}
                            </TabsContent>
                            {/* Similar content for upcoming and past tabs */}
                        </Tabs>
                    </div>
                </TabsContent>

                <TabsContent value="problems">
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Link to={ROUTES.DASHBOARD.ADD_PROBLEM}>
                                <Button>Create Problem</Button>
                            </Link>
                        </div>
                        <ProblemsList isAdminView />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
