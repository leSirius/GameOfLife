import {useEffect, useRef} from "react";
import {deepCopy, paintGrid} from "@/lib/sharedFuncs";
import worker, {WorkerBuilder} from "@/lib/thread"
// do not set state in requestAnimationFrame function, costly.

export default function useUpdatePara(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize) {
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

    const worker2 = new WorkerBuilder(worker);
    const worker3 = new WorkerBuilder(worker);
    const worker4 = new WorkerBuilder(worker);
    const cutLine = gameMap.length/2;

    if (start) {
      animateId.current = requestAnimationFrame(
        (current)=> { updateParallel(current, ctx, updatedMap.current, gridSize); }
      );
    }

    function updateParallel(current, ctx, tempMap, gridSize) {
      lastUpdate = lastUpdate||current;
      let newMap;
      if (current-lastUpdate>interval) {
        lastUpdate = current;
        newMap = emptyArray(tempMap.length);
        setWorkerListeners();
        messageToWorkers(tempMap);

        const part1 = tempMap.slice(0, cutLine+1).map(arr=>arr.slice(0, cutLine+1));
        setAtNewMap(newMap, calMatrix(part1), 1);
        for (let i=0;i<cutLine;i++) {
          for (let j=0;j<current;j++){
            paintData(ctx, i, j, 0, 0, part1, tempMap, gridSize,  lastColor, liveColor)
          }
        }
        updatedMap.current = deepCopy(newMap);

        function setWorkerListeners() {
          worker2.onmessage = (e)=>{messageFromWorker(e,2,tempMap,newMap);}
          worker3.onmessage = (e)=>{messageFromWorker(e,3,tempMap,newMap);}
          worker4.onmessage = (e)=>{messageFromWorker(e,4,tempMap,newMap);}
        }

      }
      animateId.current = requestAnimationFrame(
        (current)=>{ updateParallel(current, ctx, newMap||tempMap, gridSize); }
      );
    }

    function messageToWorkers(tempMap) {

      worker2.postMessage(tempMap.slice(0,cutLine+1).map(arr=>arr.slice(cutLine-1)));
      worker3.postMessage(tempMap.slice(cutLine-1).map(arr=>arr.slice(0, cutLine+1)));
      worker4.postMessage(tempMap.slice(cutLine-1).map(arr=>arr.slice(cutLine+1)));
    }

    const ranges = {
      1: [0, cutLine-1, 0, cutLine-1],
      2: [0, cutLine-1, cutLine, gameMap.length-1],
      3: [cutLine, gameMap.length-1, 0, cutLine-1],
      4: [cutLine, gameMap.length-1, cutLine, gameMap.length-1]
    };
    function messageFromWorker(e, ind, tempMap, newMap) {
      const slicedMap = e.data;
      setAtNewMap(newMap, slicedMap, ind);
      for (let i=ind===2?0:1;i<slicedMap.length;i++) {
        for (let j=ind===3?0:1;j<slicedMap.length;j++) {
          paintData(ctx, i, j, Math.min(cutLine-1, ranges[ind][0]), Math.min(cutLine-1, ranges[ind][2]), slicedMap, tempMap, gridSize, lastColor, liveColor);
        }
      }
    }
    function setAtNewMap(newMap, part, ind) {
      for (let i=0;i<part.length-1;i++){
        for (let j=0;j<part[0].length-1;j++){
          newMap[i+ranges[ind][0]][j+ranges[ind][2]] = part[i][j];
        }
      }
    }

    return ()=> {
      cancelAnimationFrame(animateId.current);
    }
  }, [start, liveColor, interval]);

}

function calMatrix(tempMap){
  //let hasDif = false;
  const size = tempMap.length;
  const data = emptyArray(size);
  for (let i=0; i<size; i++) {
    for (let j=0; j<size; j++) {
      if (tempMap[i][j]!==0) {
        setDataAround(data, i, j);
      }
      if (i>0 && j>0){
        data[i-1][j-1] = getRules(data[i-1][j-1], tempMap[i-1][j-1]);
      }
    }
  }
  for (let i=0; i<size; i++){
    data[i][size-1] = getRules(data[i][size-1], tempMap[i][size-1]);
  }
  for (let j=0; j<size-1; j++){
    data[size-1][j] = getRules(data[size-1][j], tempMap[size-1][j]);
  }
  return data;
}


function paintData(ctx, r, c, baseR, baseC, data, tempMap, gridSize,  lastColor, liveColor) {
  const size = tempMap.length;
  if (data[r][c]!==tempMap[r+baseR][c+baseC]) {
    data[r][c]===0?
      paintGrid(ctx, r+baseR, c+baseC, gridSize, size, size, true):
      paintGrid(ctx, r+baseR, c+baseC, gridSize, size, size, false);
  }
  else if(data[r][c]!==0 && lastColor.current!==liveColor){
    paintGrid(ctx, r+baseR, c+baseC, gridSize, size, size, false);
  }
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

