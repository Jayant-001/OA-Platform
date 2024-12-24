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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<T> {
  columns: any[];
  data: T[];
  selectedRows: string[];
  setSelectedRows: (ids: string[]) => void;
  filters?: {
    type: 'select';
    label: string;
    options: { label: string; value: string }[];
    key: string;
  }[];
  problemPoints?: Record<string, number>;
  handleProblemPointsChange?: (problemId: string, points: number) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  selectedRows,
  setSelectedRows,
  filters = [],
  problemPoints = {},
  handleProblemPointsChange,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const filteredData = data.filter((item: any) => {
    const matchesSearch = columns.some(
      (column) =>
        column.searchable &&
        String(item[column.accessorKey])
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    const matchesFilters = Object.entries(filterValues).every(
      ([key, value]) => {
        if (value === "all") return true;
        if (key === "tags") return item[key].includes(value);
        return item[key] === value;
      }
    );

    return matchesSearch && matchesFilters;
  });

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((item) => item.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "all"}
            onValueChange={(value) =>
              setFilterValues((prev) => ({ ...prev, [filter.key]: value }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}s</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    filteredData.length > 0 &&
                    selectedRows.length === filteredData.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.accessorKey}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onCheckedChange={() => handleSelectRow(row.id)}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.accessorKey}>
                    {column.accessorKey === "points" ? (
                      <Input
                        type="number"
                        value={problemPoints[row.id] || ""}
                        onChange={(e) =>
                          handleProblemPointsChange &&
                          handleProblemPointsChange(row.id, Number(e.target.value))
                        }
                        className="w-20"
                      />
                    ) : column.cell ? (
                      column.cell(row)
                    ) : (
                      row[column.accessorKey]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
