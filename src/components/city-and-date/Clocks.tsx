import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import Greeting from "./Greeting";
import { Time } from "../../types/Time";
import { ReduxState } from "../../types/State";

function getCurrentTime(): Time<number> {
    const date: Date = new Date();
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
    };
}

function formatTime(time: Time<number>, showSeconds: boolean): string | never {
    const hours: number = time.hours;
    const minutes: number = time.minutes;
    const seconds: number | undefined = time.seconds;

    const result: Time<number | string> = {
        hours: time.hours,
        minutes: time.minutes,
        seconds: time.seconds
    }

    if (hours === null || hours === undefined) {
        throw new Error("No hours provided to formatTime function");
    }
    if (minutes === null || minutes === undefined) {
        throw new Error("No hours minutes to formatTime function");
    }

    if (hours && +hours < 10) {
        result.hours = "0" + hours;
    }
    if (minutes && +minutes < 10) {
        result.minutes = "0" + minutes;
    }
    if (seconds && +seconds < 10) {
        result.seconds = "0" + seconds;
    }

    if (showSeconds) {
        return `${result.hours}:${result.minutes}:${result.seconds}`;
    } else {
        return `${result.hours}:${result.minutes}`;
    }
}

function Clocks() {
    const [currentTime, setCurrentTime] = useState<string | null>();

    const showSecondsInClocks: boolean = useSelector(
        (state: ReduxState) => state.settings.showSecondsInClocks
    );

    useEffect(() => {
        setTime();
        const timeInterval = setInterval(setTime, 1000);
        return () => clearInterval(timeInterval);
    }, [showSecondsInClocks]);

    const setTime = useCallback(() => {
        const time: Time<number> = getCurrentTime();
        const timeFormatted = formatTime(time, showSecondsInClocks);
        setCurrentTime(timeFormatted);
    }, [])

    return (
        <div className="clocks">
            <Greeting time={getCurrentTime()} />
            <h3 className="time">{currentTime}</h3>
        </div>
    );
}

export default React.memo(Clocks);
