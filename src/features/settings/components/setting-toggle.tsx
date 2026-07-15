import React from "react";

interface SettingToggleProps {
    readonly label: string;
    readonly checked: boolean;
    readonly onToggle: () => void;
}

// A native <button role="switch"> spanning the whole row: the label text gives it its accessible
// name, aria-checked announces on/off, and being a real button it is focusable and responds to
// Enter/Space for free. The whole row stays the click target, as it was when it was a <li onClick>.
// The visual toggle is decorative, so it is aria-hidden.
function SettingToggle({ label, checked, onToggle }: SettingToggleProps) {
    return (
        <li>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                className="setting-toggle"
                onClick={onToggle}
            >
                <span className="setting-label">{label}</span>
                <span className={checked ? "toggler toggled" : "toggler"} aria-hidden="true">
                    <span className="circle" />
                </span>
            </button>
        </li>
    );
}

export default React.memo(SettingToggle);
