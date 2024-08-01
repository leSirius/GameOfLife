'use client'
import {useRef} from "react";
import useInit from "@/lib/useInit";
import useUpdate from "@/lib/useUpdate";
// import useWorkerUpdate from "@/lib/useWorkerUpdate";


import dynamic from 'next/dynamic'
export default dynamic(() => Promise.resolve(Canvas),
  { ssr: false }
);

// export default
function  Canvas({gameMap, prevMap, start, setGameMap, ratio, gridSize, interval, liveColor, axisColor}) {

  ratio = window.devicePixelRatio/ratio;
  const canvasRef = useRef(null);
  const size = gameMap.length*gridSize;

  useInit(canvasRef, start, gameMap, prevMap, gridSize, ratio, {axisColor, liveColor});
  useUpdate(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize);
  // useWorkerUpdate(canvasRef, start, gameMap, setGameMap, liveColor, interval, gridSize);
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

