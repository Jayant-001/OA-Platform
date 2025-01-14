import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogOverlay,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { UserActivityDetailsModal } from "@/components/UserActivityDetailsModal";

interface UserActivity {
    user_id: string;
    current_status: string;
    totalOfflineTimeInSeconds: number;
    name: string;
    email: string;
}

interface ActivityLog {
    id: string;
    contest_id: string;
    user_id: string;
    activity: string;
    times_tamp: string;
}

interface ActivityDetails {
    totalOfflineInSeconds: number;
    activities: ActivityLog[];
}

export function ContestActivityPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortOrder, setSortOrder] = useState("default");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState<UserActivity | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const usersPerPage = 20;

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    };

    const filterAndSortActivities = (activities: UserActivity[]) => {
        const filtered = activities.filter((activity) => {
            const matchesSearch =
                activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus =
                statusFilter === "all" ||
                activity.current_status.includes(statusFilter);
            return matchesSearch && matchesStatus;
        });

        if (sortOrder === "time-asc") {
            filtered.sort(
                (a, b) => a.totalOfflineTimeInSeconds - b.totalOfflineTimeInSeconds
            );
        } else if (sortOrder === "time-desc") {
            filtered.sort(
                (a, b) => b.totalOfflineTimeInSeconds - a.totalOfflineTimeInSeconds
            );
        }

        return filtered;
    };

    // Mock data - replace with your actual data
    const mockActivities: UserActivity[] = [
        {
            user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
            current_status: "went offline",
            totalOfflineTimeInSeconds: 553,
            name: "user 2",
            email: "user2@gmail.com",
        },
        {
            user_id: "eef1cbcc-8cb6-4efc-8715-9f1d3b79f9fb",
            current_status: "went offline",
            totalOfflineTimeInSeconds: 56,
            name: "Tourist",
            email: "tourist@example.com",
        },
    ];

    const handleRowClick = async (user: UserActivity) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        // Mock API call - replace with actual API call
        const mockDetails = {
            totalOfflineInSeconds: 553,
            activities: mockActivities // Your provided activities array
        };
        setActivityDetails(mockDetails);
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds} seconds`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getTimeBetween = (offlineTime: string, onlineTime: string) => {
        const diff = new Date(onlineTime).getTime() - new Date(offlineTime).getTime();
        return formatDuration(Math.floor(diff / 1000));
    };

    const filteredActivities = filterAndSortActivities(mockActivities);
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
                        Track participant activity and engagement during the contest
                    </p>
                </div>

                <Card className="backdrop-blur-sm bg-white/90 border-slate-200/60 shadow-lg mb-6">
                    <CardContent className="pt-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                    <SelectItem value="offline">Offline</SelectItem>
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
                                    <SelectItem value="default">Default</SelectItem>
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
                onClose={() => setIsModalOpen(false)}
                userName={selectedUser?.name || ""}
            />
        </div>
    );
}
