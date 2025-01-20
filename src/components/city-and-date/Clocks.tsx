import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Greeting from "./Greeting";
import { Time } from "../../types/Time";

function getCurrentTime(): Time {
    const date: Date = new Date();
    return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
    };
}

function formatTime(time: Time, showSeconds: boolean): string {
    let hours = time.hours;
    let minutes = time.minutes;
    let seconds = time.seconds;

    if (hours && +hours < 10) {
        hours = "0" + hours;
    }
    if (minutes && +minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds && +seconds < 10) {
        seconds = "0" + seconds;
    }

    if (showSeconds) {
        return `${hours}:${minutes}:${seconds}`;
    } else {
        return `${hours}:${minutes}`;
    }
}

function Clocks() {
    const [currentTime, setCurrentTime] = useState<string | null>();

    const showSecondsInClocks = useSelector((state) => state.settings.showSecondsInClocks);

    useEffect(() => {
        setTime();
        const timeInterval = setInterval(setTime, 1000);
        return () => clearInterval(timeInterval);
    }, [showSecondsInClocks]);

    const setTime = () => {
        const time: Time = getCurrentTime();
        const timeFormatted = formatTime(time, showSecondsInClocks);
        setCurrentTime(timeFormatted);
    };

    return (
        <div className="clocks">
            <Greeting time={getCurrentTime()} />
            <h3 className="time">{currentTime}</h3>
        </div>
    );
}

export default React.memo(Clocks);
