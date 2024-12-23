import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import TextEditor from "@/components/shared/TextEditor";

export function CreateContestPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startTime: "",
        duration: "",
        join_duration: "",
        code: "",
        strict_time: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ ...formData });
    };

    const [description, setDescription] = useState("");

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Contest</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Contest Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <TextEditor
                                    content={description}
                                    setContent={setDescription}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startTime">
                                        Start Time
                                    </Label>
                                    <Input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        value={formData.startTime}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                startTime: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="strict_time"
                                        checked={formData.strict_time}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                strict_time: checked as boolean,
                                            }))
                                        }
                                    />
                                    <Label htmlFor="strict_time">
                                        Strict Time
                                    </Label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">
                                        Duration (minutes)
                                    </Label>
                                    <Input
                                        id="duration"
                                        name="duration"
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                duration: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="join_duration">
                                        Join Duration (minutes)
                                    </Label>
                                    <Input
                                        id="join_duration"
                                        name="join_duration"
                                        type="number"
                                        value={formData.join_duration}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                join_duration: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contest_code">
                                    Contest Code
                                </Label>
                                <Input
                                    id="contest_code"
                                    name="contest_code"
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            code: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Create Contest</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
