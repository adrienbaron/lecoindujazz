import type { GridElement, RowLetter } from "~/utils/seatMap";
import {
  addBisAtEnd,
  addBisAtStart,
  alternateNums,
  generateCorridor,
  generateEmptySpace,
  generateRowLabel,
  generateSeatForRow,
  generateSeatRow,
  generateSeatSection,
  numsDecreasing,
  numsIncreasing,
} from "~/utils/seatMap";

export const thirdGallerySection = generateSeatSection("THIRD_GALLERY", [
  generateSeatRow("F", [
    ...generateEmptySpace(11),
    generateRowLabel(),
    ...numsDecreasing(24, 18).map(generateSeatForRow("F")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("F")),
    ...generateEmptySpace(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("F")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 25).map(generateSeatForRow("F")),
    generateRowLabel(),
    ...generateEmptySpace(11),
  ]),
  generateSeatRow("E", [
    ...generateEmptySpace(10),
    generateRowLabel(),
    ...numsDecreasing(26, 18).map(generateSeatForRow("E")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("E")),
    ...generateEmptySpace(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("E")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 27).map(generateSeatForRow("E")),
    generateRowLabel(),
    ...generateEmptySpace(10),
  ]),
  generateSeatRow("D", [
    ...generateEmptySpace(8),
    generateRowLabel(),
    ...numsDecreasing(30, 18).map(generateSeatForRow("D")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 8).map(generateSeatForRow("D")),
    ...generateEmptySpace(9),
    ...numsIncreasing(9, 17).map(generateSeatForRow("D")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 31).map(generateSeatForRow("D")),
    generateRowLabel(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("C", [
    ...generateEmptySpace(6),
    generateRowLabel(),
    ...numsDecreasing(34, 18).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsDecreasing(16, 6).map(generateSeatForRow("C")),
    ...generateEmptySpace(),
    ...alternateNums(5).map(generateSeatForRow("C")),
    ...generateEmptySpace(),
    ...numsIncreasing(7, 17).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("C")),
    generateRowLabel(),
    ...generateEmptySpace(6),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...numsDecreasing(38, 18).map(generateSeatForRow("B")),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(3),
    generateRowLabel(),
    ...alternateNums(14).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(2),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 39).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...numsDecreasing(40, 36).map(generateSeatForRow("A")),
    ...generateEmptySpace(3),
    ...numsDecreasing(34, 18).map(generateSeatForRow("A")),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...alternateNums(12).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySpace(3),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("A")),
    ...generateEmptySpace(3),
    ...numsIncreasing(37, 41).map(generateSeatForRow("A")),
    generateRowLabel(),
  ]),
]);

export const secondGallerySection = generateSeatSection("SECOND_GALLERY", [
  generateSeatRow("C", [
    ...generateEmptySpace(8),
    generateRowLabel(),
    ...numsDecreasing(24, 22).map(generateSeatForRow("C")),
    ...generateEmptySpace(2),
    ...numsDecreasing(20, 18).map(generateSeatForRow("C")),
    ...generateEmptySpace(),
    generateSeatForRow("C")(16),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(14).map(generateSeatForRow("C")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    generateSeatForRow("C")(15),
    ...generateEmptySpace(),
    ...numsIncreasing(17, 19).map(generateSeatForRow("C")),
    ...generateEmptySpace(2),
    ...numsIncreasing(21, 23).map(generateSeatForRow("C")),
    generateRowLabel(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...numsDecreasing(38, 16).map(generateSeatForRow("B")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(13).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 37).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...numsDecreasing(42, 38).map(generateSeatForRow("A")),
    ...generateEmptySpace(),
    ...numsDecreasing(36, 20).map(generateSeatForRow("A")),
    ...generateEmptySpace(),
    ...numsDecreasing(18, 16).map(generateSeatForRow("A")),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateNums(13).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 17).map(generateSeatForRow("A")),
    ...generateEmptySpace(),
    ...numsIncreasing(19, 35).map(generateSeatForRow("A")),
    ...generateEmptySpace(),
    ...numsIncreasing(37, 41).map(generateSeatForRow("A")),
    generateRowLabel(),
  ]),
]);

export const firstGallerySection = generateSeatSection("FIRST_GALLERY", [
  generateSeatRow("D", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...numsDecreasing(32, 28).map(generateSeatForRow("D")),
    ...generateEmptySpace(),
    ...numsDecreasing(26, 22).map(generateSeatForRow("D")),
    ...generateEmptySpace(),
    ...numsDecreasing(20, 18).map(generateSeatForRow("D")),
    ...generateEmptySpace(2),
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
    ...generateEmptySpace(),
    ...numsIncreasing(17, 19).map(generateSeatForRow("D")),
    ...generateEmptySpace(),
    ...numsIncreasing(21, 25).map(generateSeatForRow("D")),
    ...generateEmptySpace(),
    ...numsIncreasing(27, 31).map(generateSeatForRow("D")),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("C", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...numsDecreasing(36, 18).map(generateSeatForRow("C")),
    ...generateEmptySpace(),
    ...addBisAtEnd([generateSeatForRow("C")(16)]),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateNums(12).map(generateSeatForRow("C")))
    ),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([generateSeatForRow("C")(15)]),
    ...generateEmptySpace(),
    ...addBisAtEnd(numsIncreasing(17, 35).map(generateSeatForRow("C"))),
    generateRowLabel(),
    ...generateEmptySpace(2),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(3),
    generateRowLabel(),
    ...numsDecreasing(38, 18).map(generateSeatForRow("B")),
    ...generateEmptySpace(),
    ...addBisAtEnd([generateSeatForRow("B")(16)]),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...alternateNums(11).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(4),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([generateSeatForRow("B")(15)]),
    ...generateEmptySpace(),
    ...numsIncreasing(17, 37).map(generateSeatForRow("B")),
    generateRowLabel(),
    ...generateEmptySpace(2),
  ]),
  generateSeatRow("A", [
    ...addBisAtStart(numsDecreasing(40, 38).map(generateSeatForRow("A"))),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...numsDecreasing(36, 16).map(generateSeatForRow("A")),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...alternateNums(11).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySpace(4),
    generateCorridor(),
    generateRowLabel(),
    ...numsIncreasing(15, 35).map(generateSeatForRow("A")),
    generateRowLabel(),
    ...generateEmptySpace(),
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
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsAfter,
  ]);
};

