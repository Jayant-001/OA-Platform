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

    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const { contest_id } = useParams();
    const { fetchContestUserActivities } = useActivityApi();

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
                                                {/* {format(new Date(log.times_tamp), "MMM d, h:mm:ss a")} */}
                                                {new Date(log.times_tamp).toLocaleString()}
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
