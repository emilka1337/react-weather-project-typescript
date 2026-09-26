import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SettingToggle from "@/features/settings/components/setting-toggle";

describe("SettingToggle", () => {
    it("is a switch, named by its label, reflecting checked through aria-checked", () => {
        render(<SettingToggle label="Dark mode" checked onToggle={vi.fn<() => void>()} />);

        const toggle = screen.getByRole("switch", { name: "Dark mode" });
        expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("reports unchecked", () => {
        render(<SettingToggle label="Dark mode" checked={false} onToggle={vi.fn<() => void>()} />);

        expect(screen.getByRole("switch", { name: "Dark mode" })).toHaveAttribute("aria-checked", "false");
    });

    it("fires onToggle when clicked", async () => {
        const onToggle = vi.fn<() => void>();
        const user = userEvent.setup();
        render(<SettingToggle label="Dark mode" checked={false} onToggle={onToggle} />);

        await user.click(screen.getByRole("switch"));

        expect(onToggle).toHaveBeenCalledOnce();
    });

    it.each(["{Enter}", " "])("fires onToggle from the keyboard with %s", async (key) => {
        const onToggle = vi.fn<() => void>();
        const user = userEvent.setup();
        render(<SettingToggle label="Dark mode" checked={false} onToggle={onToggle} />);

        screen.getByRole("switch").focus();
        await user.keyboard(key);

        expect(onToggle).toHaveBeenCalledOnce();
    });

    it("is controlled: a re-render with new props updates the state and the handler", async () => {
        const first = vi.fn<() => void>();
        const second = vi.fn<() => void>();
        const user = userEvent.setup();
        const { rerender, container } = render(
            <SettingToggle label="Dark mode" checked={false} onToggle={first} />,
        );

        rerender(<SettingToggle label="Dark theme" checked onToggle={second} />);
        await user.click(screen.getByRole("switch", { name: "Dark theme" }));

        expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
        expect(container.querySelector(".toggler")).toHaveClass("toggled");
        expect(second).toHaveBeenCalledOnce();
        expect(first).not.toHaveBeenCalled();
    });
});
