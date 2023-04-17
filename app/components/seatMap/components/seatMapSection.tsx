import classNames from "classnames";
import React from "react";

import { SeatMapSeat } from "~/components/seatMap/components/seatMapSeat";
import type { SeatSection } from "~/models/seatMap";
import { isEmptySpace, sectionTypeToTitle } from "~/models/seatMap";

interface Props {
  section: SeatSection;
  unavailableSeatsIdSet: Set<string>;
}

export const SeatMapSection = React.memo(function SeatMapSection({
  section,
  unavailableSeatsIdSet,
}: Props) {
  return (
    <div key={section.type} className="flex flex-col items-center gap-2">
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
                    {seat.type === "row-label" && <span>{row.letter}</span>}
                  </div>
                );
              } else {
                return (
                  <SeatMapSeat
                    key={index}
                    seat={seat}
                    unavailableSeatsIdSet={unavailableSeatsIdSet}
                  />
                );
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
