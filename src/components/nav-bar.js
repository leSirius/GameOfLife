import {Button} from "@radix-ui/themes";
import { cva } from "class-variance-authority";

const button = cva('cursor-pointer block w-28 my-3 outline-none w-full');

export default function NavBar({start, setStart, setReset, setClean}) {
  return (
    <div className='w-full h-full border-r-[1px] border-white'>
      <div className='mx-auto w-fit fixed top-1/3 left-[2%]'>
        <Button className={button()} size='4' variant="solid" onClick={()=>{setStart(!start)}}>{start?'Pause':'Start'}</Button>
        <Button className={button()} size='4' variant="solid" onClick={setReset}>Random</Button>
        <Button className={button()} size='4' variant="solid" onClick={setClean}>Clean</Button>
      </div>

    </div>
  )
}

//