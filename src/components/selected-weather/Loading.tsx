import { useSelector } from "react-redux";
import { ReduxState } from "../../types/State";

function Loading() {
    const loadingAnimation = useSelector((state: ReduxState) => state.settings.loadingAnimation);

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
