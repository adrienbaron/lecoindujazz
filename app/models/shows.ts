interface Show {
  id: string;
  title: string;
  datetime: Date;
}

export const shows: Show[] = [
  {
    id: "2024-06-22_12-00-00",
    title: 'Spectacle Enfants "BLOSSOM"',
    datetime: new Date("2024-06-22T12:00:00.000Z"),
  },
  {
    id: "2024-06-22_15-00-00",
    title: 'Spectacle Enfants "BLOSSOM"',
    datetime: new Date("2024-06-22T15:00:00.000Z"),
  },
  {
    id: "2024-06-22_19-00-00",
    title: 'Spectacle Adultes "BLOSSOM"',
    datetime: new Date("2024-06-22T19:00:00.000Z"),
  },
  {
    id: "2024-06-21_19-00-00",
    title: 'Spectacle Adultes "BLOSSOM"',
    datetime: new Date("2024-06-21T19:00:00.000Z"),
  },
];

export const showByIdMap = new Map(shows.map((show) => [show.id, show]));

export const showToHumanString = (show: Show): string =>
  `${show.title} - ${show.datetime.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    dateStyle: "medium",
  })} à ${show.datetime.toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    timeStyle: "short",
  })}`;
