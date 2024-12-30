import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ContestCard } from "@/components/shared/ContestCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Zap, History } from "lucide-react";
import type { Contest } from "@/types";
import { useUsersApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { format, addMinutes } from "date-fns";

export function HomePage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const { searchContestByCode, fetchAllRegisteredContests } = useUsersApi();

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const contests = await fetchAllRegisteredContests();

                const updatedContests = contests.map((contest) => {
                    const now = new Date();
                    const startTime = new Date(contest.start_time);
                    const endTime = addMinutes(startTime, contest.duration);

                    let status: "live" | "upcoming" | "past";

                    if (now < startTime) {
                        status = "upcoming";
                    } else if (now >= startTime && now <= endTime) {
                        status = "live";
                    } else {
                        status = "past";
                    }

                    return {
                        ...contest,
                        status,
                        localStartTime: format(startTime, "MMM dd, yyyy HH:mm"),
                        localEndTime: format(endTime, "MMM dd, yyyy HH:mm"),
                        duration: contest.duration,
                    };
                });

                setContests(updatedContests);
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
                (searchQuery === "" ||
                    contest.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    contest.contest_code
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
        );
    };

    const handleSearchContest = async (e) => {
        e.preventDefault();
        try {
            const data = await searchContestByCode(searchQuery);
            navigate(`contests/${data.id}`);
        } catch (error) {
            if (error?.response?.data?.message) {
                toast.error(error?.response?.data.message);
            } else {
                toast.error(`Can't find contest with code ${searchQuery}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Navbar />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Coding Contests
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Discover and participate in exciting coding challenges
                    </p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                        <Input
                            placeholder="Search by name or contest code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="shadow-sm"
                            icon={<Search className="w-4 h-4 text-slate-400" />}
                        />
                        <Button onClick={handleSearchContest} variant="default">
                            <Search className="w-4 h-4 mr-2" /> Search
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="live" className="space-y-6">
                    <TabsList className="flex justify-center gap-2 bg-transparent">
                        <TabsTrigger
                            value="live"
                            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Live Contests
                        </TabsTrigger>
                        <TabsTrigger
                            value="upcoming"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger
                            value="past"
                            className="data-[state=active]:bg-slate-600 data-[state=active]:text-white"
                        >
                            <History className="w-4 h-4 mr-2" />
                            Past Contests
                        </TabsTrigger>
                    </TabsList>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-slate-600">
                                Loading contests...
                            </p>
                        </div>
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