export const orchestraSection = generateSeatSection("ORCHESTRA", [
  generateSeatRow("Q", [
    ...generateEmptySpace(8),
    generateCorridor(),
    generateRowLabel(),
    ...generateEmptySpace(3),
    ...addBisAtStart(
      addBisAtEnd(alternateNums(10).map(generateSeatForRow("Q")))
    ),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("P", [
    ...generateEmptySpace(8),
    generateCorridor(),
    generateRowLabel(),
    ...generateEmptySpace(),
    ...alternateNums(13).map(generateSeatForRow("P")),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("O", [
    ...generateEmptySpace(3),
    ...generateEmptySpace(2),
    ...generateEmptySpace(3),
    generateCorridor(),
    generateRowLabel(),
    ...generateEmptySpace(2),
    ...alternateNums(13)
      .filter((num) => num !== 12)
      .map(generateSeatForRow("O")),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(3),
    ...generateEmptySpace(2),
    ...generateEmptySpace(3),
  ]),
  generateOrchestraRowWithBis({
    letter: "N",
    seatsBefore: [
      ...generateEmptySpace(2),
      ...numsDecreasing(22, 16).map(generateSeatForRow("H")),
      ...generateEmptySpace(),
    ],
    seatsAfter: [
      ...generateEmptySpace(),
      ...numsIncreasing(15, 21).map(generateSeatForRow("H")),
      ...generateEmptySpace(2),
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
      ...generateEmptySpace(),
      ...addBisAtEnd(numsDecreasing(24, 16).map(generateSeatForRow("I"))),
    ],
    seatsAfter: [
      ...addBisAtStart(numsIncreasing(15, 23).map(generateSeatForRow("I"))),
      ...generateEmptySpace(),
    ],
  }),
  generateOrchestraRowWithBis({
    letter: "H",
    seatsBefore: [
      ...generateEmptySpace(2),
      ...addBisAtEnd(numsDecreasing(22, 16).map(generateSeatForRow("H"))),
    ],
    seatsAfter: [
      ...addBisAtStart(numsIncreasing(15, 21).map(generateSeatForRow("H"))),
      ...generateEmptySpace(2),
    ],
  }),
  generateOrchestraRowWithoutBis({
    letter: "G",
    seatsBefore: [
      ...generateEmptySpace(3),
      ...addBisAtEnd(numsDecreasing(20, 16).map(generateSeatForRow("G"))),
    ],
    seatsAfter: [
      ...addBisAtStart(numsIncreasing(15, 19).map(generateSeatForRow("G"))),
      ...generateEmptySpace(3),
    ],
  }),
  generateOrchestraRowWithBis({
    letter: "F",
    seatsBefore: [
      ...generateEmptySpace(3),
      ...addBisAtStart(numsDecreasing(18, 16).map(generateSeatForRow("F"))),
      ...generateEmptySpace(),
    ],
    seatsAfter: [
      ...generateEmptySpace(),
      ...addBisAtEnd(numsIncreasing(15, 17).map(generateSeatForRow("F"))),
      ...generateEmptySpace(3),
    ],
  }),
  generateOrchestraRowWithoutBis({
    letter: "E",
    seatsBefore: generateEmptySpace(7),
    seatsAfter: generateEmptySpace(7),
  }),
]);
