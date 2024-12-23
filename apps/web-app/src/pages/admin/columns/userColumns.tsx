export const userColumns = [
  {
    accessorKey: "name",
    header: "Name",
    searchable: true,
  },
  {
    accessorKey: "email",
    header: "Email",
    searchable: true,
  },
  {
    accessorKey: "college",
    header: "College",
    searchable: true,
  },
  {
    accessorKey: "batch",
    header: "Batch",
    searchable: true,
  },
];

export const userFilters = [
  {
    type: 'select' as const,
    label: 'College',
    key: 'college',
    options: [
      { label: 'College A', value: 'college_a' },
      { label: 'College B', value: 'college_b' },
      { label: 'College C', value: 'college_c' },
    ],
  },
  {
    type: 'select' as const,
    label: 'Batch',
    key: 'batch',
    options: [
      { label: '2020', value: '2020' },
      { label: '2021', value: '2021' },
      { label: '2022', value: '2022' },
      { label: '2023', value: '2023' },
    ],
  },
];
