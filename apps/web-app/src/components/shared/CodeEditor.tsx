import React from "react";
import { Editor } from "@monaco-editor/react";

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    language: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, language }) => {
    return (
        <div className="border rounded-lg overflow-hidden h-full">
            <Editor
                // height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                theme="vs-dark"
            />
        </div>
    );
};

export default CodeEditor;
