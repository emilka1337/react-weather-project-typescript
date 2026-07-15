import { Time } from "@/types/time";

// Zero-pads, which the clock's own version failed to do: it tested `if (hours && +hours < 10)`,
// and 0 is falsy, so midnight rendered as "0:05" instead of "00:05".
const pad = (value: number): string => String(value).padStart(2, "0");

export function formatTime(time: Time<number>, showSeconds = false): string {
    const formatted = `${pad(time.hours)}:${pad(time.minutes)}`;

    if (!showSeconds) return formatted;

    return `${formatted}:${pad(time.seconds ?? 0)}`;
}

export function getCurrentTime(): Time<number> {
    const date = new Date();

    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
    };
}
