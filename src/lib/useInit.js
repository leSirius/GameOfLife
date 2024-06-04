import {useEffect, useRef} from "react";
import {paintGrid} from "@/lib/sharedFuncs";

const lineWidth = 1;
export default function useInit(canvasRef, start, gameMap, prevMap, gridSize, ratio, {axisColor, liveColor}) {
  const prevWidth = useRef(-1);

  useEffect(()=> {
    const canvas = canvasRef.current;
    const ctx = canvasRef.current.getContext('2d');
    const width = canvas.width, height = canvas.height;
    if (prevWidth.current===-1) {(prevWidth.current=width)}
    drawAxis(ctx, width, height);
  }, [axisColor]);

// it seems that the change of the width or height attribute of canvas will delete all painted pixels previously,
// so drawAxis is called when size of gameMap changes

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (prevWidth.current!==canvasRef.current.width) {
      const canvas = canvasRef.current;
      const width = canvas.width, height = canvas.height;
      canvas.style.width = `${width/ratio}px`;
      canvas.style.height = `${height/ratio}px`;
      drawAxis(ctx, width, height);
      prevWidth.current = canvasRef.current.width;
    }
    initData(ctx);
  }, [prevMap, gridSize]);

  function drawAxis(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = lineWidth;
    for (let i=gridSize;i<width;i+=gridSize){
      ctx.beginPath();
      ctx.moveTo(0, i-0.5);
      ctx.lineTo(width, i-0.5);
      ctx.stroke();
    }
    for (let i=gridSize;i<width;i+=gridSize){
      ctx.beginPath();
      ctx.moveTo(i-0.5, 0);
      ctx.lineTo(i-0.5, height);
      ctx.stroke();
    }
    ctx.restore();
  }

  function initData(ctx) {
    ctx.save();
    ctx.fillStyle = liveColor;
    const h = gameMap.length, w = gameMap[0].length;
    for (let i=0;i<h;i++){
      for (let j=0;j<w;j++){
        if (prevMap[i][j]!==void 0&&gameMap[i][j]!==prevMap[i][j]){
          gameMap[i][j]!==0?
            paintGrid(ctx, i, j, gridSize, w, h, false):
            paintGrid(ctx, i, j, gridSize, w, h, true);
        }
      }
    }
    ctx.restore();
  }
}

/*
useEffect(() => {
  const canvas = canvasRef.current;
  const width = canvas.width, height = canvas.height;
  canvas.style.width = `${width/ratio}px`;
  canvas.style.height = `${height/ratio}px`;
  console.log(canvas.style.width)
}, [ratio]);
 */