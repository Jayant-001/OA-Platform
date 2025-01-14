import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody,
    DialogOverlay,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, AlertCircle, Activity, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useActivityApi } from "@/hooks/useApi";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ActivityUserDetails } from "@/pages/ContestActivityPage";

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

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedUser: ActivityUserDetails | null;
}

export function UserActivityDetailsModal({ isOpen, onClose, selectedUser }: Props) {
    // Mock data - replace with API call
    const mockDetails: ActivityDetails = {
        totalOfflineInSeconds: 553,
        activities: [
            {
                id: "0891d8ba-676a-405d-ba10-95cda7c5ec75",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:37.994Z"
            },
            {
                id: "aa9ca3b2-0f68-40de-bd15-2a421077ed32",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:40:39.869Z"
            },
            {
                id: "6025fb15-4fbb-4780-b8d7-6a2dc033833a",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:40.746Z"
            },
            {
                id: "ab4570fd-80a0-4550-a563-7616cedca5eb",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:40:49.654Z"
            },
            {
                id: "51c362ab-0e1d-4c9b-a308-35bcf0f94542",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:50.231Z"
            },
            {
                id: "9ccbbc41-3f72-4a3d-88f2-19a9d44fa300",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:40:50.780Z"
            },
            {
                id: "fe26443f-bbb1-41d3-bb45-169d7702be55",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:51.362Z"
            },
            {
                id: "e74f23cb-b349-43b1-ae8e-8519afed25a1",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:40:52.225Z"
            },
            {
                id: "079c7b2c-2df9-4eae-aec2-627ed754b2b4",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:53.947Z"
            },
            {
                id: "69445c5d-3121-476e-9be6-1fd3c4a93793",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:40:54.432Z"
            },
            {
                id: "42263307-b6a5-4857-9895-f916d681668d",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:40:55.745Z"
            },
            {
                id: "bf879e00-2e46-4d59-b059-aa6f51b23c2e",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "came online",
                times_tamp: "2025-01-14T01:49:55.094Z"
            },
            {
                id: "7a42847e-7363-4833-a18d-e36a7893c0e5",
                contest_id: "4c035bef-fdf3-4eda-823b-f5928d5c1775",
                user_id: "d7426557-82a7-470b-bb9a-68a99dc8daa8",
                activity: "went offline",
                times_tamp: "2025-01-14T01:49:56.258Z"
            }
        ]
    };;

    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);

    const {contest_id} = useParams();

    const {fetchContestUserActivities} = useActivityApi();

    const fetchUserActivities = async (userId: string) => {
        try {
            const data = await fetchContestUserActivities(contest_id as string, userId);
            setActivityDetails(data);
        } catch (error) {
            toast.error("Failed to fetch user's activities")
            console.log(error);
        }
    }

    useEffect(() => {
        if(selectedUser) {
            fetchUserActivities(selectedUser.userId);
        }
        else {
            setActivityDetails(null);
        }
    }, [selectedUser])

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

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogOverlay className="backdrop-blur-sm" />
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            {selectedUser?.name}'s Activity Log
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            Total Offline Time: {formatDuration(activityDetails?.totalOfflineInSeconds || 0)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                <DialogBody>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-1">
                            {activityDetails?.activities.map((log, index, array) => {
                                const isOffline = log.activity === "went offline";
                                const nextLog = array[index + 1];
                                
                                return (
                                    <div
                                        key={log.id}
                                        className={`p-3 rounded-lg border ${
                                            isOffline 
                                                ? "bg-red-50/50 border-red-100" 
                                                : "bg-green-50/50 border-green-100"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                {isOffline ? (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Activity className="w-4 h-4 text-green-500" />
                                                )}
                                                <span className={isOffline ? "text-red-700" : "text-green-700"}>
                                                    {log.activity}
                                                </span>
                                            </div>
                                            <span className="text-slate-600 font-mono">
                                                {format(new Date(log.times_tamp), "MMM d, h:mm:ss a")}
                                            </span>
                                        </div>
                                        {isOffline && nextLog && nextLog.activity === "came online" && (
                                            <div className="mt-1 text-xs text-slate-500 flex items-center gap-1 pl-6">
                                                <Clock className="w-3 h-3" />
                                                Offline for: {getTimeBetween(log.times_tamp, nextLog.times_tamp)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
