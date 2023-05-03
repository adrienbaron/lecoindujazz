import classNames from "classnames";
import React from "react";

import { CheckIcon } from "~/components/icons";
import type { Seat } from "~/models/seatMap";

interface Props {
  seat: Seat;
  unavailableSeatsIdSet: Set<string>;
  onSeatToggle: (seat: Seat, isSelected: boolean) => void;
  allowSelectUnavailableSeats?: boolean;
}

export const SeatMapSeat: React.FC<Props> = ({
  seat,
  unavailableSeatsIdSet,
  allowSelectUnavailableSeats,
  onSeatToggle,
}) => {
  const isUnavailable = unavailableSeatsIdSet.has(seat.id);
  const canBeBooked = !seat.isSecurity && !isUnavailable;

  const [isSelected, setIsSelected] = React.useState(false);
  const pointerDownTimeInMsRef = React.useRef<number | null>(null);

  const canBeSelected =
    (!seat.isSecurity && (!isUnavailable || allowSelectUnavailableSeats)) ||
    isSelected;

  return (
    <div>
      <input
        type="checkbox"
        name="seat"
        id={seat.id}
        value={seat.id}
        disabled={!canBeSelected}
        className="peer absolute h-0 w-0 opacity-0"
        onChange={(e) => {
          onSeatToggle(seat, e.target.checked);
          setIsSelected(e.target.checked);
        }}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
      <label
        htmlFor={seat.id}
        className={classNames(
          "flex h-8 w-8 shrink-0 flex-col items-center justify-center text-sm",
          "peer-checked:border-4 peer-checked:border-green-400 peer-checked:shadow-md peer-checked:shadow-green-400 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-focus",
          canBeBooked && !seat.isWheelchairAccessible && "bg-green-700",
          seat.isWheelchairAccessible &&
            canBeBooked &&
            "bg-blue-300 text-black",
          !canBeBooked && "bg-red-500",
          !canBeSelected && "opacity-30",
          seat.hasRestrictedView && "border-4 border-orange-300"
        )}
        onPointerDownCapture={() => {
          pointerDownTimeInMsRef.current = Date.now();
        }}
        onClick={(event) => {
          if (!pointerDownTimeInMsRef.current) {
            return;
          }

          if (Date.now() - pointerDownTimeInMsRef.current > 250) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {!isSelected && (
          <>
            <span className="leading-3">{seat.num}</span>
            <span className="text-xs leading-3">{seat.isBis && "bis"}</span>
          </>
        )}
        {isSelected && <CheckIcon />}
      </label>
    </div>
  );
};
