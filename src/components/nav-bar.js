'use client'
import {Button} from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {useState} from "react";

// import { cva } from "class-variance-authority";
// const button = cva('cursor-pointer w-2/3 my-3 outline-none ');

export default function NavBar({start, setStart, setPrevAndTemp, size, setRatio, liveColor, setLiveColor}) {
  const [scale, setScale] = useState('1');
  const [inputColor, setInputColor] = useState(liveColor);
  const minLimit = 0.1

  function validScale() {
    return scale===''||(scale>=minLimit&&scale<=5);
  }

  function handleRatio() {
    const numScale = Number(scale);
    if (validScale()&&scale!==''){
      const newRatio = (window?.devicePixelRatio || 1)/numScale;
      setRatio(newRatio);
    }
  }

  function handleRandom() {
    setStart(false);
    setPrevAndTemp(initialArray(size, 0.15));
  }

  function handleClean() {
    setStart(false);
    setPrevAndTemp(initialArray(size, 0))
  }

  return (
    <div className='w-full h-full border-r-[1px] border-white pt-40 text-white'>
      <div className='flex flex-col gap-4 text-center w-10/12 mx-auto  '>
        <InputStyled
          inputProps={{
            type: 'color',
            value: inputColor,
            onValueChange: setInputColor,
          }}
          buttonProps={{ onClick:()=>{setLiveColor(inputColor)} }}
        >
        </InputStyled>
        <InputStyled
          inputProps={{
            type: 'number',
            description: `Range [${minLimit},5], 1 to restore`,
            label: 'Scale',
            isInvalid: !validScale(),
            errorMessage: `Please enter a number in [${minLimit},5]`,
            value: scale,
            onValueChange: setScale,
          }}
          buttonProps={{onClick: handleRatio}}
        >
        </InputStyled>
        <ButtonStyled onClick={()=>{setStart(!start)}}>{start?'Pause':'Start'}</ButtonStyled>
        <ButtonStyled onClick={handleRandom}>Random</ButtonStyled>
        <ButtonStyled onClick={handleClean}>Clean</ButtonStyled>
      </div>
    </div>
  )
}

function ButtonStyled(props) {
  return (
    <Button color='primary' variant="shadow" size='lg' {...props} >{props.children}</Button>
  )
}

function InputStyled({inputProps, buttonProps}) {
  return (
    <Input
      color='default'
      variant='faded'
      radius='lg'
      size='sm'
      onKeyUp={ (e)=>{e.key==='Enter'&&buttonProps.onClick();}}
      endContent={
        <Button size='sm' color='default' {...buttonProps}>Set</Button>
      }
      {...inputProps}
    ></Input>
  )
}


export function initialArray(len, num=1) {
  const data = new Array(len);
  const initial = new Array(len).fill(0);
  for (let i=0;i<len;i++){
    data[i] = initial.map(val=>Math.random()<num?1:val);
  }
  return data;
}

