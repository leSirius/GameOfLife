'use client'
import Canvas from "@/components/canvas";
import NavBar from "@/components/nav-bar";
import {useEffect, useRef, useState} from "react";
import useThrottle from "@/lib/useThrottle";

export default function GameOfLife() {
  const size = 125;
  const [gameMap, setGameMap] = useState(initialArray(size, 0.2));
  const [start, setStart] = useState(false);
  const handleSpacePressed = useThrottle((e)=>{
    if (e.key===' '){
      e.preventDefault();
      setStart(!start);
    }
  }, true, 400)

  useEffect(() => {
    document.addEventListener('keydown', handleSpacePressed);
    return ()=>{document.removeEventListener('keydown', handleSpacePressed);}
  }, [start]);

  function clickToSet(e) {
    if (start) { return; }
    const ratio = window.devicePixelRatio || 1;
    const gridSize = 20;                      // do check with canvas.js
    const x = (e.clientX-e.currentTarget.offsetLeft+e.currentTarget.scrollLeft)*ratio,
          y = (e.clientY-e.currentTarget.offsetTop+e.currentTarget.scrollTop)*ratio;
    const indX = Math.floor(x/gridSize);
    const indY = Math.floor(y/gridSize);
    const newMap = deepCopy(gameMap);
    newMap[indY][indX] = newMap[indY][indX]===0? 1:0;
    setGameMap(newMap);
  }

  function setReset() {
    setStart(false);
    setGameMap(initialArray(size, 0.2));
  }

  function setClean() {
    setStart(false);
    setGameMap(initialArray(size, 0))
  }

  return (
    <div className=''>
      <div className='flex'>
        <div className='w-52 h-screen bg-black'>
          <NavBar start={start} setStart={setStart} setReset={setReset} setClean={setClean}></NavBar>
        </div>
        <div className='w-full h-screen overflow-scroll scrollbar' onClick={clickToSet}>
          <Canvas gameMap={gameMap} setGameMap={setGameMap} start={start}></Canvas>
        </div>
      </div>
    </div>

  )
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