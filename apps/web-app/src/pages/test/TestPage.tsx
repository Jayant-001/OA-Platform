import { useState, useEffect, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import CryptoJS from "crypto-js";
import { useSocket } from "@/context/SocketContext";
import { IActivityLog } from "@/types";

const TestPage = () => {
    const [content, setContent] = useState("");
    const {sendActivity} = useSocket();

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ script: "sub" }, { script: "super" }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["link", "blockquote", "image", "code-block"],
            [{ align: [] }],
            ["clean"],
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "color",
        "background",
        "script",
        "list",
        "indent",
        "link",
        "blockquote",
        "image",
        "code-block",
        "align",
    ];

    const { quill, quillRef } = useQuill({
        modules,
        formats,
        theme: "snow",
        placeholder: "Write something amazing...",
    });

    // Handle content change
    const handleContentChange = useCallback(() => {
        if (quill) {
            quill.on("text-change", () => {
                setContent(quill.root.innerHTML);
            });
        }
    }, [quill]);

    // Handle image upload
    const handleImageUpload = useCallback(() => {
        if (quill) {
            const toolbar = quill.getModule("toolbar");
            toolbar.addHandler("image", () => {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();

                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (file) {
                        try {
                            const reader = new FileReader();
                            reader.onload = () => {
                                const range = quill.getSelection(true);
                                quill.insertEmbed(
                                    range.index,
                                    "image",
                                    reader.result
                                );
                            };
                            reader.readAsDataURL(file);
                        } catch (error) {
                            console.error("Image upload failed:", error);
                        }
                    }
                };
            });
        }
    }, [quill]);

    // Initialize handlers
    useEffect(() => {
        handleContentChange();
        handleImageUpload();
    }, [handleContentChange, handleImageUpload]);

    const encryptionKey = "your-encryption-key"; // 32-byte key for AES-256 encryption

    // The data you want to encrypt
    const data = {
        iv: CryptoJS.lib.WordArray.random(16), // Generate a random 16-byte initialization vector (IV)
        keys: {
            exampleKey: "some-encrypted-value",
        },
        cipher: "This is a secret message",
        v_rem: "1378cb77-9e12-4a5a-95e5-e988e50f10cd",
    };

    // Encrypt the data
    const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(data),
        encryptionKey,
        {
            iv: data.iv,
        }
    ).toString();

    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey, {
        iv: data.iv,
    });
    const decryptedData = JSON.parse(
        decryptedBytes.toString(CryptoJS.enc.Utf8)
    );

    const handleClick = async () => {
        const activity: IActivityLog = {
            activityType: "joined", 
            roomId: "lkjsdf",
            socketId: "lkjds",
            timestamp : new Date(),
            username: "lkjsdf"
        }
        sendActivity(activity)
    }

    console.log(decryptedData.cipher);

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto">
                <div className="border rounded-lg overflow-hidden bg-white">
                    {/* Editor */}
                    <div ref={quillRef} className="h-[500px]" />
                </div>

                {/* Preview */}
                {content && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                        <div
                            // className="prose max-w-none"
                            className="prose lg:prose-xl"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                )}

                {/* Raw text */}
                {content && (
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                        <>{content}</>
                    </div>
                )}
                <div>{JSON.stringify({ feb: encryptedData })}</div>
                <div>{JSON.stringify(decryptedData)}</div>
            </div>
            <button onClick={handleClick}>Click </button>
        </div>
    );
};

export default TestPage;
