import { useState, useEffect } from "react";
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
import { Edit, Trash } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { problems as mockProblems } from "@/data";
import { Link, useNavigate } from "react-router-dom";

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
    const [currentPage, setCurrentPage] = useState(1);
    const [problemsPerPage] = useState(10);
    const [paginatedProblems, setPaginatedProblems] = useState<Problem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate API call for pagination
        const fetchProblems = async () => {
            const startIndex = (currentPage - 1) * problemsPerPage;
            const endIndex = startIndex + problemsPerPage;
            setPaginatedProblems(mockProblems.slice(startIndex, endIndex));
        };

        fetchProblems();
    }, [currentPage, problemsPerPage]);

    const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
        const colors = {
            easy: "text-green-500",
            medium: "text-yellow-500",
            hard: "text-red-500",
        };
        return colors[difficulty];
    };

    const filteredProblems = paginatedProblems.filter((problem) => {
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
    const allTags = Array.from(new Set(mockProblems.flatMap((p) => p.tags)));

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                            <TableHead className="w-[50px]">S.No</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Acceptance</TableHead>
                            <TableHead>Tags</TableHead>
                            {isAdminView && <TableHead>Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProblems.map((problem, index) => (
                            <TableRow key={problem.id}>
                                <TableCell>
                                    {(currentPage - 1) * problemsPerPage +
                                        index +
                                        1}
                                </TableCell>
                                <TableCell className="font-medium hover:text-primary cursor-pointer">
                                    <Link to={`problems/${problem.id}`}>
                                        {problem.title}
                                    </Link>
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `problems/${problem.id}/update`
                                                    )
                                                }
                                                className="p-1 bg-gray-200 rounded"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    alert(
                                                        `${problem.id} delete`
                                                    )
                                                }
                                                className="p-1 bg-gray-200 rounded"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                itemsPerPage={problemsPerPage}
                totalItems={mockProblems.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
}
