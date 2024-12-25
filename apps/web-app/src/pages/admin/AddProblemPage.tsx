import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import TextEditor from "@/components/shared/TextEditor";
import { useAdminApi } from "@/hooks/useApi";
import { CreateProblem, Tag } from "@/types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export function AddProblemPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchTags, createProblem, updateProblem } = useAdminApi();
    const [formData, setFormData] = useState({
        title: "",
        problem_statement: "",
        example: "",
        constraints: "",
        level: "easy",
        input_format: "",
        output_format: "",
        time_limit: "",
        memory_limit: "",
    });
    const [error, setError] = useState("");
    const { problem_id } = useParams();

    const [problemStatement, setProblemStatement] = useState("");
    const [example, setExample] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const { fetchProblemById } = useAdminApi();
    const isUpdatePage = location.pathname.includes("/update");

    useEffect(() => {
        (async () => {
            const tagsList = await fetchTags();
            setTags(tagsList);
        })();
    }, []);

    useEffect(() => {
        if (isUpdatePage && problem_id) {
            (async () => {
                try {
                    const problem = await fetchProblemById(problem_id);
                    if (!problem) {
                        toast.error("Error in fetching contest");
                        navigate(-1);
                    }

                    setFormData({
                        title: problem.title,
                        problem_statement: problem.problem_statement,
                        example: problem.example,
                        constraints: problem.constraints,
                        level: problem.level,
                        input_format: problem.input_format,
                        output_format: problem.output_format,
                        time_limit: problem.time_limit,
                        memory_limit: problem.memory_limit,
                    });
                    setProblemStatement(problem.problem_statement);
                    setExample(problem.example);
                    setSelectedTags(problem.tags.map((tag: Tag) => tag.id));
                } catch (error) {
                    console.log(error);
                    toast.error("Failed to fetch problem data");
                    navigate(-1);
                }
            })();
        }
    }, [problem_id,]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleTagSelect = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            if (isUpdatePage && problem_id) {
                await updateProblem(problem_id, {
                    ...formData,
                    example: example,
                    problem_statement: problemStatement,
                    tags: selectedTags,
                });
                toast.success("Problem updated successfully.");
                navigate(-1);
            } else {
                await createProblem({
                    ...formData,
                    example: example,
                    problem_statement: problemStatement,
                    tags: selectedTags,
                });
                toast.success("Problem added successfully.");
                navigate(-1);
            }
        } catch (error: any) {
            console.log(error);
            setError("Failed to add problem. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            {isUpdatePage ? "Update" : "Add New"} Problem
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="title">Title</label>
                                <Input
                                    id="title"
                                    name="title"
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="problem_statement">
                                    Problem Statement
                                </label>
                                <TextEditor
                                    content={problemStatement}
                                    setContent={setProblemStatement}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="example">Example</label>
                                <TextEditor
                                    content={example}
                                    setContent={setExample}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="constraints">Constraints</label>
                                <Textarea
                                    id="constraints"
                                    name="constraints"
                                    value={formData.constraints}
                                    onChange={handleChange}
                                    className="resize-y"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="level">Level</label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            level: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="easy">
                                            Easy
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            Medium
                                        </SelectItem>
                                        <SelectItem value="hard">
                                            Hard
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="input_format">
                                    Input Format
                                </label>
                                <Textarea
                                    id="input_format"
                                    name="input_format"
                                    value={formData.input_format}
                                    onChange={handleChange}
                                    className="resize-y"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="output_format">
                                    Output Format
                                </label>
                                <Textarea
                                    id="output_format"
                                    name="output_format"
                                    value={formData.output_format}
                                    onChange={handleChange}
                                    className="resize-y"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="time_limit">Time Limit</label>
                                <Input
                                    id="time_limit"
                                    name="time_limit"
                                    type="text"
                                    value={formData.time_limit}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="memory_limit">
                                    Memory Limit
                                </label>
                                <Input
                                    id="memory_limit"
                                    name="memory_limit"
                                    type="text"
                                    value={formData.memory_limit}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="tags">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map((tagId) => {
                                        const tag = tags.find(
                                            (t) => t.id === tagId
                                        );
                                        return (
                                            <Badge
                                                key={tagId}
                                                variant="primary"
                                                className="cursor-pointer flex items-center"
                                                onClick={() =>
                                                    handleTagSelect(tagId)
                                                }
                                            >
                                                {tag?.name}
                                                <X className="ml-1 h-4 w-4" />
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <Select
                                    onValueChange={(value) =>
                                        handleTagSelect(value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select tags" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tags
                                            .filter(
                                                (tag) =>
                                                    !selectedTags.includes(
                                                        tag.id
                                                    )
                                            )
                                            .map((tag) => (
                                                <SelectItem
                                                    key={tag.id}
                                                    value={tag.id}
                                                >
                                                    {tag.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                {isUpdatePage ? "Update" : "Add"} Problem
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
