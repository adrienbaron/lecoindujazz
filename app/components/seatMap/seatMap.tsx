import Panzoom from "@panzoom/panzoom";
import React, { useEffect, useMemo } from "react";

import { SeatMapSection } from "~/components/seatMap/components/seatMapSection";
import { calaisTheatreAllSections } from "~/models/calaisTheatreSeatingPlan";
import type { Seat, UnavailableSeat } from "~/models/seatMap";

interface SeatMapProps {
  unavailableSeats: UnavailableSeat[];
  onSeatToggle: (seat: Seat, isSelected: boolean) => void;
  allowSelectUnavailableSeats?: boolean;
  keyRef?: React.MutableRefObject<number | null>;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  unavailableSeats,
  onSeatToggle,
  allowSelectUnavailableSeats,
  keyRef,
}) => {
  const unavailableSeatsIdSet = useMemo(
    () => new Set(unavailableSeats.map((seat) => seat.seatId)),
    [unavailableSeats]
  );
  const floorPlanRef = React.useRef<HTMLDivElement>(null);
  const pointerDownTimeInMsRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (!floorPlanRef.current) {
      return;
    }

    const panzoom = Panzoom(floorPlanRef.current, {
      contain: "inside",
      minScale: 0.2,
      maxScale: 2,
      overflow: "hidden",
      step: "ontouchstart" in window ? 0.15 : 0.1,
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
        -floorPlanRef.current.clientHeight *
          ("ontouchstart" in window ? 2 : 0.5),
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

    const currentFloorPlanRef = floorPlanRef.current;
    return () => {
      panzoom.destroy();
      currentFloorPlanRef.parentElement?.removeEventListener(
        "wheel",
        panzoom.zoomWithWheel
      );
    };
  }, []);

  return (
    <div
      className="max-h-[90vh] overflow-hidden transition-opacity"
      style={{ opacity: 0 }}
    >
      <div
        className="flex w-fit flex-col items-stretch gap-8"
        ref={floorPlanRef}
        onPointerDownCapture={() => {
          pointerDownTimeInMsRef.current = Date.now();
        }}
      >
        {calaisTheatreAllSections.map((section) => (
          <SeatMapSection
            key={`${section.type}${keyRef?.current ?? ""}`}
            section={section}
            unavailableSeatsIdSet={unavailableSeatsIdSet}
            onSeatToggle={onSeatToggle}
            allowSelectUnavailableSeats={allowSelectUnavailableSeats}
            pointerDownTimeInMsRef={pointerDownTimeInMsRef}
          />
        ))}

        <div className="flex justify-center">
          <div className="flex w-1/3 items-center justify-center border-4 border-gray-600 bg-gray-800 py-6 font-medium text-gray-300 fluid-xl">
            Scène
          </div>
        </div>
      </div>
    </div>
  );
};
