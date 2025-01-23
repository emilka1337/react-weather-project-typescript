import { useSelector } from "react-redux";
import { ReduxState } from "../../types/State";

interface TemperatureContainerProps {
    readonly temperature: number;
    readonly main: string;
}

function TemperatureContainer({ temperature, main }: TemperatureContainerProps) {
    const temperatureInF: boolean = useSelector((state: ReduxState) => state.settings.temperatureInF);

    return (
        <div className="temperature-container">
            <h3 className="temperature">
                {temperatureInF === false ? temperature.toFixed(0) : (temperature * (9 / 5) + 32).toFixed(0)}
                <span className="degree">°</span>
            </h3>
            <h3 className="main">{main}</h3>
        </div>
    );
}

export default TemperatureContainer;
