export type RowLetter = string;

export interface Seat {
  id: string;
  num: number;
  rowLetter: RowLetter;
  isBis?: boolean;
}

export interface EmptySpace {
  isEmpty: true;
  label?: string;
}

export interface SeatRow {
  letter: RowLetter;
  seats: (Seat | EmptySpace)[];
}

export interface SeatSection {
  name: string;
  rows: SeatRow[];
}

export const isEmptySpace = (seat: Seat | EmptySpace): seat is EmptySpace =>
  (seat as EmptySpace).isEmpty;

export const generateSeatSection = (
  name: string,
  rows: SeatRow[]
): SeatSection => ({
  name,
  rows,
});

export const generateEmptySpace = (label?: string): EmptySpace => ({
  isEmpty: true,
  label,
});

export const generateSeatForRow =
  (rowLetter: RowLetter): ((num: number) => Seat) =>
  (num: number) =>
    generateSeat({ num, rowLetter });

export const generateSeatRow = (
  rowLetter: RowLetter,
  seats: (Seat | EmptySpace)[]
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
