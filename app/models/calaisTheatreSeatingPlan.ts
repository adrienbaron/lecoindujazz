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
  numsDecreasing,
  numsIncreasing,
} from "~/utils/seatMap";

export const thirdGallerySection = generateSeatSection("THIRD_GALLERY", [
  generateSeatRow("F", [
    ...generateEmptySeats(11),
    generateRowLabel(),
    ...numsDecreasing(24, 18).map(generateSeatForRow("F")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("F")),
    ...generateEmptySeats(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("F")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 25).map(generateSeatForRow("F")),
    generateRowLabel(),
    ...generateEmptySeats(11),
  ]),
  generateSeatRow("E", [
    ...generateEmptySeats(10),
    generateRowLabel(),
    ...numsDecreasing(26, 18).map(generateSeatForRow("E")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("E")),
    ...generateEmptySeats(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("E")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 27).map(generateSeatForRow("E")),
    generateRowLabel(),
    ...generateEmptySeats(10),
  ]),
  generateSeatRow("D", [
    ...generateEmptySeats(8),
    generateRowLabel(),
    ...numsDecreasing(30, 18).map(generateSeatForRow("D")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("D")),
    ...generateEmptySeats(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("D")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 31).map(generateSeatForRow("D")),
    generateRowLabel(),
    ...generateEmptySeats(8),
  ]),
  generateSeatRow("C", [
    ...generateEmptySeats(6),
    generateRowLabel(),
    ...numsDecreasing(34, 18).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 6).map(generateSeatForRow("C")),
    ...generateEmptySeats(),
    ...alternateNums(5).map(generateSeatForRow("C")),
    ...generateEmptySeats(),
    ...numsIncreasing(7, 17).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("C")),
    generateRowLabel(),
    ...generateEmptySeats(6),
  ]),
  generateSeatRow("B", [
    ...generateEmptySeats(4),
    generateRowLabel(),
    ...numsDecreasing(38, 18).map(generateSeatForRow("B")),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySeats(3),
    generateRowLabel(),
    ...alternateNums(14).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(2),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 39).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...numsDecreasing(40, 36).map(generateSeatForRow("A")),
    ...generateEmptySeats(3),
    ...numsDecreasing(34, 18).map(generateSeatForRow("A")),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySeats(4),
    generateRowLabel(),
    ...alternateNums(12).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySeats(3),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("A")),
    ...generateEmptySeats(3),
    ...numsIncreasing(37, 41).map(generateSeatForRow("A")),
    generateRowLabel(),
  ]),
]);

export const secondGallerySection = generateSeatSection("SECOND_GALLERY", [
  generateSeatRow("C", [
    ...generateEmptySeats(8),
    generateRowLabel(),
    ...numsDecreasing(24, 22).map(generateSeatForRow("C")),
    ...generateEmptySeats(2),
    ...numsDecreasing(20, 18).map(generateSeatForRow("C")),
    ...generateEmptySeats(),
    generateSeatForRow("C")(16),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(14).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    generateSeatForRow("C")(15),
    ...generateEmptySeats(),
    ...numsIncreasing(17, 19).map(generateSeatForRow("C")),
    ...generateEmptySeats(2),
    ...numsIncreasing(21, 23).map(generateSeatForRow("C")),
    generateRowLabel(),
    ...generateEmptySeats(8),
  ]),
  generateSeatRow("B", [
    ...generateEmptySeats(4),
    generateRowLabel(),
    ...numsDecreasing(38, 16).map(generateSeatForRow("B")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(13).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 37).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...numsDecreasing(42, 38).map(generateSeatForRow("A")),
    ...generateEmptySeats(),
    ...numsDecreasing(36, 20).map(generateSeatForRow("A")),
    ...generateEmptySeats(),
    ...numsDecreasing(18, 16).map(generateSeatForRow("A")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(13).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySeats(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 17).map(generateSeatForRow("A")),
    ...generateEmptySeats(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("A")),
    ...generateEmptySeats(),
    ...numsIncreasing(37, 41).map(generateSeatForRow("A")),
    generateRowLabel(),
  ]),
]);

export const firstGallerySection = generateSeatSection("FIRST_GALLERY", [
  generateSeatRow("D", [
    ...generateEmptySeats(4),
    generateRowLabel(),
    ...numsDecreasing(32, 28).map(generateSeatForRow("D")),
    ...generateEmptySeats(),
    ...numsDecreasing(26, 22).map(generateSeatForRow("D")),
    ...generateEmptySeats(),
    ...numsDecreasing(20, 18).map(generateSeatForRow("D")),
    ...generateEmptySeats(2),
    generateSeatForRow("D")(16),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateNums(14).map(generateSeatForRow("D")))
    ),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    generateSeatForRow("D")(15),
    ...generateEmptySeats(),
    ...numsIncreasing(17, 19).map(generateSeatForRow("D")),
    ...generateEmptySeats(),
    ...numsIncreasing(21, 25).map(generateSeatForRow("D")),
    ...generateEmptySeats(),
    ...numsIncreasing(27, 31).map(generateSeatForRow("D")),
    generateRowLabel(),
    ...generateEmptySeats(4),
  ]),
  generateSeatRow("C", [
    ...generateEmptySeats(4),
    generateRowLabel(),
    ...numsDecreasing(36, 18).map(generateSeatForRow("C")),
    ...generateEmptySeats(),
    ...addBisAtEnd([generateSeatForRow("C")(16)]),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySeats(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateNums(12).map(generateSeatForRow("C")))
    ),
    generateRowLabel(),
    ...generateEmptySeats(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([generateSeatForRow("C")(15)]),
    ...generateEmptySeats(),
    ...addBisAtEnd(numsIncreasing(17, 35).map(generateSeatForRow("C"))),
    generateRowLabel(),
    ...generateEmptySeats(2),
  ]),
  generateSeatRow("B", [
    ...generateEmptySeats(3),
    generateRowLabel(),
    ...numsDecreasing(38, 18).map(generateSeatForRow("B")),
    ...generateEmptySeats(),
    ...addBisAtEnd([generateSeatForRow("B")(16)]),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySeats(),
    generateRowLabel(),
    ...alternateNums(11).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(4),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([generateSeatForRow("B")(15)]),
    ...generateEmptySeats(),
    ...numsIncreasing(17, 37).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySeats(2),
  ]),
  generateSeatRow("A", [
    ...addBisAtStart(numsDecreasing(40, 38).map(generateSeatForRow("A"))),
    generateRowLabel(),
    ...generateEmptySeats(),
    generateRowLabel(),
    ...numsDecreasing(36, 16).map(generateSeatForRow("A")),
    ...generateEmptySeats(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySeats(),
    generateRowLabel(),
    ...alternateNums(11).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySeats(4),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 35).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySeats(),
    generateRowLabel(),
    ...addBisAtEnd(numsIncreasing(37, 39).map(generateSeatForRow("A"))),
  ]),
]);

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

export const orchestraSection = generateSeatSection("ORCHESTRA", [
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
