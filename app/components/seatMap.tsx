import React from "react";

import type { RowLetter } from "~/utils/seatMap";
import {
  alternateNums,
  generateEmptySpace,
  generateSeat,
  generateSeatForRow,
  generateSeatRow,
  generateSeatSection,
  isEmptySpace,
} from "~/utils/seatMap";

const generateOrchestraRowWithBis = (letter: RowLetter) => {
  return generateSeatRow(letter, [
    generateSeat({ rowLetter: letter, num: 12, isBis: true }),
    ...alternateNums(13).map(generateSeatForRow(letter)),
    generateSeat({ rowLetter: letter, num: 13, isBis: true }),
  ]);
};

const generateOrchestraRowWithoutBis = (letter: RowLetter) => {
  return generateSeatRow(letter, [
    ...alternateNums(14).map(generateSeatForRow(letter)),
    generateEmptySpace(),
  ]);
};

export const SeatMap: React.FC = () => {
  const section = generateSeatSection("Orchestre", [
    generateSeatRow("Q", [
      generateEmptySpace(),
      generateEmptySpace(),
      generateEmptySpace(),
      generateSeat({ rowLetter: "Q", num: 10, isBis: true }),
      ...alternateNums(10).map(generateSeatForRow("Q")),
      generateSeat({ rowLetter: "Q", num: 9, isBis: true }),
    ]),
    generateSeatRow("P", [
      generateEmptySpace(),
      ...alternateNums(13).map(generateSeatForRow("P")),
      generateEmptySpace(),
    ]),
    generateSeatRow("O", [
      generateEmptySpace(),
      generateEmptySpace(),
      ...alternateNums(13)
        .filter((num) => num !== 12)
        .map(generateSeatForRow("O")),
      generateEmptySpace(),
    ]),
    generateOrchestraRowWithBis("N"),
    generateOrchestraRowWithoutBis("M"),
    generateOrchestraRowWithBis("L"),
    generateOrchestraRowWithoutBis("K"),
    generateOrchestraRowWithBis("J"),
    generateOrchestraRowWithoutBis("I"),
    generateOrchestraRowWithBis("H"),
    generateOrchestraRowWithoutBis("G"),
    generateOrchestraRowWithBis("F"),
    generateOrchestraRowWithoutBis("E"),
  ]);

  return (
    <div>
      <h1>Seat Map</h1>
      <div>
        <h2>{section.name}</h2>
        <div className="flex flex-col gap-2">
          {section.rows.map((row) => (
            <div key={row.letter} className="flex gap-2">
              {row.seats.map((seat, index) => {
                if (isEmptySpace(seat)) {
                  return <div key={index} className="h-8 w-8 bg-gray-300" />;
                } else {
                  return (
                    <div
                      key={index}
                      className="flex h-8 w-8 flex-col items-center justify-center bg-red-700 text-sm"
                    >
                      <span>{seat.num}</span>
                      <span>{seat.isBis && "bis"}</span>
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
