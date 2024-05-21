import {useEffect, useRef} from "react";

export default function useInit(canvasRef, start, gameMap, prevMap, gridSize, ratio, {axisColor, liveColor}) {

  useEffect(() => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    canvas.style.width = `${width/ratio}px`;
    canvas.style.height = `${height/ratio}px`;
  }, [ratio]);

  useEffect(()=> {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvasRef.current.getContext('2d');
    drawAxis(ctx, width, height);
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    !start&&initData(ctx);
  }, [gameMap]);

  function drawAxis(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 0.25;
    for (let i=gridSize;i<width;i+=gridSize){
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    for (let i=gridSize;i<width;i+=gridSize){
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
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
        if (gameMap[i][j]!==prevMap[i][j]){
          gameMap[i][j]!==0?
            paintGrid(ctx, i, j, gridSize, w, h, false):
            paintGrid(ctx, i, j, gridSize, w, h, true);
        }
      }
    }
    ctx.restore();
  }
}


export function paintGrid(ctx, i, j, gridSize, w, h, isClear=false) {
  const baseLength = gridSize-2;
  switch (true){
    case (i>0&&i<w-1&&j>0&&j<h-1):{
      isClear?
        ctx.clearRect(j*gridSize+1, i*gridSize+1, baseLength, baseLength):
        ctx.fillRect (j*gridSize+1, i*gridSize+1, baseLength, baseLength);
      break;
    }
    case (i===0&&j===0):{
      isClear?
        ctx.clearRect(j, i, baseLength+1, baseLength+1):
        ctx.fillRect (j, i, baseLength+1, baseLength+1);
      break;
    }
    case (i===0&&j===w-1):{
      isClear?
        ctx.clearRect(j*gridSize+1, i, baseLength+1, baseLength+1):
        ctx.fillRect (j*gridSize+1, i, baseLength+1, baseLength+1);
      break;
    }
    case (i===h-1&&j===0):{
      isClear?
        ctx.clearRect(j, i*gridSize+1, baseLength+1, baseLength+1):
        ctx.fillRect (j, i*gridSize+1, baseLength+1, baseLength+1);
      break;
    }
    case (i===h-1&&j===w-1):{
      isClear?
        ctx.clearRect(j*gridSize+1, i*gridSize+1, baseLength+1, baseLength+1):
        ctx.fillRect (j*gridSize+1, i*gridSize+1, baseLength+1, baseLength+1);
      break;
    }
    case (i===0||i===h-1):{
      isClear?
        ctx.clearRect(j*gridSize+1,i===0?i:i*gridSize+1, baseLength, baseLength+1):
        ctx.fillRect (j*gridSize+1,i===0?i:i*gridSize+1, baseLength, baseLength+1);
      break;
    }
    case (j===0||j===w-1):{
      isClear?
        ctx.clearRect(j===0?j:j*gridSize+1, i*gridSize+1, baseLength+1, baseLength):
        ctx.fillRect (j===0?j:j*gridSize+1, i*gridSize+1, baseLength+1, baseLength);
      break;
    }
    /*
    default:{
      isClear?
        ctx.clearRect(j*gridSize+1, i*gridSize+1, baseLength, baseLength):
        ctx.fillRect (j*gridSize+1, i*gridSize+1, baseLength, baseLength);
    }

     */
  }
}
/*
export function paintGrid(ctx, i, j, gridSize, w, h, isClear=false) {
  switch (true){
    case (i===0&&j===0):{
      isClear?
        ctx.clearRect(j, i, gridSize-1, gridSize-1):
        ctx.fillRect (j, i, gridSize-1, gridSize-1);
      break;
    }
    case (i===0&&j===h-1):{
      isClear?
        ctx.clearRect(j*gridSize+1, i, gridSize-1, gridSize-1):
        ctx.fillRect (j*gridSize+1, i, gridSize-1, gridSize-1);
      break;
    }
    case (i===h-1&&j===0):{
      isClear?
        ctx.clearRect(j, i*gridSize+1, gridSize-1, gridSize-1):
        ctx.fillRect (j, i*gridSize+1, gridSize-1, gridSize-1);
      break;
    }
    case (i===h-1&&j===w-1):{
      isClear?
        ctx.clearRect(j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-1):
        ctx.fillRect (j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-1);
      break;
    }
    case (i===0||i===h-1):{
      isClear?
        ctx.clearRect(j*gridSize+1,i===0?i:i*gridSize+1, gridSize-2, gridSize-1):
        ctx.fillRect (j*gridSize+1,i===0?i:i*gridSize+1, gridSize-2, gridSize-1);
      break;
    }
    case (j===0||j===w-1):{
      isClear?
        ctx.clearRect(j===0?j:j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-2):
        ctx.fillRect (j===0?j:j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-2);
      break;
    }
    default:{
      isClear?
        ctx.clearRect(j*gridSize+1, i*gridSize+1, gridSize-2, gridSize-2):
        ctx.fillRect (j*gridSize+1, i*gridSize+1, gridSize-2, gridSize-2);
    }
  }
}
*/