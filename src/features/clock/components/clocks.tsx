import React, { useEffect, useState } from "react";

import Greeting from "@/features/clock/components/greeting";
import { useSettingsStore } from "@/stores/settings-store";
import { formatTime, getCurrentTime } from "@/utils/format-time";

function Clocks() {
    const [currentTime, setCurrentTime] = useState<string>("");

    const showSecondsInClocks: boolean = useSettingsStore(
        (state) => state.settings.showSecondsInClocks
    );

    useEffect(() => {
        // Defined inside the effect so it closes over the CURRENT setting. It used to be a
        // useCallback with an empty dependency array, so the interval called the very first
        // render's closure forever and toggling "show seconds in clocks" did nothing at all
        // until the page was reloaded.
        const tick = (): void => setCurrentTime(formatTime(getCurrentTime(), showSecondsInClocks));

        tick();
        const timeInterval = setInterval(tick, 1000);

        return () => clearInterval(timeInterval);
    }, [showSecondsInClocks]);

    return (
        <div className="clocks">
            <Greeting time={getCurrentTime()} />
            <h3 className="time">{currentTime}</h3>
        </div>
    );
}

export default React.memo(Clocks);
