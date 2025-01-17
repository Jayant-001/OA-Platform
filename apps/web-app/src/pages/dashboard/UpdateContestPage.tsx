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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TextEditor from "@/components/shared/TextEditor";
import { Contest, Problem } from "@/types";
import toast from "react-hot-toast";
import { useAdminApi } from "@/hooks/useApi";
import { format, toZonedTime } from "date-fns-tz"; // Importing necessary date-fns-tz functions
import { LoadingPage } from "@/components/LoadingPage";

export function UpdateContestPage() {
    const { contest_id } = useParams();
    const {
        fetchProblems,
        fetchContestById,
        updateContestProblems,
        updateContestById,
    } = useAdminApi();

    const navigate = useNavigate();
    const [loadingContestDetails, setLoadingContestDetails] =
        useState<boolean>(false);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [formData, setFormData] = useState<Contest>({
        id: "",
        title: "",
        description: "",
        contest_code: "",
        created_at: "",
        updated_at: "",
        created_by: "",
        duration: 0,
        is_registration_open: false,
        start_time: "",
        strict_time: false,
        is_registered: false,
        buffer_time: 0,
    });
    const [description, setDescription] = useState<string>("");
    const [problems, setProblems] = useState<Problem[] | []>([]);
    const [problemPoints, setProblemPoints] = useState<Record<string, number>>(
        {}
    );

    useEffect(() => {
        if (contest_id) {
            (async () => {
                setLoadingContestDetails(true);
                try {
                    const contest = await fetchContestById(contest_id);
                    if (!contest) {
                        toast.error(
                            `Contest not found with code: ${contest_id}`
                        );
                    } else {
                        const pointsMap = contest.problems.reduce(
                            (acc, problem) => {
                                acc[problem.problem_id] = problem.points;
                                return acc;
                            },
                            {} as Record<string, number>
                        );
                        setProblemPoints(pointsMap || {});
                        const localDate = toZonedTime(
                            contest.start_time,
                            Intl.DateTimeFormat().resolvedOptions().timeZone
                        ); // Use the local time zone of the user's system
                        setFormData({
                            ...contest,
                            start_time: format(localDate, "yyyy-MM-dd'T'HH:mm"),
                        });
                        setDescription(contest.description);
                        setSelectedProblems(
                            contest.problems.map(
                                (problem) => problem.problem_id
                            ) || []
                        );
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
                } finally {
                    setLoadingContestDetails(false);
                }
            })();
        }
    }, [contest_id]);

    const handleProblemPointsChange = (problemId: string, points: number) => {
        setProblemPoints((prev) => ({
            ...prev,
            [problemId]: points,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Handle form submission
            if (contest_id == null || formData == null) {
                toast.error(`Can't find contest with id ${contest_id}`);
                return;
            }
            const {
                id,
                title,
                duration,
                start_time,
                contest_code,
                buffer_time,
                strict_time,
                is_registration_open,
            } = formData;
            await updateContestById(id, {
                title,
                description,
                duration,
                start_time: new Date(start_time).toUTCString(),
                contest_code,
                buffer_time,
                strict_time,
                is_registration_open,
            });
            toast.success("Contest updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update the contest");
        }
    };


    const handleProblemsUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (contest_id == null || formData == null) {
            toast.error(`Can't find contest with id ${contest_id}`);
            return;
        }

        const selectedProblemsPoints = selectedProblems.map((problem_id) => ({
            problem_id,
            points: problemPoints[problem_id],
        }));
        for (const problem of selectedProblemsPoints) {
            if (!problem.points || problem.points < 0) {
                toast.error("Please enter valid points for the problem.");
                return;
            }
        }
        try {
            await updateContestProblems(formData.id, selectedProblemsPoints);
            toast.success("Problems updated successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update problems");
        }
    };

    if (loadingContestDetails || formData == null) {
        return <LoadingPage />;
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

                            <div className="grid grid-cols-3 gap-4">
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
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="open_registration"
                                        checked={formData.is_registration_open}
                                        onCheckedChange={(checked) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                is_registration_open:
                                                    checked as boolean,
                                            }))
                                        }
                                    />
                                    <Label htmlFor="open_registration">
                                        Open Registration
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
                                    <Label htmlFor="buffer_time">
                                        Join Duration (minutes)
                                    </Label>
                                    <Input
                                        id="buffer_time"
                                        name="buffer_time"
                                        type="number"
                                        value={formData.buffer_time}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                buffer_time: Number(
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
                        >
                            <div className="flex justify-between">
                                <TabsList>
                                    <TabsTrigger value="problems">
                                        Select Problems
                                    </TabsTrigger>
                                </TabsList>

                                <Button onClick={handleProblemsUpdate}>
                                    Update Problems
                                </Button>
                            </div>

                            <TabsContent value="problems" className="space-y-4">
                                <DataTable
                                    columns={problemColumns}
                                    data={problems}
                                    selectedRows={selectedProblems}
                                    setSelectedRows={setSelectedProblems}
                                    filters={problemFilters}
                                    problemPoints={problemPoints}
                                    handleProblemPointsChange={
                                        handleProblemPointsChange
                                    }
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
