'use client'
import {useEffect, useState} from "react";
import Canvas from "@/components/canvas";
import NavBar from "@/components/nav-bar";
import useThrottle from "@/lib/useThrottle";

const defaultMapSize = 120, defaultGridSize = 20;
const defaultAxisColor = '#555555', defaultLiveColor = '#476bd7';
const defaultInterval = 200, defaultDensity = 0;

// setGameMap is called when game is on in Canvas, but off in NavBar and this component.
// whenever gameMap is updated during stop, prevMap should be updated together,
// to help update the canvas more efficient.
export default function GameOfLife() {
  const [mapSize, setMapSize] = useState(defaultMapSize);
  const [density, setDensity] = useState(defaultDensity);
  const [prevMap, setPrevMap] = useState(initialArray(mapSize, 0));  // this map is only for stopped game help reduce canvas clear
  const [gameMap, setGameMap] = useState(initialArray(mapSize, density));
  const [start, setStart] = useState(false);

  const [ratio,setRatio] = useState(window?.devicePixelRatio || 1);
  const [liveColor, setLiveColor] = useState(defaultLiveColor);
  const [axisColor, setAxisColor] = useState(defaultAxisColor);
  const [gridSize, setGridSize] = useState(defaultGridSize);
  const [interval, setInterval] = useState(defaultInterval);

  const handleSpacePressed = useThrottle((e)=> {
    if (e.key===' ') { setStart(!start); }
  }, true, 400);

  useEffect(() => {
    document.addEventListener('keydown', handleSpacePressed);
    return ()=>{
      document.removeEventListener('keydown', handleSpacePressed);
    }
  }, [start]);

  function clickOnBoard(e) {
    if (start) { return; }
    const gridSize = 20;                                                  // do check with canvas.js
    const x = (e.clientX-e.currentTarget.offsetLeft+e.currentTarget.scrollLeft)*ratio,
          y = (e.clientY-e.currentTarget.offsetTop+e.currentTarget.scrollTop)*ratio;
    const indX = Math.floor(x/gridSize);
    const indY = Math.floor(y/gridSize);
    const newMap = deepCopy(gameMap);
    newMap[indY][indX] = newMap[indY][indX]===0? 1:0;
    setPrevAndTemp(newMap);
  }

  function setPrevAndTemp(newMap) {
    setPrevMap(deepCopy(gameMap));
    setGameMap(newMap);
  }

  return (
    <div>
      <div className='flex'>
        <div className='w-52 h-screen bg-black'>
          <NavBar
            start={start}
            setStart={setStart}
            setPrevAndTemp={setPrevAndTemp}
            size={mapSize}
            setRatio={setRatio}
            liveColor={liveColor}
            setLiveColor={setLiveColor}
          ></NavBar>
        </div>

        <div className='w-full h-screen overflow-scroll scrollbar' onClick={clickOnBoard}>
          <Canvas
            gameMap={gameMap}
            prevMap={prevMap}
            setGameMap={setGameMap}
            start={start}
            ratio={ratio}
            gridSize={gridSize}
            interval={interval}
            liveColor={liveColor}
            axisColor={axisColor}
          ></Canvas>
        </div>
      </div>
    </div>
  )
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

function initialArray(len, num=1) {
  const data = new Array(len);
  const initial = new Array(len).fill(0);
  for (let i=0;i<len;i++){
    data[i] = initial.map(val=>Math.random()<num?1:val);
  }
  return data;
}

function deepCopy(arr) {
  return arr.map(a=>[...a]);
}


function queenBee(gameMap, left, top) {

}
/*
  gameMap[20][20] = 1;
  gameMap[20][21] = 1;
  gameMap[21][21] = 1;
  gameMap[22][21] = 1;
  gameMap[21][19] = 1;
      function handleSpacePressed(e){
      if (e.key===' '){
        e.preventDefault();
        setStart(!start);
      }
    }
*/