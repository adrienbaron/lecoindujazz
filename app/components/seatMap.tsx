import classNames from "classnames";
import React from "react";

import {
  firstGallerySection,
  orchestraSection,
  secondGallerySection,
  thirdGallerySection,
} from "~/models/calaisTheatreSeatingPlan";
import { isEmptySpace } from "~/utils/seatMap";

export const SeatMap: React.FC = () => {
  const sections = [
    thirdGallerySection,
    secondGallerySection,
    firstGallerySection,
    orchestraSection,
  ];

  return (
    <div className="flex overflow-scroll">
      <div className="flex w-full flex-col items-center">
        <h1>Seat Map</h1>
        {sections.map((section) => (
          <div key={section.name} className="m-auto">
            <h2>{section.name}</h2>
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
                      return (
                        <div
                          key={index}
                          className={classNames(
                            "flex h-8 w-8 shrink-0 flex-col items-center justify-center text-sm",
                            seat.isSecurity && "bg-red-500",
                            seat.hasRestrictedView && "bg-orange-300",
                            seat.isWheelchairAccessible && "bg-blue-900"
                          )}
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
        ))}
      </div>
    </div>
  );
};
