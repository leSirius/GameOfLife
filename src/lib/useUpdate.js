import {useEffect, useRef} from "react";
import {deepCopy, paintGrid} from "@/lib/sharedFuncs";

// do not set state in requestAnimationFrame function, costly.

export default function useUpdate(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize) {
  const animateId = useRef(0);
  const lastColor = useRef(liveColor);
  const updatedMap = useRef(deepCopy(gameMap));
  const lastState = useRef(start);

  useEffect(() => {
    if (lastState.current && !start) { setGameMap(deepCopy(updatedMap.current)); }
    if (!lastState.current && start) { updatedMap.current = deepCopy(gameMap); }
    lastState.current = start;

    const ctx = canvasRef.current.getContext('2d');
    let lastUpdate;
    if (start) {
      animateId.current = requestAnimationFrame(
        (current)=> { update(current, ctx, updatedMap.current, gridSize); }
      );
    }

    function update(current, ctx, tempMap, gridSize) {
      lastUpdate = lastUpdate||current;
      let newMap;
      if (current-lastUpdate>interval) {
        lastUpdate = current;
        newMap = merge(ctx, tempMap, gridSize, liveColor, lastColor);
        updatedMap.current = deepCopy(newMap);
      }
      animateId.current = requestAnimationFrame(
        (current)=>{ update(current, ctx, newMap||tempMap, gridSize); }
      );
    }
    return ()=> {
      cancelAnimationFrame(animateId.current);
    }
  }, [start, liveColor, interval]);

}
/*
function merge(ctx, tempMap, gridSize, liveColor, lastColor){
  ctx.save();
  ctx.fillStyle = liveColor;
  //let hasDif = false;
  const size = tempMap.length;
  const data = emptyArray(size);
  for (let i=0; i<size; i++) {
    for (let j=0; j<size; j++) {
      if (tempMap[i][j]!==0) {
        setDataAround(data, i, j);
      }
      if (i>0 && j>0){
        calAndPaint(ctx, i-1, j-1, data, tempMap, gridSize,  lastColor, liveColor);
      }
    }
  }
  for (let i=0; i<size; i++){
    calAndPaint(ctx, i, size-1, data, tempMap, gridSize,  lastColor, liveColor);
  }
  for (let j=0; j<size-1; j++){
    calAndPaint(ctx, size-1, j, data, tempMap, gridSize,  lastColor, liveColor);
  }

  ctx.restore();
  lastColor.current = liveColor;
  return data;
}

function calAndPaint(ctx, r, c, data, tempMap, gridSize,  lastColor, liveColor) {
  const size = tempMap.length;
  data[r][c] = getRules(data[r][c], tempMap[r][c]);
  if (data[r][c]!==tempMap[r][c]) {
    data[r][c]===0?
      paintGrid(ctx, r, c, gridSize, size, size, true):
      paintGrid(ctx, r, c, gridSize, size, size, false);
  }
  else if(data[r][c]!==0 && lastColor.current!==liveColor){
    console.log('got it')
    paintGrid(ctx, r, c, gridSize, size, size, false);
  }
}

 */


// 1. Any live cell with fewer than two live neighbors dies, as if by underpopulation. numOfNeigh<2, prevState!=0 => 0
// 2. Any live cell with two or three live neighbors lives on to the next generation.   2<=numOfNeigh<=3, prevState!=0 => 1
// 3. Any live cell with more than three live neighbors dies, as if by overpopulation.  numOfNeigh>3, prevState!=0 => 0
// 4. Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction. numOfNeigh=3, prevState=0=>1
function getRules(numOfNeigh, prevState) {
  switch (true) {
    case (numOfNeigh<2):{
      return 0;
    }
    case (numOfNeigh===2): {
      return prevState;
    }
    case (numOfNeigh===3): {
      return 1;
    }
    case (numOfNeigh>3): {
      return 0;
    }
  }
}

function getRules2(numOfNeigh, prevState) {
  switch (true) {
    case (numOfNeigh<2):{
      if (prevState>1) {return 1;}
      return 0;
    }
    case (numOfNeigh===2): {
      return prevState;
    }
    case (numOfNeigh===3): {
      if (prevState>=1) {return 2;}
      return 1;
    }
    case (numOfNeigh===4): {
      if (prevState>1) {return 1;}
      return 0;
    }
    case (numOfNeigh>=5): {
      return 0;
    }
  }
}

function setDataAround(data, r, c, val=1) {
  for (let i=r-1;i<=r+1;i++) {
    for (let j=c-1;j<=c+1;j++) {
      if (i<0||i>=data.length||j<0||j>=data[0].length||(i===r&&j===c)) { continue; }
      data[i][j] += val;
    }
  }
}

function emptyArray(len) {
  const data = new Array(len);
  const initial = new Array(len).fill(0);
  for (let i=0;i<len;i++){
    data[i] = initial.map(val=>val);
  }
  return data;
}


function merge(ctx, tempMap, gridSize, liveColor, lastColor){
  let hasDif = false;
  const size = tempMap.length;
  const data = emptyArray(size);
  for (let i=0;i<size;i++) {
    for (let j=0;j<size;j++) {
      if (tempMap[i][j]!==0) {
        setDataAround(data, i, j);
      }
    }
  }

  ctx.save();
  ctx.fillStyle = liveColor;
  for (let i=0;i<size;i++) {
    for (let j=0;j<size;j++) {
      data[i][j] = getRules(data[i][j], tempMap[i][j]);
      if (data[i][j]!==tempMap[i][j]) {
        data[i][j]===0?
          paintGrid(ctx, i, j, gridSize, size, size, true):
          paintGrid(ctx, i, j, gridSize, size, size, false);
        hasDif = true;
      }
      else if(data[i][j]!==0&&lastColor.current!==liveColor){
        paintGrid(ctx, i, j, gridSize, size, size, false);
      }
    }
  }
  ctx.restore();
  lastColor.current = liveColor;
  if (!hasDif){
    const pressSpace = new KeyboardEvent('keydown', {key:' '});
    document.dispatchEvent(pressSpace);
  }
  return data;
}
/*

        const [r,c] = [i-1,j-1]
        data[r][c] = getRules(data[r][c], tempMap[r][c]);
        if (data[r][c]!==tempMap[r][c]) {
          data[r][c]===0?
            paintGrid(ctx, r, c, gridSize, size, size, true):
            paintGrid(ctx, r, c, gridSize, size, size, false);
          hasDif = true;
        }
        else if(data[r][c]!==0 && lastColor.current!==liveColor){
          paintGrid(ctx, r, c, gridSize, size, size, false);
        }
 */