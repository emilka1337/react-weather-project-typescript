import React, { useMemo } from "react";
import { Time } from "../../types/Time";

interface GreetingProps {
    readonly time: Time<number>;
}

function Greeting({ time }: GreetingProps) {
    const greeting: string | undefined = useMemo(() => {
        if (time.hours >= 0 && time.hours < 6) {
            return "Good Night";
        } else if (time.hours >= 6 && time.hours < 12) {
            return "Good Morning";
        } else if (time.hours >= 12 && time.hours < 18) {
            return "Have a nice day";
        } else if (time.hours >= 18 && time.hours <= 23) {
            return "Good Evening";
        }
    }, [time.hours]);

    return <h3 className="greeting">{greeting}</h3>;
}

export default React.memo(Greeting);
