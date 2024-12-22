import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import axios from "axios";
import TextEditor from "@/components/shared/TextEditor";

export function AddProblemPage() {
    const navigate = useNavigate();
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

    const [description, setDescription] = useState("");
    const [example, setExample] = useState("");

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            // Replace with actual API call
            // await axios.post("/api/problems", formData);
            navigate("/admin/problems");
        } catch (error: any) {
            setError("Failed to add problem. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto">
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">
                            Add New Problem
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
                                {/* <Textarea
                                id="problem_statement"
                                name="problem_statement"
                                required
                                value={formData.problem_statement}
                                onChange={handleChange}
                                className="resize-y"
                                /> */}
                                <TextEditor
                                    content={description}
                                    setContent={setDescription}
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

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full">
                                Add Problem
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
