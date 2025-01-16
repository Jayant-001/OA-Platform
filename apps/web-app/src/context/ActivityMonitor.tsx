import React, { useCallback, useEffect, useState } from "react";
import { IActivityLog } from "@/types/index";
import { useAuthContext } from "./AuthContext";
import { useParams } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { toZonedTime } from "date-fns-tz";

type Props = {
    children: React.ReactNode;
};

const useWindowVisibility = () => {
    const [isWindowFocused, setIsWindowFocused] = useState(document.hasFocus());
    const [lastFocusChange, setLastFocusChange] = useState(Date.now());
    
    const handleFocusIn = useCallback(() => {
        setIsWindowFocused(true);
        setLastFocusChange(Date.now());
    }, []);
    
    const handleFocusOut = useCallback(() => {
        setIsWindowFocused(false);
        setLastFocusChange(Date.now());
    }, []);
    
    useEffect(() => {
        // Add event listeners for focus and blur
        window.addEventListener("focus", handleFocusIn);
        window.addEventListener("blur", handleFocusOut);
        
        // Additional check using document.hasFocus()
        const focusInterval = setInterval(() => {
            const currentlyFocused = document.hasFocus();
            if (currentlyFocused !== isWindowFocused) {
                setIsWindowFocused(currentlyFocused);
                setLastFocusChange(Date.now());
            }
        }, 500); // Check every 500ms
        
        return () => {
            // Cleanup
            window.removeEventListener("focus", handleFocusIn);
            window.removeEventListener("blur", handleFocusOut);
            clearInterval(focusInterval);
        };
    }, [handleFocusIn, handleFocusOut, isWindowFocused]);
    
    return {
        isWindowFocused,
        lastFocusChange,
    };
};

const ActivityMonitor = ({ children }: Props) => {
    const { isWindowFocused, lastFocusChange } = useWindowVisibility();
    const {user} = useAuthContext();
    const { contest_id } = useParams();
    const {sendActivity} = useSocket();

    useEffect(() => {
        if(!user) return;

        const activity: IActivityLog = {
            activityType: isWindowFocused ? "came online" : "went offline",
            timestamp: toZonedTime(Date.now(), Intl.DateTimeFormat().resolvedOptions().timeZone), // Use the local time zone of the user's system
            contestId: contest_id as string,
            userId: user?.id
        };

        sendActivity(activity);

        // console.log("Window focus: ", isWindowFocused);
        // console.log(
        //     "Last focus change: ",
        //     new Date(lastFocusChange).toLocaleString()
        // );
        
    }, [isWindowFocused, lastFocusChange]);

    return <>{children}</>;
};

export default ActivityMonitor;
