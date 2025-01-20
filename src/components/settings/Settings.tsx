import React, { useState } from "react";
import SettingsMenuToggler from "./SettingsMenuToggler";
import SettingsMenu from "./SettingsMenu";

function Settings() {
    let [showSettings, setShowSetting] = useState<boolean>(false);

    return (
        <>
            <SettingsMenuToggler showSettings={showSettings} setShowSettings={setShowSetting} />
            <SettingsMenu showSettings={showSettings}/>
        </>
    );
}

export default React.memo(Settings);
