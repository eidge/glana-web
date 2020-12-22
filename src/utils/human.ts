import { Duration, hours, minutes } from "glana/src/units/duration";
import Quantity from "glana/src/units/quantity";

export function durationToHuman(duration: Quantity<Duration>) {
  let result = "";

  const durationInHours = duration.convertTo(hours);
  if (durationInHours.greaterThan(hours(0))) {
    result += `${Math.floor(durationInHours.value)}h`;
  }

  const remainingMinutes = hours(durationInHours.value % 1).convertTo(minutes);

  if (remainingMinutes.equalOrGreaterThan(minutes(9.5))) {
    result += `${Math.round(remainingMinutes.value)}m`;
  } else {
    result += `0${Math.round(remainingMinutes.value)}m`;
  }

  return result;
}
