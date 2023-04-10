import type { EmptySpace, RowLetter, SeatForRow } from "~/utils/seatMap";
import {
  addBisAtEnd,
  addBisAtStart,
  alternateSeats,
  generateCorridor,
  generateEmptySpace,
  generateRowLabel,
  generateSeatRow,
  generateSeatSection,
  seatsDecreasing,
  seatsIncreasing,
} from "~/utils/seatMap";

export const thirdGallerySection = generateSeatSection("THIRD_GALLERY", [
  generateSeatRow("F", [
    ...generateEmptySpace(11),
    generateRowLabel(),
    ...seatsDecreasing(24, 22),
    { num: 20, hasRestrictedView: true },
    { num: 18, isSecurity: true },
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsDecreasing(16, 8, { hasRestrictedView: true }),
    ...generateEmptySpace(9),
    ...seatsIncreasing(9, 17, { hasRestrictedView: true }),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    { num: 18, isSecurity: true },
    { num: 21, hasRestrictedView: true },
    ...seatsIncreasing(23, 25),
    generateRowLabel(),
    ...generateEmptySpace(11),
  ]),
  generateSeatRow("E", [
    ...generateEmptySpace(10),
    generateRowLabel(),
    ...seatsDecreasing(26, 22),
    ...seatsDecreasing(20, 18, { hasRestrictedView: true }),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsDecreasing(16, 10, { hasRestrictedView: true }),
    { num: 8 },
    ...generateEmptySpace(9),
    { num: 9 },
    ...seatsIncreasing(11, 17, { hasRestrictedView: true }),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(19, 21, { hasRestrictedView: true }),
    ...seatsIncreasing(23, 27),
    generateRowLabel(),
    ...generateEmptySpace(10),
  ]),
  generateSeatRow("D", [
    ...generateEmptySpace(8),
    generateRowLabel(),
    ...seatsDecreasing(30, 22),
    ...seatsDecreasing(20, 18, { hasRestrictedView: true }),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    { num: 16 },
    ...seatsDecreasing(14, 12, { hasRestrictedView: true }),
    ...seatsDecreasing(10, 8),
    ...generateEmptySpace(9),
    ...seatsIncreasing(9, 11),
    ...seatsIncreasing(13, 15, { hasRestrictedView: true }),
    { num: 17 },
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(19, 21, { hasRestrictedView: true }),
    ...seatsIncreasing(23, 31),
    generateRowLabel(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("C", [
    ...generateEmptySpace(6),
    generateRowLabel(),
    ...seatsDecreasing(34, 18),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsDecreasing(16, 6),
    ...generateEmptySpace(),
    ...alternateSeats(5),
    ...generateEmptySpace(),
    ...seatsIncreasing(7, 17),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(19, 35),
    generateRowLabel(),
    ...generateEmptySpace(6),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...seatsDecreasing(38, 24),
    { num: 22, hasRestrictedView: true },
    ...seatsDecreasing(20, 18),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(3),
    generateRowLabel(),
    ...alternateSeats(14),
    generateRowLabel(),
    ...generateEmptySpace(2),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(19, 21),
    { num: 23, hasRestrictedView: true },
    ...seatsIncreasing(25, 39),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...seatsDecreasing(40, 36),
    ...generateEmptySpace(3),
    ...seatsDecreasing(34, 20),
    { num: 18, isSecurity: true },
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...alternateSeats(12),
    generateRowLabel(),
    ...generateEmptySpace(3),
    generateCorridor(),
    generateRowLabel(),
    { num: 19, isSecurity: true },
    ...seatsIncreasing(21, 35),
    ...generateEmptySpace(3),
    ...seatsIncreasing(37, 41),
    generateRowLabel(),
  ]),
]);

export const secondGallerySection = generateSeatSection("SECOND_GALLERY", [
  generateSeatRow("C", [
    ...generateEmptySpace(8),
    generateRowLabel(),
    ...seatsDecreasing(24, 22),
    ...generateEmptySpace(2),
    ...seatsDecreasing(20, 18),
    ...generateEmptySpace(),
    { num: 16, isSecurity: true },
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateSeats(14),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    { num: 15, isSecurity: true },
    ...generateEmptySpace(),
    ...seatsIncreasing(17, 19),
    ...generateEmptySpace(2),
    ...seatsIncreasing(21, 23),
    generateRowLabel(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...seatsDecreasing(38, 34, { hasRestrictedView: true }),
    ...seatsDecreasing(32, 22),
    { num: 20, hasRestrictedView: true },
    ...seatsDecreasing(18, 16),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateSeats(13),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(15, 17),
    { num: 19, hasRestrictedView: true },
    ...seatsIncreasing(21, 31),
    ...seatsIncreasing(33, 37, { hasRestrictedView: true }),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("A", [
    generateRowLabel(),
    ...seatsDecreasing(42, 38),
    ...generateEmptySpace(),
    ...seatsDecreasing(36, 20),
    ...generateEmptySpace(),
    ...seatsDecreasing(18, 16),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateSeats(13),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(15, 17),
    ...generateEmptySpace(),
    ...seatsIncreasing(19, 35),
    ...generateEmptySpace(),
    ...seatsIncreasing(37, 41),
    generateRowLabel(),
  ]),
]);

export const firstGallerySection = generateSeatSection("FIRST_GALLERY", [
  generateSeatRow("D", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...seatsDecreasing(32, 28, { hasRestrictedView: true }),
    ...generateEmptySpace(),
    ...seatsDecreasing(26, 22, { hasRestrictedView: true }),
    ...generateEmptySpace(),
    ...seatsDecreasing(20, 18),
    ...generateEmptySpace(2),
    { num: 16, isSecurity: true },
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateSeats(14), { hasRestrictedView: true }),
      { hasRestrictedView: true }
    ),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    { num: 15, isSecurity: true },
    ...generateEmptySpace(),
    ...seatsIncreasing(17, 19),
    ...generateEmptySpace(),
    ...seatsIncreasing(21, 25, { hasRestrictedView: true }),
    ...generateEmptySpace(),
    ...seatsIncreasing(27, 31, { hasRestrictedView: true }),
    generateRowLabel(),
    ...generateEmptySpace(4),
  ]),
  generateSeatRow("C", [
    ...generateEmptySpace(4),
    generateRowLabel(),
    ...seatsDecreasing(36, 22, { hasRestrictedView: true }),
    ...seatsDecreasing(20, 18),
    ...generateEmptySpace(),
    ...addBisAtEnd([{ num: 16, hasRestrictedView: true }], {
      hasRestrictedView: true,
    }),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...addBisAtStart(
      addBisAtEnd(alternateSeats(12), { hasRestrictedView: true }),
      { hasRestrictedView: true }
    ),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([{ num: 15, hasRestrictedView: true }], {
      hasRestrictedView: true,
    }),
    ...generateEmptySpace(),
    ...seatsIncreasing(17, 19),
    ...addBisAtEnd(seatsIncreasing(21, 35, { hasRestrictedView: true }), {
      hasRestrictedView: true,
    }),
    generateRowLabel(),
    ...generateEmptySpace(2),
  ]),
  generateSeatRow("B", [
    ...generateEmptySpace(3),
    generateRowLabel(),
    ...seatsDecreasing(38, 18),
    ...generateEmptySpace(),
    ...addBisAtEnd([{ num: 16, hasRestrictedView: true }], {
      hasRestrictedView: true,
    }),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...alternateSeats(11),
    generateRowLabel(),
    ...generateEmptySpace(4),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart([{ num: 15, hasRestrictedView: true }], {
      hasRestrictedView: true,
    }),
    ...generateEmptySpace(),
    ...seatsIncreasing(17, 37),
    generateRowLabel(),
    ...generateEmptySpace(2),
  ]),
  generateSeatRow("A", [
    ...addBisAtStart(seatsDecreasing(40, 38), { isSecurity: true }),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...seatsDecreasing(36, 16),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...alternateSeats(11),
    generateRowLabel(),
    ...generateEmptySpace(4),
    generateCorridor(),
    generateRowLabel(),
    ...seatsIncreasing(15, 35),
    generateRowLabel(),
    ...generateEmptySpace(),
    generateRowLabel(),
    ...addBisAtEnd(seatsIncreasing(37, 39), { isSecurity: true }),
  ]),
]);

const generateOrchestraRowWithBis = ({
  letter,
  seatsBefore = [],
  seatsAfter = [],
}: {
  letter: RowLetter;
  seatsBefore?: (SeatForRow | EmptySpace)[];
  seatsAfter?: (SeatForRow | EmptySpace)[];
}) => {
  return generateSeatRow(letter, [
    ...seatsBefore,
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(addBisAtEnd(alternateSeats(13))),
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
  seatsBefore?: (SeatForRow | EmptySpace)[];
  seatsAfter?: (SeatForRow | EmptySpace)[];
}) => {
  return generateSeatRow(letter, [
    ...seatsBefore,
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...alternateSeats(14),
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
    ...addBisAtStart(addBisAtEnd(alternateSeats(10))),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("P", [
    ...generateEmptySpace(8),
    generateCorridor(),
    generateRowLabel(),
    ...generateEmptySpace(),
    ...alternateSeats(13),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(8),
  ]),
  generateSeatRow("O", [
    ...generateEmptySpace(3),
    ...seatsDecreasing(20, 18, { isWheelchairAccessible: true }),
    ...generateEmptySpace(3),
    generateCorridor(),
    generateRowLabel(),
    ...generateEmptySpace(2),
    ...alternateSeats(13).filter(({ num }) => num !== 12),
    ...generateEmptySpace(),
    generateRowLabel(),
    generateCorridor(),
    ...generateEmptySpace(3),
    ...seatsIncreasing(17, 19, { isWheelchairAccessible: true }),
    ...generateEmptySpace(3),
  ]),
  generateOrchestraRowWithBis({
    letter: "N",
    seatsBefore: [
      ...generateEmptySpace(2),
      ...seatsDecreasing(22, 16),
      ...generateEmptySpace(),
    ],
    seatsAfter: [
      ...generateEmptySpace(),
      ...seatsIncreasing(15, 21),
      ...generateEmptySpace(2),
    ],
  }),
  generateOrchestraRowWithoutBis({
    letter: "M",
    seatsBefore: addBisAtEnd(seatsDecreasing(26, 16)),
    seatsAfter: addBisAtStart(seatsIncreasing(15, 25)),
  }),
  generateOrchestraRowWithBis({
    letter: "L",
    seatsBefore: addBisAtEnd(seatsDecreasing(26, 16)),
    seatsAfter: addBisAtStart(seatsIncreasing(15, 25)),
  }),
  generateOrchestraRowWithoutBis({
    letter: "K",
    seatsBefore: addBisAtEnd(seatsDecreasing(26, 16), { isSecurity: true }),
    seatsAfter: addBisAtStart(seatsIncreasing(15, 25), { isSecurity: true }),
  }),
  generateSeatRow("J", [
    ...addBisAtEnd(seatsDecreasing(26, 16)),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(addBisAtEnd(alternateSeats(13), { isSecurity: true }), {
      isSecurity: true,
    }),
    generateRowLabel(),
    generateCorridor(),
    generateRowLabel(),
    ...addBisAtStart(seatsIncreasing(15, 25)),
  ]),
  generateOrchestraRowWithoutBis({
    letter: "I",
    seatsBefore: [
      ...generateEmptySpace(),
      ...addBisAtEnd(seatsDecreasing(24, 16)),
    ],
    seatsAfter: [
      ...addBisAtStart(seatsIncreasing(15, 23)),
      ...generateEmptySpace(),
    ],
  }),
  generateOrchestraRowWithBis({
    letter: "H",
    seatsBefore: [
      ...generateEmptySpace(2),
      ...addBisAtEnd(seatsDecreasing(22, 16)),
    ],
    seatsAfter: [
      ...addBisAtStart(seatsIncreasing(15, 21)),
      ...generateEmptySpace(2),
    ],
  }),
  generateOrchestraRowWithoutBis({
    letter: "G",
    seatsBefore: [
      ...generateEmptySpace(3),
      ...addBisAtEnd(seatsDecreasing(20, 16)),
    ],
    seatsAfter: [
      ...addBisAtStart(seatsIncreasing(15, 19)),
      ...generateEmptySpace(3),
    ],
  }),
  generateOrchestraRowWithBis({
    letter: "F",
    seatsBefore: [
      ...generateEmptySpace(3),
      ...addBisAtStart(seatsDecreasing(18, 16), { hasRestrictedView: true }),
      ...generateEmptySpace(),
    ],
    seatsAfter: [
      ...generateEmptySpace(),
      ...addBisAtEnd(seatsIncreasing(15, 17), { hasRestrictedView: true }),
      ...generateEmptySpace(3),
    ],
  }),
  generateOrchestraRowWithoutBis({
    letter: "E",
    seatsBefore: generateEmptySpace(7),
    seatsAfter: generateEmptySpace(7),
  }),
]);

export const calaisTheatreAllSections = [
  thirdGallerySection,
  secondGallerySection,
  firstGallerySection,
  orchestraSection,
];
