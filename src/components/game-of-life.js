'use client'
import {useEffect, useState} from "react";
import Canvas from "@/components/canvas";
import useThrottle from "@/lib/useThrottle";
import {deepCopy, getRandomArray} from "@/lib/sharedFuncs";
import NavBar from "@/components/nav-bar";
import {defaultAxisColor, defaultGridSize, defaultInterval, defaultLiveColor} from "@/lib/parameters";
import {gosper} from "@/lib/models";
// ratio relies on browser environment, which might cause mismatch between client and server render.
// dynamic render to disable server pre-render.
// though not an error, it will cause a warning and resize of canvas on screen, as canvas was initially
// rendered according to the state of server.
// It seems that in most cases, the pages are rendered in the server, even though the component is a client one.
/*
import dynamic from 'next/dynamic'
export default dynamic(() => Promise.resolve(GameOfLife),
  { ssr: true }
);

 */



// wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww
// setGameMap is called when game is on in Canvas, but off in NavBar and this component.
// whenever gameMap is updated during stop, prevMap should be updated together,
// to help update the canvas.

export  default
function GameOfLife() {

  const [gameMap, setGameMap] = useState(gosper);  //getRandomArray(defaultMapSize, defaultDensity));
  const [prevMap, setPrevMap] = useState(getRandomArray(gosper.length, 0));  //defaultMapSize, 0));  // this map is only for stopped game help reduce canvas clear
  const [start, setStart] = useState(false);
  const [ratio,setRatio] = useState(typeof window !== "undefined"? window.devicePixelRatio:1);
  const [liveColor, setLiveColor] = useState(defaultLiveColor);
  const [axisColor, setAxisColor] = useState(defaultAxisColor);
  const [gridSize, setGridSize] = useState(defaultGridSize);
  const [interval, setInterval] = useState(defaultInterval);

  const handleSpacePressed = useThrottle((e)=> {
    if (e.key===' ') { setStart(!start); }
  }, true, 400);
  useEffect(() => {
    document.addEventListener('keydown', handleSpacePressed);
    return ()=> {
      document.removeEventListener('keydown', handleSpacePressed);
    }
  }, [start]);

  return (
    <>
      <div className='min-w-fit max-w-md h-screen bg-black border-r-[1px] border-white pt-4 text-white resize-x overflow-auto'>
        <NavBar
          gameMap = {gameMap}
          start = {start}
          setStart = {setStart}
          setPrevAndTemp = {setPrevAndTemp}
          setGridSize = {setGridSize}
          setRatio = {setRatio}
          setLiveColor = {setLiveColor}
          setAxisColor = {setAxisColor}
          setInterval = {setInterval}
        ></NavBar>
      </div>

      <div className=' w-screen h-screen overflow-scroll scrollbar' onClick={clickOnBoard}>
        <Canvas
          gameMap = {gameMap}
          prevMap = {prevMap}
          setGameMap = {setGameMap}
          start = {start}
          ratio = {ratio}
          gridSize = {gridSize}
          interval = {interval}
          liveColor = {liveColor}
          axisColor = {axisColor}
        ></Canvas>
      </div>
    </>
  )

  function clickOnBoard(e) {
    if (start) { return; }
    const x = (e.clientX-e.currentTarget.offsetLeft+e.currentTarget.scrollLeft)*ratio,
      y = (e.clientY-e.currentTarget.offsetTop+e.currentTarget.scrollTop)*ratio;
    const indX = Math.floor(x/gridSize);
    const indY = Math.floor(y/gridSize);
    if (indY>gameMap.length||indX>gameMap[0].length) { return; }
    const newMap = deepCopy(gameMap);
    newMap[indY][indX] = newMap[indY][indX]===0? 1:0;
    setPrevAndTemp(newMap);
  }

  function setPrevAndTemp(newMap, onlyForPrev=false, newPrev=null) {
    if (onlyForPrev){ setPrevMap(deepCopy(newMap)); }
    else {
      setPrevMap(newPrev||deepCopy(gameMap));
      setGameMap(newMap);
    }
  }

}

function star(dataMap, r, c) {         // width&height 13
  if (r<0||c<0||r+12>dataMap.length-1||c+12>dataMap.length-1) {return ;}
  const rows = [
    {row:r+2, col:c, width:3},
    {row:r+8, col:c, width:3},
    {row:r+2, col:c+5, width:3},
    {row:r+8, col:c+5, width:3},
    {row:r+2, col:c+7, width:3},
    {row:r+8, col:c+7, width:3},
    {row:r+2, col:c+12, width:3},
    {row:r+8, col:c+12, width:3},
  ];
  setSeveralRows(dataMap, rows);
}


function setSeveralRows(data, posList){
  posList.map(posOb=>{
    setRow(data,posOb.row, posOb.col, posOb.width)
  })
}
function setRow(data, r, c, w, val=1) {
  for (let j=c;j<c+w;j++) {
    data[r][j] = val;
  }
}

function setCol(data, r, c, h, val=1) {
  for (let i=r;i<c+h;i++) {
    data[i][c] = val;
  }
}

