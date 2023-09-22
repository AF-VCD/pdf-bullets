import { useRef, useState, useEffect } from "react";
import { optimize, renderBulletText } from "./utils";
import { STATUS } from "../../const/const";

function Bullet({
  text = "",
  widthPx = 500,
  enableOptim = false,
  height,
  onHighlight,
}) {
  const canvasRef = useRef(null);
  const [outputTextLines, setOutputTextLines] = useState(() => [" "]);

  const [color, setColor] = useState("inherit");
  const [loading, setLoading] = useState(false);
  const [optimStatus, setOptimStatus] = useState(STATUS.NOT_OPT);
  const [rendering, setBulletRendering] = useState({ textLines: [""] });
  const widthPxAdjusted = widthPx < 75 ? 75 : widthPx + 0.55;

  function getTextWidth(txt, canvas) {
    const context = canvas.getContext("2d");
    context.font = "12pt Times New Roman";
    context.textAlign = "left";
    return context.measureText(txt).width;
  }

  // This effect updates the text rendering (i.e. enforces width constraints by inserting newlines)
  //   whenever the props text input is updated.
  useEffect(() => {
    setBulletRendering(
      renderBulletText(
        text,
        (txt) => getTextWidth(txt, canvasRef.current),
        widthPxAdjusted
      )
    );
  }, [text, widthPxAdjusted, enableOptim]);
  // [] indicates that this happens once after the component mounts.
  // [text] indicates that this happens every time the text changes from the user (from props)

  // This effect happens after bullet rendering changes. It evaluates the rendered bullet and
  //  sees how it can be improved with modified spaces.
  useEffect(() => {
    setLoading(true);
    setOutputTextLines(rendering.textLines);
    if (enableOptim) {
      const optimizer = (txt) =>
        renderBulletText(
          txt,
          (txt) => getTextWidth(txt, canvasRef.current),
          widthPxAdjusted
        );
      const optimResults = optimize(text, optimizer);
      setLoading(false);
      setOptimStatus(optimResults.status);
      setOutputTextLines(optimResults.rendering.textLines);
    } else {
      if (rendering.overflow < STATUS.MAX_UNDERFLOW || rendering.overflow > 0) {
        setOptimStatus(STATUS.FAILED_OPT);
      } else {
        setOptimStatus(STATUS.OPTIMIZED);
      }
      setOutputTextLines(rendering.textLines);
      setLoading(false);
    }
  }, [rendering, enableOptim, text, widthPxAdjusted]);

  //color effect
  useEffect(() => {
    if (loading) {
      setColor("silver");
    } else if (optimStatus === STATUS.FAILED_OPT) {
      setColor("red");
    } else {
      setColor("black");
    }
  }, [loading, outputTextLines, optimStatus]);

  // the style properties help lock the canvas in the same spot and make it essentially invisible.
  //whitespace: pre-wrap is essential as it allows javascript string line breaks to appear properly.
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          visibility: "hidden",
          position: "absolute",
          top: "-1000px",
          left: "-1000px",
        }}
      />
      <div
        style={{
          minHeight: height,
          color: color,
          display: "flex",
          flexDirection: "column",
        }}
        onMouseUp={onHighlight}
      >
        {outputTextLines.map((line) => {
          return (
            <span key={line} style={{ whiteSpace: "pre" }}>
              {line}
            </span>
          );
        })}
      </div>
    </>
  );
  //return canvas;
}

export default Bullet;
