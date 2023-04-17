import classNames from "classnames";
import React from "react";

import type { Seat } from "~/models/seatMap";

interface Props {
  seat: Seat;
  unavailableSeatsIdSet: Set<string>;
}

export const SeatMapSeat: React.FC<Props> = ({
  seat,
  unavailableSeatsIdSet,
}) => {
  const isBooked = unavailableSeatsIdSet.has(seat.id);
  const canBeBooked = !seat.isSecurity && !isBooked;

  return (
    <div>
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
          seat.hasRestrictedView && "border-4 border-orange-300",
          seat.isWheelchairAccessible && "border-4 border-blue-300"
        )}
      >
        <span className="leading-3">{seat.num}</span>
        <span className="text-xs leading-3">{seat.isBis && "bis"}</span>
      </label>
    </div>
  );
};
