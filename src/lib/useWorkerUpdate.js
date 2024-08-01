import {useEffect, useRef} from "react";
import {deepCopy, paintGrid} from "@/lib/sharedFuncs";
import thread from "@/lib/thread"


export default function useWorkerUpdate(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize) {
  const animateId = useRef(0);
  const lastColor = useRef(liveColor);
  const updatedMap = useRef(deepCopy(gameMap));
  const lastState = useRef(start);

  useEffect(() => {
    if (lastState.current && !start) { setGameMap(deepCopy(updatedMap.current)); }
    if (!lastState.current && start) { updatedMap.current = deepCopy(gameMap); }
    lastState.current = start;
    const ctx = canvasRef.current.getContext('2d');

    ctx.fillStyle = liveColor
    let lastUpdate;
    const worker = fork(thread);
    const cutLine = gameMap.length/2;

    if (start) {
      animateId.current = requestAnimationFrame(
        (current)=> { updateWorker(current, ctx, updatedMap.current, gridSize); }
      );
    }

    function updateWorker(current, ctx, tempMap, gridSize) {

      lastUpdate = lastUpdate||current;
      let newMap;
      if (current-lastUpdate>interval) {
        lastUpdate = current;
        newMap = emptyArray(tempMap.length);
        const [part1, part2] = sliceOverlap(tempMap, cutLine);

        worker.sendData(part2);

        worker.receiveData((e)=>{

          setAtNewMap(newMap, e.data, cutLine);
          paintAll(ctx, newMap, tempMap, gridSize,  lastColor, liveColor)
          // handleResult(ctx, e.data, tempMap, cutLine, gridSize,  lastColor, liveColor, newMap);
          updatedMap.current = deepCopy(newMap);

        });

        // handleResult(ctx, calMatrix(part1), tempMap, 0, gridSize,  lastColor, liveColor, newMap);
        setAtNewMap(newMap, calMatrix(part1), 0);
      }

      animateId.current = requestAnimationFrame(
        (current)=>{ updateWorker(current, ctx, newMap||tempMap, gridSize); }
      );
    }

    return ()=> {
      worker.terminate();
      cancelAnimationFrame(animateId.current);
    }
  }, [start, liveColor, interval]);
}

function sliceOverlap(map, cutLine) {
  return [map.slice(0, cutLine+1), map.slice(cutLine-1)];
}

function handleResult(ctx, result, tempMap, baseR, gridSize,  lastColor, liveColor, newMap) {
  paintRange(ctx, result, tempMap, baseR, gridSize,  lastColor, liveColor)
  setAtNewMap(newMap, result, baseR);
}

function setAtNewMap(newMap, data, baseR) {
  forLoop(baseR, data, (i,j,data)=> {
    newMap[partToMapIndex(i,j,baseR)][j] = data[i][j];
  });
}

function forLoop(baseR, data, callback) {
  const [begin, end] = baseR===0?[0,data.length-1]:[1,data.length]
  for (let i=begin;i<end;i++) {
    for (let j=0;j<data[0].length;j++) {
      callback(i,j,data);
    }
  }
}

function paintRange(ctx, data, tempMap, baseR, gridSize,  lastColor, liveColor) {
  const [begin, end] = baseR===0?[0,data.length-1]:[1,data.length]
  for (let i=begin;i<end;i++) {
    for (let j=0;j<data[0].length;j++) {
      const newVal = data[i][j];
      const oldVal = tempMap[partToMapIndex(i,j,baseR)][j];
      paintAt(ctx, partToMapIndex(i,j,baseR), j, newVal, oldVal, tempMap.length, gridSize, lastColor, liveColor)
    }
  }
}

function paintAll(ctx, data, tempMap, gridSize,  lastColor, liveColor) {
  for (let i=0;i<data.length;i++) {
    for (let j = 0; j < data[0].length; j++) {
      paintAt(ctx, i, j, data[i][j], tempMap[i][j], tempMap.length, gridSize, lastColor, liveColor)
    }
  }
}

function paintAt(ctx, r, c,newVal, oldVal, size, gridSize,  lastColor, liveColor) {
  if (newVal!==oldVal) {
    newVal===0?
      paintGrid(ctx, r, c, gridSize, size, size, true):
      paintGrid(ctx, r, c, gridSize, size, size, false);
  }
  else if(newVal!==0 && lastColor.current!==liveColor){
    paintGrid(ctx, r, c, gridSize, size, size, false);
  }
}


function fork(task) {
  class WorkerBuilder extends Worker {
    constructor(worker) {
      const code = worker.toString();
      const blob = new Blob([`(${code})()`]);
      return super(URL.createObjectURL(blob));
    }
  }
  const worker = new WorkerBuilder(task);
  return {
    sendData(...data) {
      // console.time('send')
      worker.postMessage(...data)
      // console.timeEnd('send')
    },
    receiveData(callback) {
      worker.onmessage = callback;
    },
    handleError(callback) {
      worker.onerror = callback;
    },
    terminate() {
      worker.terminate();
    }
  }
}

function partToMapIndex(i,j, baseR) {
  return baseR===0?i+baseR:i-1+baseR
}

function calMatrix(tempMap){
  //let hasDif = false;
  const sizeR = tempMap.length, sizeC = tempMap[0].length;
  const data = emptyArray(sizeR, sizeC);
  for (let i=0; i<sizeR; i++) {
    for (let j=0; j<sizeC; j++) {
      if (tempMap[i][j]!==0) {
        setDataAround(data, i, j);
      }
      if (i>0 && j>0){
        data[i-1][j-1] = getRules(data[i-1][j-1], tempMap[i-1][j-1]);
      }
    }
  }
  for (let i=0; i<sizeR; i++){
    data[i][sizeC-1] = getRules(data[i][sizeC-1], tempMap[i][sizeC-1]);
  }
  for (let j=0; j<sizeC-1; j++){
    data[sizeR-1][j] = getRules(data[sizeR-1][j], tempMap[sizeR-1][j]);
  }
  return data;
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

function emptyArray(lenR, lenC=lenR) {
  const data = new Array(lenR);
  const initial = new Array(lenC).fill(0);
  for (let i=0;i<lenR;i++){
    data[i] = initial.map(val=>val);
  }
  return data;
}

