import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { problems } from "@/data";

interface Problem {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    acceptance: number;
    tags: string[];
    solved: boolean;
}

interface ProblemsListProps {
    isAdminView?: boolean;
}

export function ProblemsList({ isAdminView = false }: ProblemsListProps) {
    const [filters, setFilters] = useState({
        search: "",
        difficulty: "all",
        tag: "all",
        status: "all",
    });

    //   // Mock data - replace with API call
    //   const problems: Problem[] = [
    //     {
    //       id: "1",
    //       title: "Two Sum",
    //       difficulty: "easy",
    //       acceptance: 48.5,
    //       tags: ["Array", "Hash Table"],
    //       solved: true,
    //     },
    //     {
    //       id: "2",
    //       title: "Add Two Numbers",
    //       difficulty: "medium",
    //       acceptance: 39.2,
    //       tags: ["Linked List", "Math"],
    //       solved: false,
    //     },
    //     // Add more problems...
    //   ];

    const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
        const colors = {
            easy: "text-green-500",
            medium: "text-yellow-500",
            hard: "text-red-500",
        };
        return colors[difficulty];
    };

    const filteredProblems = problems.filter((problem) => {
        const matchesSearch = problem.title
            .toLowerCase()
            .includes(filters.search.toLowerCase());
        const matchesDifficulty =
            filters.difficulty === "all" ||
            problem.difficulty === filters.difficulty;
        const matchesStatus =
            filters.status === "all" ||
            (filters.status === "solved" && problem.solved) ||
            (filters.status === "unsolved" && !problem.solved);
        const matchesTag =
            filters.tag === "all" || problem.tags.includes(filters.tag);

        return (
            matchesSearch && matchesDifficulty && matchesStatus && matchesTag
        );
    });

    // Get unique tags from all problems
    const allTags = Array.from(new Set(problems.flatMap((p) => p.tags)));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                <Input
                    placeholder="Search problems..."
                    value={filters.search}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            search: e.target.value,
                        }))
                    }
                    className="max-w-xs"
                />

                <Select
                    value={filters.difficulty}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, difficulty: value }))
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.tag}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, tag: value }))
                    }
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Tag" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        {allTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                                {tag}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {!isAdminView && (
                    <Select
                        value={filters.status}
                        onValueChange={(value) =>
                            setFilters((prev) => ({ ...prev, status: value }))
                        }
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="solved">Solved</SelectItem>
                            <SelectItem value="unsolved">Unsolved</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">Status</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Acceptance</TableHead>
                            <TableHead>Tags</TableHead>
                            {isAdminView && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProblems.map((problem) => (
                            <TableRow key={problem.id}>
                                <TableCell>
                                    {problem.solved ? (
                                        <CheckCircle2 className="text-green-500 w-5 h-5" />
                                    ) : (
                                        <Circle className="text-gray-300 w-5 h-5" />
                                    )}
                                </TableCell>
                                <TableCell className="font-medium hover:text-primary cursor-pointer">
                                    {problem.title}
                                </TableCell>
                                <TableCell
                                    className={getDifficultyColor(
                                        problem.difficulty
                                    )}
                                >
                                    {problem.difficulty
                                        .charAt(0)
                                        .toUpperCase() +
                                        problem.difficulty.slice(1)}
                                </TableCell>
                                <TableCell>
                                    {problem.acceptance.toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {problem.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="cursor-pointer"
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                {isAdminView && (
                                    <TableCell>
                                        {/* Add admin actions here */}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
