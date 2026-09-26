import type { Time } from "@/types/time";

interface GreetingProps {
    readonly time: Time<number>;
}

function greetingFor(hours: number): string | undefined {
    if (hours >= 0 && hours < 6) return "Good Night";
    if (hours >= 6 && hours < 12) return "Good Morning";
    if (hours >= 12 && hours < 18) return "Have a nice day";
    if (hours >= 18 && hours <= 23) return "Good Evening";
}

function Greeting({ time }: GreetingProps) {
    return <h3 className="greeting">{greetingFor(time.hours)}</h3>;
}

export default Greeting;
