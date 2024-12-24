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
// import { users } from "@/data";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextEditor from "@/components/shared/TextEditor";
import { Contest, Problem } from "@/types";
import toast from "react-hot-toast";
import { useAdminApi } from "@/hooks/useApi";

export function UpdateContestPage() {
    const { contest_id } = useParams();
    const { fetchProblems, fetchContestById, updateContestProblems, updateContestById, updateContestUsers } = useAdminApi();

    const navigate = useNavigate();
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [formData, setFormData] = useState<any>({
        id: "",
        title: "",
        description: "",
        start_time: "",
        duration: 0,
        contest_code: "",
        join_duration: 0,
        strict_time: false,
        created_at: "",
        created_by: "",
        updated_at: "",
    });
    const [description, setDescription] = useState<string>("");
    const [problems, setProblems] = useState<Problem[] | []>([]);
    const [problemPoints, setProblemPoints] = useState<Record<string, number>>(
        {}
    );
    const [users, setUsers] = useState<string[] | []>([]);

    useEffect(() => {
        if (contest_id) {
            (async () => {
                try {
                    const contest = await fetchContestById(contest_id);
                    const users = await 
                    if (!contest) {
                        toast.error(
                            `Contest not found with code: ${contest_id}`
                        );
                    } else {
                        const pointsMap = contest.problems.reduce((acc, problem) => {
                            acc[problem.problem_id] = problem.points;
                            return acc;
                        }, {} as Record<string, number>);
                        setProblemPoints(pointsMap || {});
                        setFormData({
                            ...contest,
                            start_time: contest.start_time.endsWith("Z")
                                ? contest.start_time.slice(0, -1)
                                : contest.start_time,
                        });
                        setDescription(contest.description);
                        setSelectedProblems(contest.problems.map(problem => problem.problem_id) || []);
                    }

                    const problems = await fetchProblems();
                    const updatedProblems: Problem[] = problems.map(
                        (problem: any) => ({
                            ...problem,
                            difficulty: problem.level,
                            level: undefined,
                            acceptance: 80,
                            tags: ["Array", "Hash Table"],
                        })
                    );
                    setProblems(updatedProblems);
                } catch (error) {
                    console.log(error);
                    toast.error(
                        "Something went wrong in fetching contest data"
                    );
                }
            })();
        }
    }, [contest_id]);

    const handleProblemSelection = async (problemId: string) => {
        try {
            const points = problemPoints[problemId];
            console.log(problemId, problemPoints)

            if (!points || points < 0) {
                toast.error("Please enter valid points for the problem.");
                return;
            }

            setSelectedProblems((prev) =>
                prev.includes(problemId)
                    ? prev.filter((id) => id !== problemId)
                    : [...prev, problemId]
            );
        } catch (error) {
            console.log(error);
            toast.error("Failed to update problem selection.");
        }
    };

    const handleProblemPointsChange = (problemId: string, points: number) => {
        setProblemPoints((prev) => ({
            ...prev,
            [problemId]: points,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        const {id, title, duration, start_time, contest_code, join_duration, strict_time} = formData;
        await updateContestById(id, {title, description, duration, start_time, contest_code, join_duration, strict_time })
    };

    const [selectedTab, setSelectedTab] = useState("problems");
    
    const handleProblemsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedProblemsPoints = selectedProblems.map((problemId) => ({ problemId, points: problemPoints[problemId] }))
        for(const problem of selectedProblemsPoints) {
            if(!problem.points || problem.points < 0) {
                toast.error("Please enter valid points for the problem.");
                return;
            }
        }
        console.log(selectedProblemsPoints)
        await updateContestProblems(formData.id, selectedProblemsPoints)
    }

    const handleUsersUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateContestUsers(formData.id, selectedUsers)
    }

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
                                    <Label htmlFor="start_time">
                                        Start Time
                                    </Label>
                                    <Input
                                        id="start_time"
                                        name="start_time"
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                start_time: e.target.value,
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
                                                duration: Number(
                                                    e.target.value
                                                ),
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
                                                join_duration: Number(
                                                    e.target.value
                                                ),
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
                                    value={formData.contest_code}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            contest_code: e.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <Tabs
                            defaultValue="problems"
                            className="w-full"
                            onValueChange={setSelectedTab}
                        >
                            <div className="flex justify-between">
                                <TabsList>
                                    <TabsTrigger value="problems">
                                        Select Problems
                                    </TabsTrigger>
                                    <TabsTrigger value="users">
                                        Select Users
                                    </TabsTrigger>
                                </TabsList>
                                {selectedTab === "problems" ? (
                                    <Button onClick={handleProblemsUpdate}>Update Problems</Button>
                                ) : (
                                    <Button onClick={handleUsersUpdate}>Update Users</Button>
                                )}
                            </div>

                            <TabsContent value="problems" className="space-y-4">
                                <DataTable
                                    columns={problemColumns}
                                    data={problems}
                                    selectedRows={selectedProblems}
                                    setSelectedRows={setSelectedProblems}
                                    filters={problemFilters}
                                    problemPoints={problemPoints}
                                    handleProblemPointsChange={handleProblemPointsChange}
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
