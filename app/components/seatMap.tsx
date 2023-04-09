import { Form } from "@remix-run/react";
import classNames from "classnames";
import React from "react";

import {
  firstGallerySection,
  orchestraSection,
  secondGallerySection,
  thirdGallerySection,
} from "~/models/calaisTheatreSeatingPlan";
import type { SeatSectionType } from "~/utils/seatMap";
import { isEmptySpace } from "~/utils/seatMap";

const sectionTypeToTitle: Record<SeatSectionType, string> = {
  ORCHESTRA: "Orchestre",
  FIRST_GALLERY: "Première galerie",
  SECOND_GALLERY: "Deuxième galerie",
  THIRD_GALLERY: "Troisième galerie",
};

interface SeatMapProps {
  seatIds: string[];
}

export const SeatMap: React.FC<SeatMapProps> = ({ seatIds }) => {
  const sections = [
    thirdGallerySection,
    secondGallerySection,
    firstGallerySection,
    orchestraSection,
  ];

  const seatIdsSet = new Set(seatIds);

  return (
    <div className="flex w-full overflow-scroll">
      <Form className="flex flex-col items-center gap-6" method="post">
        {sections.map((section) => (
          <div
            key={section.type}
            className="m-auto flex flex-col items-center gap-2"
          >
            <h2 className="text-lg font-medium">
              {sectionTypeToTitle[section.type]}
            </h2>
            <div className="space-y-2">
              {section.rows.map((row) => (
                <div key={row.letter} className="flex gap-2">
                  {row.seats.map((seat, index) => {
                    if (isEmptySpace(seat)) {
                      return (
                        <div
                          key={index}
                          className={classNames(
                            seat.type === "row-label" && "bg-gray-800",
                            "flex h-8 w-8 flex-col items-center justify-center text-sm shrink-0"
                          )}
                        >
                          {seat.type === "row-label" && (
                            <span>{row.letter}</span>
                          )}
                        </div>
                      );
                    } else {
                      const isBooked = seatIdsSet.has(seat.id);

                      return (
                        <div key={index}>
                          <input
                            type="checkbox"
                            name="seat"
                            id={seat.id}
                            value={seat.id}
                            className="peer absolute h-0 w-0 opacity-0"
                          />
                          <label
                            htmlFor={seat.id}
                            className={classNames(
                              "flex h-8 w-8 shrink-0 flex-col items-center justify-center text-sm",
                              "peer-checked:border-4 border-green-400 peer-focus:ring-2",
                              (seat.isSecurity || isBooked) && "bg-red-500",
                              !seat.isSecurity && "bg-green-700",
                              seat.hasRestrictedView &&
                                "border-2 border-orange-300",
                              seat.isWheelchairAccessible &&
                                "border-2 border-blue-900"
                            )}
                          >
                            <span className="leading-3">{seat.num}</span>
                            <span className="text-xs leading-3">
                              {seat.isBis && "bis"}
                            </span>
                          </label>
                        </div>
                      );
                    }
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="submit" className="btn-primary btn">
          Réserver
        </button>
      </Form>
    </div>
  );
};
