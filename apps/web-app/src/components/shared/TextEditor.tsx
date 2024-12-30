import { useEffect, useCallback } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

interface Props {
    content: string;
    setContent: (content: string) => void;
    height?: string;
}

const TextEditor = ({ content, setContent, height = "h-24" }: Props) => {
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

    useEffect(() => {
        if (quill && content && quill.root.innerHTML != content) {
            quill.root.innerHTML = content; // Set the content if provided
        }
    }, [quill, content]);

    // Initialize handlers
    useEffect(() => {
        handleContentChange();
        handleImageUpload();
    }, [handleContentChange, handleImageUpload]);

    return (
        <div className="border rounded-lg bg-white">
            <div ref={quillRef} className={`${height} w-full`} />
        </div>
    );
};

export default TextEditor;
