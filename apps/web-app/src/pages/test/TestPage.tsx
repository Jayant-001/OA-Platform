import { useState, useEffect, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const TestPage = () => {
    const [content, setContent] = useState("");

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
                            className="prose"
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
            </div>
        </div>
    );
};

export default TestPage;
