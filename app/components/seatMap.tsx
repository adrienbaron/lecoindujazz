import classNames from "classnames";
import React from "react";

import type { GridElement, RowLetter } from "~/utils/seatMap";
import {
  addBisAtEnd,
  addBisAtStart,
  alternateNums,
  generateCorridor,
  generateEmptySeats,
  generateRowLabel,
  generateSeatForRow,
  generateSeatRow,
  generateSeatSection,
  isEmptySpace,
  numsDecreasing,
  numsIncreasing,
} from "~/utils/seatMap";

const generateOrchestraRowWithBis = ({
  letter,
  seatsBefore = [],
  seatsAfter = [],
}: {
  letter: RowLetter;
  seatsBefore?: GridElement[];
  seatsAfter?: GridElement[];
}) => {
  return generateSeatRow(letter, [
    ...seatsBefore,
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateNums(13).map(generateSeatForRow(letter)))
    ),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsAfter,
  ]);
};

const generateOrchestraRowWithoutBis = ({
  letter,
  seatsBefore = [],
  seatsAfter = [],
}: {
  letter: RowLetter;
  seatsBefore?: GridElement[];
  seatsAfter?: GridElement[];
}) => {
  return generateSeatRow(letter, [
    ...seatsBefore,
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(14).map(generateSeatForRow(letter)),
    ...generateEmptySeats(),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsAfter,
  ]);
};

export const SeatMap: React.FC = () => {
  const section = generateSeatSection("Orchestre", [
    generateSeatRow("Q", [
      ...generateEmptySeats(8),
      generateCorridor(),
      generateRowLabel(),
      ...generateEmptySeats(3),
      ...addBisAtStart(
        addBisAtEnd(alternateNums(10).map(generateSeatForRow("Q")))
      ),
      generateRowLabel(),
      generateCorridor(),
      ...generateEmptySeats(8),
    ]),
    generateSeatRow("P", [
      ...generateEmptySeats(8),
      generateCorridor(),
      generateRowLabel(),
      ...generateEmptySeats(),
      ...alternateNums(13).map(generateSeatForRow("P")),
      ...generateEmptySeats(),
      generateRowLabel(),
      generateCorridor(),
      ...generateEmptySeats(8),
    ]),
    generateSeatRow("O", [
      ...generateEmptySeats(3),
      ...generateEmptySeats(2),
      ...generateEmptySeats(3),
      generateCorridor(),
      generateRowLabel(),
      ...generateEmptySeats(2),
      ...alternateNums(13)
        .filter((num) => num !== 12)
        .map(generateSeatForRow("O")),
      ...generateEmptySeats(),
      generateRowLabel(),
      generateCorridor(),
      ...generateEmptySeats(3),
      ...generateEmptySeats(2),
      ...generateEmptySeats(3),
    ]),
    generateOrchestraRowWithBis({
      letter: "N",
      seatsBefore: [
        ...generateEmptySeats(2),
        ...numsDecreasing(22, 16).map(generateSeatForRow("H")),
        ...generateEmptySeats(),
      ],
      seatsAfter: [
        ...generateEmptySeats(),
        ...numsIncreasing(15, 21).map(generateSeatForRow("H")),
        ...generateEmptySeats(2),
      ],
    }),
    generateOrchestraRowWithoutBis({
      letter: "M",
      seatsBefore: addBisAtEnd(
        numsDecreasing(26, 16).map(generateSeatForRow("M"))
      ),
      seatsAfter: addBisAtStart(
        numsIncreasing(15, 25).map(generateSeatForRow("M"))
      ),
    }),
    generateOrchestraRowWithBis({
      letter: "L",
      seatsBefore: addBisAtEnd(
        numsDecreasing(26, 16).map(generateSeatForRow("L"))
      ),
      seatsAfter: addBisAtStart(
        numsIncreasing(15, 25).map(generateSeatForRow("L"))
      ),
    }),
    generateOrchestraRowWithoutBis({
      letter: "K",
      seatsBefore: addBisAtEnd(
        numsDecreasing(26, 16).map(generateSeatForRow("K"))
      ),
      seatsAfter: addBisAtStart(
        numsIncreasing(15, 25).map(generateSeatForRow("K"))
      ),
    }),
    generateOrchestraRowWithBis({
      letter: "J",
      seatsBefore: addBisAtEnd(
        numsDecreasing(26, 16).map(generateSeatForRow("J"))
      ),
      seatsAfter: addBisAtStart(
        numsIncreasing(15, 25).map(generateSeatForRow("J"))
      ),
    }),
    generateOrchestraRowWithoutBis({
      letter: "I",
      seatsBefore: [
        ...generateEmptySeats(),
        ...addBisAtEnd(numsDecreasing(24, 16).map(generateSeatForRow("I"))),
      ],
      seatsAfter: [
        ...addBisAtStart(numsIncreasing(15, 23).map(generateSeatForRow("I"))),
        ...generateEmptySeats(),
      ],
    }),
    generateOrchestraRowWithBis({
      letter: "H",
      seatsBefore: [
        ...generateEmptySeats(2),
        ...addBisAtEnd(numsDecreasing(22, 16).map(generateSeatForRow("H"))),
      ],
      seatsAfter: [
        ...addBisAtStart(numsIncreasing(15, 21).map(generateSeatForRow("H"))),
        ...generateEmptySeats(2),
      ],
    }),
    generateOrchestraRowWithoutBis({
      letter: "G",
      seatsBefore: [
        ...generateEmptySeats(3),
        ...addBisAtEnd(numsDecreasing(20, 16).map(generateSeatForRow("G"))),
      ],
      seatsAfter: [
        ...addBisAtStart(numsIncreasing(15, 19).map(generateSeatForRow("G"))),
        ...generateEmptySeats(3),
      ],
    }),
    generateOrchestraRowWithBis({
      letter: "F",
      seatsBefore: [
        ...generateEmptySeats(3),
        ...addBisAtStart(numsDecreasing(18, 16).map(generateSeatForRow("F"))),
        ...generateEmptySeats(),
      ],
      seatsAfter: [
        ...generateEmptySeats(),
        ...addBisAtEnd(numsIncreasing(15, 17).map(generateSeatForRow("F"))),
        ...generateEmptySeats(3),
      ],
    }),
    generateOrchestraRowWithoutBis({
      letter: "E",
      seatsBefore: generateEmptySeats(7),
      seatsAfter: generateEmptySeats(7),
    }),
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
                  return (
                    <div
                      key={index}
                      className={classNames(
                        seat.type !== "corridor" && "bg-gray-800",
                        "flex h-8 w-8 flex-col items-center justify-center text-sm"
                      )}
                    >
                      {seat.type === "row-label" && <span>{row.letter}</span>}
                    </div>
                  );
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
