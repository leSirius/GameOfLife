import {useRef} from "react";


export default function useThrottle(callback, immediate=true, delay=400) {
  const timer = useRef(null);

  return (arg)=>{
    if (!timer.current){
      immediate&&callback(arg);
      timer.current = setTimeout(()=>{
        !immediate&&callback(arg)
        timer.current = null;
      }, delay);
    }

  }

}