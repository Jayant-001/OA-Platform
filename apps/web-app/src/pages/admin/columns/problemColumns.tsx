import { Badge } from "@/components/ui/badge";

export const problemColumns = [
  {
    accessorKey: "title",
    header: "Title",
    searchable: true,
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    searchable: true,
    cell: (row: any) => (
      <Badge
        className={
          row.difficulty === "easy"
            ? "bg-green-100 text-green-800"
            : row.difficulty === "medium"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }
      >
        {row.difficulty}
      </Badge>
    ),
  },
  {
    accessorKey: "points",
    header: "Points",
    searchable: false,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    searchable: true,
    cell: (row: any) => (
      <div className="flex gap-1 flex-wrap">
        {row.tags.map((tag: string) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    ),
  },
];

export const problemFilters = [
  {
    type: 'select' as const,
    label: 'Difficulty',
    key: 'difficulty',
    options: [
      { label: 'Easy', value: 'easy' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hard', value: 'hard' },
    ],
  },
];
