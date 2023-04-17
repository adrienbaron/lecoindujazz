import Panzoom from "@panzoom/panzoom";
import React, { useEffect, useMemo } from "react";

import { SeatMapSection } from "~/components/seatMap/components/seatMapSection";
import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { UnavailableSeat } from "~/models/seatMap";

interface SeatMapProps {
  unavailableSeats: UnavailableSeat[];
}

export const SeatMap: React.FC<SeatMapProps> = ({ unavailableSeats }) => {
  const unavailableSeatsIdSet = useMemo(
    () => new Set(unavailableSeats.map((seat) => seat.seatId)),
    [unavailableSeats]
  );
  const floorPlanRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!floorPlanRef.current) {
      return;
    }

    const panzoom = Panzoom(floorPlanRef.current, {
      contain: "inside",
      minScale: 0.2,
      maxScale: 1.5,
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
          <SeatMapSection
            key={section.type}
            section={section}
            unavailableSeatsIdSet={unavailableSeatsIdSet}
          />
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
