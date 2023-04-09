export type RowLetter = string;

export interface Seat {
  id: string;
  num: number;
  rowLetter: RowLetter;
  isBis?: boolean;
}

export type EmptySpace = { isEmpty: true } & (
  | { type: "seat" }
  | { type: "row-label" }
  | { type: "corridor" }
);

export type GridElement = Seat | EmptySpace;

export interface SeatRow {
  letter: RowLetter;
  seats: GridElement[];
}

type SeatSectionName =
  | "ORCHESTRA"
  | "FIRST_GALLERY"
  | "SECOND_GALLERY"
  | "THIRD_GALLERY";

export interface SeatSection {
  name: SeatSectionName;
  rows: SeatRow[];
}

export const isEmptySpace = (seat: GridElement): seat is EmptySpace =>
  (seat as EmptySpace).isEmpty;

export const generateSeatSection = (
  name: SeatSectionName,
  rows: SeatRow[]
): SeatSection => ({
  name,
  rows,
});

export const generateEmptySpace = (count = 1): EmptySpace[] => {
  const emptySpaces: EmptySpace[] = [];
  for (let i = 0; i < count; i++) {
    emptySpaces.push({ isEmpty: true, type: "seat" });
  }
  return emptySpaces;
};

export const generateCorridor = (): EmptySpace => ({
  isEmpty: true,
  type: "corridor",
});

export const generateRowLabel = (): EmptySpace => ({
  isEmpty: true,
  type: "row-label",
});

export const generateSeatForRow =
  (rowLetter: RowLetter): ((num: number) => Seat) =>
  (num: number) =>
    generateSeat({ num, rowLetter });

export const generateSeatRow = (
  rowLetter: RowLetter,
  seats: GridElement[]
): SeatRow => ({
  letter: rowLetter,
  seats,
});

export const generateSeat = ({
  num,
  rowLetter,
  isBis,
}: Omit<Seat, "id">): Seat => ({
  id: `${rowLetter}${num}`,
  num,
  rowLetter,
  isBis,
});

export const addBisAtStart = (seats: Seat[]): Seat[] => {
  return [generateSeat({ ...seats[0], isBis: true }), ...seats];
};

export const addBisAtEnd = (seats: Seat[]): Seat[] => {
  return [...seats, generateSeat({ ...seats[seats.length - 1], isBis: true })];
};

export const alternateNums = (numSeats: number): number[] => {
  const seatList: number[] = [];

  let currentSeatNum = numSeats % 2 === 0 ? numSeats : numSeats - 1;
  let delta = -2;
  for (let i = 0; i < numSeats; i++) {
    seatList.push(currentSeatNum);
    currentSeatNum += delta;
    if (currentSeatNum <= 0) {
      currentSeatNum = 1;
      delta = 2;
    }
  }

  return seatList;
};

export const numsDecreasing = (numSeats: number, min: number): number[] => {
  const seatList: number[] = [];

  for (let i = numSeats; i >= min; i = i - 2) {
    seatList.push(i);
  }

  return seatList;
};

export const numsIncreasing = (numSeats: number, max: number): number[] => {
  const seatList: number[] = [];

  for (let i = numSeats; i <= max; i = i + 2) {
    seatList.push(i);
  }

  return seatList;
};
