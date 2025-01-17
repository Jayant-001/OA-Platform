import { Trophy } from "lucide-react";

export const LoadingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center space-y-6">
                {/* Animated logo and rings */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 rounded-full animate-[spin_3s_linear_infinite] bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                        <div className="w-full h-full bg-slate-50 rounded-full"></div>
                    </div>
                    
                    {/* Middle pulsing ring */}
                    <div className="absolute inset-2 rounded-full animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-purple-500/50 to-blue-500/50"></div>
                    
                    {/* Inner spinning ring */}
                    <div className="absolute inset-4 rounded-full animate-[spin_2s_linear_infinite] bg-gradient-to-r from-blue-600 to-purple-600"></div>
                    
                    {/* Center icon */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <Trophy className="w-10 h-10 text-purple-600 animate-[bounce_2s_ease-in-out_infinite]" />
                    </div>
                </div>

                {/* Loading text with gradient and animation */}
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-[pulse_2s_ease-in-out_infinite]">
                        Loading...
                    </h2>
                    <p className="text-slate-600 max-w-sm mx-auto text-sm">
                        Please wait while we prepare your experience
                    </p>
                </div>

                {/* Animated progress bar */}
                <div className="max-w-xs mx-auto h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 w-full animate-progressBar"></div>
                </div>
            </div>
        </div>
    );
}
