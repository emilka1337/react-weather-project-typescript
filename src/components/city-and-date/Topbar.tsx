import React from "react";
import Clocks from "./Clocks";
import City from "./City";
import SettingsMenuToggler from "../settings/SettingsMenuToggler";

function Topbar() {
    return (
        <div className="topbar">
            <City />
            <div className="topbar-right">
                <Clocks />
                <SettingsMenuToggler />
            </div>
        </div>
    );
}

export default React.memo(Topbar);
