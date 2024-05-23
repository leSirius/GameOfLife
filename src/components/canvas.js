'use client'

import {useRef} from "react";
import useInit from "@/lib/useInit";
import useUpdate from "@/lib/useUpdate";

export default function Canvas({gameMap, prevMap, start, setGameMap, ratio, gridSize, interval, liveColor, axisColor}) {
  const canvasRef = useRef(null);

  const size = gameMap.length*gridSize;
  useInit(canvasRef, start, gameMap, prevMap, gridSize, ratio, {axisColor, liveColor});
  useUpdate(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize);

  return(
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className='bg-black w-full'
        style={{width:`${(size/ratio).toFixed(2)}px`,height:`${(size/ratio).toFixed(2)}px`}}
      >
      </canvas>

    )

}

// merge calMapState and rePaint to save one iteration.

/*
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

 */

/*
function getDataAt(dataMap, i, j){
  if (i<0||i>=dataMap.length||j<0||j>=dataMap[0].length) {
    return void 0;
  }
  return dataMap[i][j];
}
function calMapState(tempMap) {
  const size = tempMap.length
  const data = emptyArray(size);
  for (let i=0;i<size;i++) {
    for (let j=0;j<size;j++) {
      if (tempMap[i][j]!==0) {
        setDataAround(data, i, j);
      }
    }
  }
  for (let i=0;i<size;i++) {
    for (let j=0;j<size;j++) {
      data[i][j] = getRules(data[i][j], tempMap[i][j]);
    }
  }
  return data;
}

function rePaintMap(ctx, newMap, tempMap, gridSize) {
  const len = newMap.length;
  ctx.save();
  ctx.fillStyle = liveColor;
  for (let i=0;i<len;i++) {
    for (let j=0;j<len;j++) {
      if (newMap[i][j]!==tempMap[i][j]) {
        paintGrid(ctx, i, j, gridSize, len, len, true);
        newMap[i][j]!==0&&paintGrid(ctx, i, j, gridSize, len, len, false);
      }
    }
  }
  ctx.restore();
}
 */