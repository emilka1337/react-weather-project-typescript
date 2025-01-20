import React from "react";
import Clocks from "./Clocks";
import City from "./City";

function CityAndDate() {
    return (
        <div className="city-and-date">
            <City />
            <Clocks />
        </div>
    );
}

export default React.memo(CityAndDate);
