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
    ctx.save();
    ctx.fillStyle = liveColor;
    let lastUpdate;

    if (start) {
      const liveList = [];
      for (let i=0;i<updatedMap.current.length;i++) {
        for (let j=0;j<updatedMap.current[0].length;j++) {
          if (updatedMap.current[i][j]!==0) {liveList.push([i,j])}
        }
      }
      animateId.current = requestAnimationFrame(
        (current)=> { update(current, ctx, updatedMap.current, gridSize, liveList); }
      );
    }

    function update(current, ctx, tempMap, gridSize, liveList) {
      lastUpdate = lastUpdate||current;
      let newMap;
      if (current-lastUpdate>interval) {
        lastUpdate = current;
        [newMap, liveList] = calPaintMap(ctx, tempMap, gridSize, liveColor, lastColor, liveList);
        updatedMap.current = newMap;
        //new Promise(resolve => {}).then(()=>{updatedMap.current = deepCopy(newMap)})
      }
      animateId.current = requestAnimationFrame(
        (current)=>{ update(current, ctx, newMap||tempMap, gridSize, liveList); }
      );
    }

    return ()=> {
      ctx.restore();
      cancelAnimationFrame(animateId.current);
    }
  }, [start, liveColor, interval]);
}

function calPaintMap(ctx, tempMap, gridSize, liveColor, lastColor, liveList){
  // console.time('calculation')
  let hasDif = false;
  const size = tempMap.length;
  const data = emptyArray(size);
  const newLiveList = [];
  const hasNeighbour = new Map();

  for (let i=0;i<liveList.length;i++) {
    setNeighbourAround(hasNeighbour, liveList[i][0], liveList[i][1], tempMap.length);
  }
  // console.timeEnd('calculation')
  // console.time('paint')
  for (const [k,v] of hasNeighbour) {
    if (2<=v && v<=3) {
      const [i,j] = deKey(k);
      data[i][j] = getRules(v,tempMap[i][j]);
      if (data[i][j]!==0) {newLiveList.push([i,j]);}
      if (data[i][j]!==tempMap[i][j]) {
        data[i][j]===0?
          paintGrid(ctx, i, j, gridSize, size, size, true):
          paintGrid(ctx, i, j, gridSize, size, size, false);
        hasDif = true;
      }
      else if(data[i][j]!==0 && lastColor.current!==liveColor){
        paintGrid(ctx, i, j, gridSize, size, size, false);
      }
    }
  }
  for (const axis of liveList) {
    const key = enKey(axis[0], axis[1]);
    if (!hasNeighbour.get(key)||hasNeighbour.get(key)<2||hasNeighbour.get(key)>3) {
      paintGrid(ctx, axis[0], axis[1], gridSize, size, size, true);
    }
  }

  lastColor.current = liveColor;
  if (!hasDif){
    const pressSpace = new KeyboardEvent('keydown', {key:' '});
    document.dispatchEvent(pressSpace);
  }
  //console.timeEnd('paint')
  return [data, newLiveList];
}

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

function enKey(i,j) {
  return i.toString()+','+j.toString();
}
function deKey(key) {
  const axis = key.split(',');
  return [Number(axis[0]), Number(axis[1])];
}

function setNeighbourAround(hasNeighbour, r, c, len) {
  for (let i=r-1;i<=r+1;i++) {
    for (let j=c-1;j<=c+1;j++) {
      if (i>=0&&i<len&&j>=0&&j<len&&!(i===r&&j===c)) {
        const key = enKey(i,j);
        const temp = hasNeighbour.get(key)||0;
        hasNeighbour.set(key, temp+1);
      }
    }
  }
}

function emptyArray(len) {
  return new Array(len).fill(0).map(() => new Array(len).fill(0));
}

/*
function setDataAround(data, r, c, val=1) {
  for (let i=r-1;i<=r+1;i++) {
    for (let j=c-1;j<=c+1;j++) {
      if (i<0||i>=data.length||j<0||j>=data[0].length||(i===r&&j===c)) { continue; }
      data[i][j] += val;
    }
  }
}

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

    paintGrid(ctx, r, c, gridSize, size, size, false);
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

  /*
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

   */
