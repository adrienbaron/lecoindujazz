export type RowLetter = string;

type SeatAttributes = {
  isBis?: boolean;
  isSecurity?: boolean;
  hasRestrictedView?: boolean;
  isWheelchairAccessible?: boolean;
};

export type Seat = {
  id: string;
  num: number;
  rowLetter: RowLetter;
} & SeatAttributes;

export type EmptySpace = { isEmpty: true } & (
  | { type: "spacing" }
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

export const generateEmptySpace = (
  count = 1,
  { type = "spacing" }: { type?: EmptySpace["type"] } = {}
): EmptySpace[] => {
  const emptySpaces: EmptySpace[] = [];
  for (let i = 0; i < count; i++) {
    emptySpaces.push({ isEmpty: true, type });
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

export const addBisAtStart = (
  seats: SeatForRow[],
  seatAttributes: SeatAttributes = {}
): SeatForRow[] => {
  return [{ num: seats[0].num, ...seatAttributes, isBis: true }, ...seats];
};

export const addBisAtEnd = (
  seats: SeatForRow[],
  seatAttributes: SeatAttributes = {}
): SeatForRow[] => {
  return [
    ...seats,
    {
      num: seats[seats.length - 1].num,
      ...seatAttributes,
      isBis: true,
    },
  ];
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
  alternateNums(numSeats).map((num) => ({ num }));

export const seatsDecreasing = (numSeats: number, min: number): SeatForRow[] =>
  numsDecreasing(numSeats, min).map((num) => ({ num }));

export const seatsIncreasing = (numSeats: number, max: number): SeatForRow[] =>
  numsIncreasing(numSeats, max).map((num) => ({ num }));
