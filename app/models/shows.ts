interface Show {
  id: string;
  title: string;
  datetime: Date;
}

export const shows: Show[] = [
  {
    id: "SHOW_ID_1",
    title: "Enfants I AM 2",
    datetime: new Date("2023-06-24T12:00:00.000Z"),
  },
  {
    id: "SHOW_ID_2",
    title: "Enfants I AM 2",
    datetime: new Date("2023-06-24T15:00:00.000Z"),
  },
  {
    id: "SHOW_ID_3",
    title: "Adultes I AM 2",
    datetime: new Date("2023-06-24T19:00:00.000Z"),
  },
];

export const showByIdMap = new Map(shows.map((show) => [show.id, show]));

export const showToHumanString = (show: Show): string =>
  `${show.title} - ${show.datetime.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
    timeStyle: "short",
  })}`;
