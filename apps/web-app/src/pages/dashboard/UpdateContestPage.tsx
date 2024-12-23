import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/shared/DataTable";
import {
    problemColumns,
    problemFilters,
} from "../admin/columns/problemColumns";
import { userColumns, userFilters } from "../admin/columns/userColumns";
import { contests, problems, users } from "@/data";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextEditor from "@/components/shared/TextEditor";
import { Contest } from "@/types";

export function UpdateContestPage() {
    const { contest_id } = useParams();

    const navigate = useNavigate();
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [formData, setFormData] = useState<Contest>({
        id: "",
        title: "",
        description: "",
        startTime: "",
        duration: 0,
        joinDuration: 0,
        contestCode: "",
        strictTime: false,
        createdAt: "",
        createdBy: "",
        updatedAt: "",
    });

    useEffect(() => {
        if (contest_id) {
            const contest =
                contests.find((contest) => contest.id == contest_id) || null;

            if (!contest) {
                alert(`Contest not found with code: ${contest_id}`);
            } else {
                setFormData(contest);
                setDescription(contest.description);
            }
        }
    }, [contest_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log({ ...formData, selectedProblems, selectedUsers });
    };

    const [description, setDescription] = useState<string>("");

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Update Contest</CardTitle>
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
                                        id="strictTime"
                                        checked={formData.strictTime}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                strictTime: checked as boolean,
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
                                                duration: Number(
                                                    e.target.value
                                                ),
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="joinDuration">
                                        Join Duration (minutes)
                                    </Label>
                                    <Input
                                        id="joinDuration"
                                        name="joinDuration"
                                        type="number"
                                        value={formData.joinDuration}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                joinDuration: Number(
                                                    e.target.value
                                                ),
                                            }))
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contestCode">
                                    Contest Code
                                </Label>
                                <Input
                                    id="contestCode"
                                    name="contestCode"
                                    value={formData.contestCode}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            contestCode: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <Tabs defaultValue="problems" className="w-full">
                            <TabsList>
                                <TabsTrigger value="problems">
                                    Select Problems
                                </TabsTrigger>
                                <TabsTrigger value="users">
                                    Select Users
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="problems" className="space-y-4">
                                <DataTable
                                    columns={problemColumns}
                                    data={problems}
                                    selectedRows={selectedProblems}
                                    setSelectedRows={setSelectedProblems}
                                    filters={problemFilters}
                                />
                            </TabsContent>

                            <TabsContent value="users" className="space-y-4">
                                <DataTable
                                    columns={userColumns}
                                    data={users}
                                    selectedRows={selectedUsers}
                                    setSelectedRows={setSelectedUsers}
                                    filters={userFilters}
                                />
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update Contest</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
