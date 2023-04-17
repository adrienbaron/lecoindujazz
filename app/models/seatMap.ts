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
  sectionType: SeatSectionType;
} & SeatAttributes;

export const PRICE_PER_SEAT_IN_CENTS = 1050;

export const sectionTypeToTitle: Record<SeatSectionType, string> = {
  ORCHESTRA: "Orchestre",
  FIRST_GALLERY: "Première galerie",
  SECOND_GALLERY: "Deuxième galerie",
  THIRD_GALLERY: "Troisième galerie",
};

export const seatToHumanString = ({ num, rowLetter, isBis }: Seat) => {
  return `${rowLetter}${num}${isBis ? " bis" : ""}`;
};

export interface UnavailableSeat {
  showId: string;
  seatId: string;
  reason: "locked" | "purchased";
}

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

export type SeatSectionType =
  | "ORCHESTRA"
  | "FIRST_GALLERY"
  | "SECOND_GALLERY"
  | "THIRD_GALLERY";

export interface SeatSection {
  type: SeatSectionType;
  rows: SeatRow[];
}

export const isEmptySpace = (seat: unknown): seat is EmptySpace =>
  (seat as EmptySpace).isEmpty;

export const generateSeatSection = (
  type: SeatSectionType,
  rows: SeatRowForSection[]
): SeatSection => ({
  type,
  rows: rows.map((row) => ({
    ...row,
    seats: row.seats.map((seat) => {
      if (isEmptySpace(seat)) {
        return seat;
      }
      return {
        ...seat,
        id: `${type}|${row.letter}|${seat.num}${seat.isBis ? "|bis" : ""}`,
        rowLetter: row.letter,
        sectionType: type,
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

export type SeatForRow = Omit<Seat, "id" | "rowLetter" | "sectionType">;

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

export const seatsDecreasing = (
  numSeats: number,
  min: number,
  seatAttributes: SeatAttributes = {}
): SeatForRow[] =>
  numsDecreasing(numSeats, min).map((num) => ({ num, ...seatAttributes }));

export const seatsIncreasing = (
  numSeats: number,
  max: number,
  seatAttributes: SeatAttributes = {}
): SeatForRow[] =>
  numsIncreasing(numSeats, max).map((num) => ({ num, ...seatAttributes }));

export const getSeatByIdMap = (sections: SeatSection[]) => {
  const seatByIdMap = new Map<string, Seat>();
  sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.seats.forEach((seat) => {
        if (isEmptySpace(seat)) return;
        seatByIdMap.set(seat.id, seat);
      });
    });
  });
  return seatByIdMap;
};
