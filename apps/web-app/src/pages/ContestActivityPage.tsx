import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
    Activity,
    Search,
    Clock,
    Mail,
    User,
    ArrowUpDown,
    AlertCircle,
} from "lucide-react";
import { UserActivityDetailsModal } from "@/components/UserActivityDetailsModal";
import { useActivityApi } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

interface UserActivity {
    user_id: string;
    current_status: string;
    totalOfflineTimeInSeconds: number;
    name: string;
    email: string;
}

export interface ActivityUserDetails {
    userId: string;
    name: string;
    email: string;
}

export function ContestActivityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<ActivityUserDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activityDetails, setActivityDetails] =
        useState<UserActivity[] | null>(null);
    const usersPerPage = 20;
    const { fetchContestActivities } = useActivityApi();
    const {contest_id} = useParams();

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor(
            (seconds % 3600) / 60
        )}m`;
    };

    const fetchActivities = async () => {
        try {
            const data = await fetchContestActivities(contest_id as string)
            setActivityDetails(data);
        } catch (error) {
            toast.error('Failed to fetch contest activities')
            console.log(error)
        }
    }

    useEffect(() => {
        fetchActivities();
    }, []);

    const filterAndSortActivities = (activities: UserActivity[]) => {
        const filtered = activities.filter((activity) => {
            const matchesSearch =
                activity.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                activity.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" ||
                activity.current_status.includes(statusFilter);
            return matchesSearch && matchesStatus;
        });

        if (sortOrder === "time-asc") {
            filtered.sort(
                (a, b) =>
                    a.totalOfflineTimeInSeconds - b.totalOfflineTimeInSeconds
            );
        } else if (sortOrder === "time-desc") {
            filtered.sort(
                (a, b) =>
                    b.totalOfflineTimeInSeconds - a.totalOfflineTimeInSeconds
            );
        }

        return filtered;
    };

    const handleRowClick = async (user: UserActivity) => {
        setSelectedUser({userId: user.user_id, email: user.email, name: user.name});
        setIsModalOpen(true);
    };

    const onModalClose = () => {
        setIsModalOpen(false)
        setSelectedUser(null);
    }

    if(activityDetails == null) {
        return <h1>Loading</h1>
    }

    const filteredActivities = filterAndSortActivities(activityDetails);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredActivities.slice(
        indexOfFirstUser,
        indexOfLastUser
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
                        <Activity className="w-10 h-10" />
                        Activity Monitor
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Track participant activity and engagement during the
                        contest
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr]">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="online">
                                        Online
                                    </SelectItem>
                                    <SelectItem value="offline">
                                        Offline
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={sortOrder}
                                onValueChange={setSortOrder}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">
                                        Default
                                    </SelectItem>
                                    <SelectItem value="time-asc">
                                        Time (Low to High)
                                    </SelectItem>
                                    <SelectItem value="time-desc">
                                        Time (High to Low)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-20">S.No</TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-purple-600" />
                                            Name
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-purple-600" />
                                            Email
                                        </div>
                                    </TableHead>
                                    <TableHead>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-purple-600" />
                                            Status
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">
                                        <div className="flex items-center gap-2 justify-end">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                            <ArrowUpDown className="w-4 h-4" />
                                            Offline Time
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentUsers.map((activity, index) => (
                                    <TableRow
                                        key={activity.user_id}
                                        className="hover:bg-slate-50/50 cursor-pointer"
                                        onClick={() => handleRowClick(activity)}
                                    >
                                        <TableCell className="font-medium">
                                            {indexOfFirstUser + index + 1}
                                        </TableCell>
                                        <TableCell>{activity.name}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {activity.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${
                                                    activity.current_status.includes(
                                                        "online"
                                                    )
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-red-50 text-red-700 border-red-200"
                                                }`}
                                            >
                                                {activity.current_status.includes(
                                                    "online"
                                                )
                                                    ? "Online"
                                                    : "Offline"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {formatTime(
                                                activity.totalOfflineTimeInSeconds
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                <div className="mt-6">
                    <Pagination
                        itemsPerPage={usersPerPage}
                        totalItems={filteredActivities.length}
                        paginate={(page) => setCurrentPage(page)}
                        currentPage={currentPage}
                    />
                </div>
            </main>

            <UserActivityDetailsModal
                isOpen={isModalOpen}
                onClose={onModalClose}
                selectedUser={selectedUser || null}
            />
        </div>
    );
}
