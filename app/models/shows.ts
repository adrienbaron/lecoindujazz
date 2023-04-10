interface Show {
  id: string;
  title: string;
  date: Date;
}

export const shows: Show[] = [
  {
    id: "MOCK_SHOW_ID",
    title: "Demo show",
    date: new Date("2021-09-01"),
  },
];

export const showByIdMap = new Map(shows.map((show) => [show.id, show]));
