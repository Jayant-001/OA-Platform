import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { SocketActions } from "@/types/SocketActions";
import { IActivityLog } from "@/types";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connectSocket: () => void;
    disconnectSocket: () => void;
    setIsConnected: (value: boolean) => void;
    sendActivity: (activity: IActivityLog) => void;
}

const SERVER_URL = `http://localhost:4242`; // TODO
const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const connectSocket = () => {
        const socket = io(SERVER_URL, {
            // TODO: Update code to read URL from env
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            toast.success("Socket connected");
            setSocket(socket);
            setIsConnected(true);
            console.log(socket);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.log(err);
        });

        socket.on("connect_failed", (err) => {
            console.log(err);
        });
    };

    const sendActivity = (activity: IActivityLog) => {
        if(socket) {
            socket.emit('activity:change', activity);
        }
    }

    const disconnectSocket = () => {
        if (socket) {
            socket.off(SocketActions.JOINED);
            socket.off(SocketActions.DISCONNECTED);
            socket.disconnect();
        }
        setSocket(null);
    };

    useEffect(() => {
        console.log(SERVER_URL);
        // Initialize socket connection on mount
        connectSocket();

        return () => {
            // Cleanup socket on unmount
            disconnectSocket();
        };
    }, []);

    const value = {
        socket,
        isConnected,
        connectSocket,
        disconnectSocket,
        setIsConnected,
        sendActivity
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;
