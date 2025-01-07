import { ChevronRight, Terminal } from "lucide-react";

type Props = {
    isConsoleCollapsed: boolean;
    setIsConsoleCollapsed: (status: boolean) => void;
    input: string;
    setInput: (input: string) => void;
    result: string | undefined
};

const RunConsole = ({ isConsoleCollapsed, setIsConsoleCollapsed, input, setInput, result }: Props) => {

    return (
        <div className="h-full bg-slate-900 text-white flex flex-col">
            <div
                className="flex items-center justify-between px-4 py-2 cursor-pointer bg-slate-800 select-none"
                onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
            >
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span className="font-medium">Console</span>
                </div>
                <ChevronRight
                    className={`w-5 h-5 transition-transform duration-300 ${
                        isConsoleCollapsed ? "-rotate-90" : "rotate-90"
                    }`}
                />
            </div>

            <div
                className={`flex-1 overflow-auto transition-all duration-300 ${
                    isConsoleCollapsed ? "hidden" : "block"
                }`}
            >
                <div className="p-4 space-y-3">
                    <div>
                        <label className="text-sm text-slate-400">Input:</label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-slate-800 border-0 rounded-md p-2 text-sm font-mono resize-none"
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-400">
                            Output:
                        </label>
                        <pre className="w-full bg-slate-800 rounded-md p-2 text-sm font-mono min-h-[70px] overflow-auto max-h-[150px]">
                            {result || ""}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunConsole;
