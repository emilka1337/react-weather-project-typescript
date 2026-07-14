import { useSettingsStore } from "../../store/settingsStore";

function Loading() {
    const loadingAnimation = useSettingsStore((state) => state.settings.loadingAnimation);

    return (
        <div className="loading">
            <div className="loader">
                {loadingAnimation ? (
                    <>
                        <div className="circle"></div>
                        <div className="circle"></div>
                    </>
                ) : (
                    <h2>Loading...</h2>
                )}
            </div>
        </div>
    );
}

export default Loading;
