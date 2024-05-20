import {useEffect} from "react";

export default function useAxis(canvasRef, gameMap, gridSize, width, height) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawAxis();
    initCanvas(ctx, gameMap, gridSize);

    function drawAxis() {
      ctx.save();
      ctx.strokeStyle = '#aaaaaa';
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

    function initCanvas() {
      ctx.save();
      ctx.fillStyle = '#779977';
      const h = gameMap.length, w = gameMap[0].length;
      for (let i=0;i<h;i++){
        for (let j=0;j<w;j++){
          if (gameMap[i][j]!==0) {
            paintGrid(ctx, i, j, gridSize, w, h);
          }
        }
      }
      ctx.restore();
    }
  }, []);
}


function paintGrid(context, i, j, gridSize, w, h) {
  switch (true) {
    case (i===0&&j===0):{
      context.fillRect(j, i, gridSize-1, gridSize-1);
      break;
    }
    case (i===0&&j===h-1):{
      context.fillRect(j*gridSize+1, i, gridSize-1, gridSize-1);
      break;
    }
    case (i===h-1&&j===0):{
      context.fillRect(j, i*gridSize+1, gridSize-1, gridSize-1);
      break;
    }
    case (i===h-1&&j===w-1):{
      context.fillRect(j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-1);
      break;
    }
    case (i===0||i===h-1):{
      context.fillRect(j*gridSize+1,i===0?i:i*gridSize+1, gridSize-2, gridSize-1);
      break;
    }
    case (j===0||j===w-1):{
      context.fillRect(j===0?j:j*gridSize+1, i*gridSize+1, gridSize-1, gridSize-2);
      break;
    }
    default: {
      context.fillRect(j*gridSize+1, i*gridSize+1, gridSize-2, gridSize-2);
    }
  }
}
