
import { useState } from "react";
import BulletApp from "./BulletApp";

export default function TopBulletApp() {
    const [enableHighlight, setEnableHighlight] = useState(false);
    function handleEnableHighlight() {
        setEnableHighlight(!enableHighlight);
        console.log("enableHighlight state changed")
    }
    return <BulletApp enableHighlight={enableHighlight} onHighlightChange={handleEnableHighlight}/>
}