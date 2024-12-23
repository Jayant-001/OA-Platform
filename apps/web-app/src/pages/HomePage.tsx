import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ContestCard } from "@/components/shared/ContestCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Contest } from "@/types";

export function HomePage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual API call
        const fetchContests = async () => {
            try {
                // Simulate API call
                const data = await Promise.resolve([
                    {
                        id: "1",
                        title: "Weekly Contest 1",
                        description: "Solve algorithmic problems",
                        startTime: new Date(Date.now() + 86400000), // Tomorrow
                        duration: 120,
                        problemCount: 4,
                        status: "upcoming",
                        rules: [
                            "No external help",
                            "Individual participation only",
                        ],
                    },
                    // Add more mock contests as needed
                ]);
                setContests(data);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    const filterContests = (status: "live" | "upcoming" | "past") => {
        return contests.filter(
            (contest) =>
                contest.status === status &&
                contest.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 ">
                        Coding Contests
                    </h1>
                    <Input
                        placeholder="Search contests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Tabs defaultValue="live" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="live">Live Contests</TabsTrigger>
                        <TabsTrigger value="upcoming">
                            Upcoming Contests
                        </TabsTrigger>
                        <TabsTrigger value="past">Past Contests</TabsTrigger>
                    </TabsList>

                    {loading ? (
                        <div>Loading contests...</div>
                    ) : (
                        <>
                            <TabsContent
                                value="live"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filterContests("live").map((contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                ))}
                            </TabsContent>

                            <TabsContent
                                value="upcoming"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filterContests("upcoming").map((contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                ))}
                            </TabsContent>

                            <TabsContent
                                value="past"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filterContests("past").map((contest) => (
                                    <ContestCard
                                        key={contest.id}
                                        contest={contest}
                                    />
                                ))}
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </main>
        </div>
    );
}
