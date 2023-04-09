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

export const isEmptySpace = (seat: unknown): seat is EmptySpace =>
  (seat as EmptySpace).isEmpty;

export const generateSeatSection = (
  name: SeatSectionName,
  rows: SeatRowForSection[]
): SeatSection => ({
  name,
  rows: rows.map((row) => ({
    ...row,
    seats: row.seats.map((seat) => {
      if (isEmptySpace(seat)) {
        return seat;
      }
      return {
        ...seat,
        id: `${name}|${row.letter}|${seat.num}`,
        rowLetter: row.letter,
      };
    }),
  })),
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

export type SeatForRow = Omit<Seat, "id" | "rowLetter">;
type SeatRowForSection = Omit<SeatRow, "seats"> & {
  seats: (SeatForRow | EmptySpace)[];
};

export const generateSeatRow = (
  rowLetter: RowLetter,
  seats: (SeatForRow | EmptySpace)[]
): SeatRowForSection => ({
  letter: rowLetter,
  seats,
});

export const generateSeat = ({ num, isBis }: SeatForRow): SeatForRow => ({
  num,
  isBis,
});

export const addBisAtStart = (seats: SeatForRow[]): SeatForRow[] => {
  return [generateSeat({ ...seats[0], isBis: true }), ...seats];
};

export const addBisAtEnd = (seats: SeatForRow[]): SeatForRow[] => {
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

export const alternateSeats = (numSeats: number): SeatForRow[] =>
  alternateNums(numSeats).map((num) => generateSeat({ num }));

export const seatsDecreasing = (numSeats: number, min: number): SeatForRow[] =>
  numsDecreasing(numSeats, min).map((num) => generateSeat({ num }));

export const seatsIncreasing = (numSeats: number, max: number): SeatForRow[] =>
  numsIncreasing(numSeats, max).map((num) => generateSeat({ num }));
