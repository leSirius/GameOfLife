import {useEffect} from "react";

const axisColor = '#999999';
export const liveColor = 'rgb(120,150,120)'
//export const civilColor = 'rgb(100,100,210)'
export default function useInit(canvasRef, gameMap, gridSize, width, height) {
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    drawAxis();

    function drawAxis() {
      ctx.save();
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
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

  }, []);
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    initData(ctx, gameMap, gridSize);
    function initData() {
      ctx.save();
      ctx.fillStyle = liveColor;
      const h = gameMap.length, w = gameMap[0].length;
      for (let i=0;i<h;i++){
        for (let j=0;j<w;j++){
          gameMap[i][j]===0?
            paintGrid(ctx, i, j, gridSize, w, h, true):
            paintGrid(ctx, i, j, gridSize, w, h);
        }
      }
      ctx.restore();
    }
  }, [gameMap]);
}

function paintGrid(ctx, i, j, gridSize, w, h, isClear=false) {
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
