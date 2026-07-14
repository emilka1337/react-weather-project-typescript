import React from "react";
import Clocks from "@/features/clock/components/clocks";
import City from "@/features/city/components/city";
import SettingsMenuToggler from "@/features/settings/components/settings-menu-toggler";

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
