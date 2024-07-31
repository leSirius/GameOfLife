'use client'
import {useEffect, useState} from "react";
import Canvas from "@/components/canvas";
import useThrottle from "@/lib/useThrottle";
import {deepCopy, getRandomArray} from "@/lib/sharedFuncs";
import NavBar from "@/components/nav-bar";
import {defaultAxisColor, defaultGridSize, defaultInterval, defaultLiveColor} from "@/lib/parameters";
import { template} from "@/lib/models";


// whenever gameMap is updated during stop, prevMap should be updated together,
// to help update the canvas.

export default
function GameOfLife() {
  const [gameMap, setGameMap] = useState(template);  //getRandomArray(defaultMapSize, defaultDensity));
  const [prevMap, setPrevMap] = useState(getRandomArray(template.length, 0));  //defaultMapSize, 0));  // this map is only for stopped game help reduce canvas clear
  const [start, setStart] = useState(false);
  const [ratio,setRatio] = useState(1);
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
    const scale = window.devicePixelRatio/ratio;
    if (start) { return; }
    const x = (e.clientX-e.currentTarget.offsetLeft+e.currentTarget.scrollLeft)*scale,
      y = (e.clientY-e.currentTarget.offsetTop+e.currentTarget.scrollTop)*scale;
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


// ratio relies on browser environment, which might cause mismatch between client and server render.
// dynamic render to disable server pre-render.
// though not an error, it will cause a warning and resize of canvas on screen, as canvas was initially
// rendered according to the state of server.