import Panzoom from "@panzoom/panzoom";
import classNames from "classnames";
import React, { useEffect } from "react";

import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { UnavailableSeat } from "~/utils/seatMap";
import { isEmptySpace, sectionTypeToTitle } from "~/utils/seatMap";

interface SeatMapProps {
  unavailableSeats: UnavailableSeat[];
}

export const SeatMap: React.FC<SeatMapProps> = ({ unavailableSeats }) => {
  const seatIdsSet = new Set(unavailableSeats.map((seat) => seat.seatId));
  const floorPlanRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!floorPlanRef.current) {
      return;
    }

    console.log({
      width: floorPlanRef.current.clientWidth,
      height: floorPlanRef.current.clientHeight,
    });

    const panzoom = Panzoom(floorPlanRef.current, {
      contain: "inside",
      maxZoom: 2,
      minZoom: 0.5,
      overflow: "hidden",
      step: 0.1,
    });

    setTimeout(() => {
      if (!floorPlanRef.current) {
        return;
      }
      if (floorPlanRef.current.parentElement) {
        floorPlanRef.current.parentElement.style.opacity = "1";
      }

      panzoom.pan(
        -floorPlanRef.current.clientWidth / 2,
        -floorPlanRef.current.clientHeight * 1.5,
        {
          animate: false,
        }
      );
      panzoom.setOptions({ contain: undefined });
    }, 0);

    floorPlanRef.current.parentElement?.addEventListener(
      "wheel",
      panzoom.zoomWithWheel
    );
  }, []);

  return (
    <div className="overflow-hidden transition-opacity" style={{ opacity: 0 }}>
      <div
        className="flex w-fit flex-col items-stretch gap-4"
        ref={floorPlanRef}
      >
        {calaisTheatreAllSections.map((section) => (
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
                          {seat.type === "row-label" && (
                            <span>{row.letter}</span>
                          )}
                        </div>
                      );
                    } else {
                      const isBooked = seatIdsSet.has(seat.id);
                      const canBeBooked = !seat.isSecurity && !isBooked;

                      return (
                        <div key={index}>
                          <input
                            type="checkbox"
                            name="seat"
                            id={seat.id}
                            value={seat.id}
                            disabled={seat.isSecurity || isBooked}
                            className="peer absolute h-0 w-0 opacity-0"
                          />
                          <label
                            htmlFor={seat.id}
                            className={classNames(
                              "flex h-8 w-8 shrink-0 flex-col items-center justify-center text-sm",
                              "peer-checked:border-4 peer-checked:border-green-400 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-focus",
                              canBeBooked && "bg-green-700",
                              !canBeBooked && "bg-red-500 opacity-30",
                              seat.hasRestrictedView &&
                                "border-4 border-orange-300",
                              seat.isWheelchairAccessible &&
                                "border-4 border-blue-300"
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

        <div className="flex justify-center">
          <div className="flex items-center justify-center border-2 border-gray-900 bg-gray-800 px-8 py-4">
            Scene
          </div>
        </div>
      </div>
    </div>
  );
};
