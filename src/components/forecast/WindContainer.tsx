import { useSelector } from "react-redux";
import { ReduxState } from "../../types/State";

interface WindContainerProps {
    readonly speed: number;
    readonly degree: number;
}

function defineWindArrowScale(speed: number): number | undefined {
    if (speed <= 4) {
        return 0.5;
    } else if (speed > 4 && speed < 8) {
        return speed / 8;
    } else if (speed >= 8) {
        return 1.2;
    }
}

function WindContainer({ speed, degree }: WindContainerProps) {
    const speedUnitInMS: boolean = useSelector((state: ReduxState) => state.settings.speedUnitInMS);

    return (
        <div className="wind-container">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="wind"
                viewBox="0 0 16 16"
                style={{
                    transform: `rotate(${degree}deg) scale(${defineWindArrowScale(speed)})`,
                }}
            >
                <path
                    fillRule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"
                />
            </svg>
            <h3 className="wind-speed">
                {speedUnitInMS == false ? (speed * 3.6).toFixed() + " km/h" : speed.toFixed(1) + "m/s"}
            </h3>
        </div>
    );
}

export default WindContainer;
