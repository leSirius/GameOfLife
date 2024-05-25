'use client'
import {Button} from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import {useState} from "react";
import {list} from 'radash'
import {getRandomArray} from "@/lib/sharedFuncs";

// import { cva } from "class-variance-authority";
// const button = cva('cursor-pointer w-2/3 my-3 outline-none ');

export const defaultMapSize = 50, defaultGridSize = 20,
 defaultAxisColor = '#444444', defaultLiveColor = '#476bd7',
 defaultInterval = 200, defaultDensity = 0;

export default function NavBar(
  {gameMap, start, setStart, setPrevAndTemp, mapSize, setMapSize, setGridSize, setRatio, setLiveColor, setAxisColor, setInterval}
) {
  // set both stop and running
  const [scale, setScale] = useState(1);
  const [inputLiveColor, setInputLiveColor] = useState(defaultLiveColor);
  const [inputAxisColor, setInputAxisColor] = useState(defaultAxisColor);
  // set only when stop
  const [density, setDensity] = useState(defaultDensity);
  const [inputMapSize, setInputMapSize] = useState(defaultMapSize);
  const [inputGridSize, setInputGridSize] = useState(defaultGridSize);
  const [inputInterval, setInputInterval] = useState(defaultInterval);
  const minScale = 0.1;

  const inputList = [
    {
      inputProps:{
        type: 'color',
        label: 'Axis Color',
        labelPlacement: 'outside',
        value: inputAxisColor,
        onValueChange: setInputAxisColor,
      },
      buttonProps:{ onClick:()=>{setAxisColor(inputAxisColor)} }
    }, {
      inputProps:{
        type: 'color',
        label: 'Live Color',
        labelPlacement: 'outside',
        value: inputLiveColor,
        onValueChange: setInputLiveColor,
      },
      buttonProps:{ onClick:()=>{setLiveColor(inputLiveColor)} }
    }, {
      inputProps:{
        type: 'number',
        title: `Range [${minScale},5], 1 to restore`,
        label: 'Scale',
        isInvalid: !validScale(),
        errorMessage: `Please enter a number in [${minScale},5]`,
        value: scale,
        onValueChange: setScale,
      },
      buttonProps:{ onClick: handleRatio }
    }, {
      inputProps:{
        type: 'number',
        title: `Time interval between updates`,
        label: 'Interval (ms)',
        isInvalid: !validInterval(),
        errorMessage: 'Please enter a proper number larger than 50',
        value: inputInterval,
        onValueChange: setInputInterval,
      },
      buttonProps:{ onClick: handleInterval }
    }, {
      inputProps:{
        type: 'number',
        title: `Number of grids each row/col`,
        label: 'MapSize',
        isInvalid: !validMapSize(),
        errorMessage: `Please enter an integer below 2000`,
        value: inputMapSize,
        onValueChange: setInputMapSize,
        isDisabled: start,
      },
      buttonProps:{ onClick: handleMapSize }
    }, {
      inputProps:{
        type: 'number',
        title: `Range [.0, 1]`,
        label: 'Density',
        isInvalid: !validDensity(),
        errorMessage: `Please enter a number in [.0, 1]`,
        value: density,
        onValueChange: setDensity,
        isDisabled: start,
      },
      buttonProps:{ onClick: handleGenerate, children: 'Random' }
    }, {
      inputProps:{
        type: 'number',
        title: `Size of grid, Integer`,
        label: 'GridSize',
        isInvalid: !validGridSize(),
        errorMessage: 'Please enter a proper number in [1,200]',
        value: inputGridSize,
        onValueChange: setInputGridSize,
        isDisabled: start,
      },
      buttonProps:{ onClick: handleGridSize }
    },
  ]

  return (
    <div className='w-full h-full '>
      <div className='flex flex-col gap-2 text-center w-10/12 mx-auto  '>
        {inputList.map(ob=> <InputStyled
          key = {`${ob.inputProps.label}`}
          inputProps = {ob.inputProps}
          buttonProps = {ob.buttonProps}
        ></InputStyled>)}
        <ButtonStyled onClick={()=>{setStart(!start)}}>{start?'Pause':'Start'}</ButtonStyled>
        <ButtonStyled onClick={handleClean}>Clean</ButtonStyled>
      </div>
    </div>
  )

  function validScale() {
    const numScale = Number(scale);
    return scale===''||(numScale>=minScale&&numScale<=5);
  }
  function handleRatio() {
    if (validScale()&&scale!==''){
      const numScale = Number(scale);
      const newRatio = (window?.devicePixelRatio || 1)/numScale;
      setRatio(newRatio);
    }
  }

  function validDensity() {
    const numDensity = Number(density);
    return density===''||(numDensity>=0&&numDensity<=1);
  }
  function handleGenerate() {
    if (validDensity()&&density!=='') {
      const numDensity = Number(density);
      setPrevAndTemp(getRandomArray(mapSize, numDensity))
    }
  }

  function validMapSize() {
    const numMapSize = Number(inputMapSize);
    return inputMapSize===''||(Number.isInteger(numMapSize)&&numMapSize>0&&numMapSize<2001);
  }
  function handleMapSize() {
    if (Number(inputMapSize)===mapSize) { return; }
    if (validMapSize()&&inputMapSize!==''){
      const numMapSize = Number(inputMapSize);
      setMapSize(numMapSize);
      const data = scaleMap(gameMap, numMapSize);
      setPrevAndTemp(data, false, getRandomArray(numMapSize, 0));
    }
  }

  function validGridSize() {
    const numGridSize = Number(inputGridSize);
    return inputGridSize===''||(Number.isInteger(numGridSize)&&numGridSize>=1&&numGridSize<=200);
  }
  function handleGridSize() {
    if (validGridSize()&&inputGridSize!==''){
      const numGridSize = Number(inputGridSize);
      setPrevAndTemp(getRandomArray(mapSize, 0), true);
      setGridSize(numGridSize);
    }
  }

  function validInterval() {
    const numInterval = Number(inputInterval);
    return inputInterval===''||(Number.isInteger(numInterval)&&numInterval>=50)
  }
  function handleInterval() {
    if (validInterval()&&inputInterval!=='') {
      setInterval(inputInterval);
    }
  }

  function handleClean() {
    setStart(false);
    setPrevAndTemp(getRandomArray(mapSize, 0));
  }
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
      onKeyUp={ (e)=>{e.key==='Enter'&&buttonProps.onClick();} }
      endContent={ <Button size='sm' color='default' {...buttonProps}>{buttonProps.children? buttonProps.children:'Set'}</Button>}
      {...inputProps}
    ></Input>
  )
}



function scaleMap(gameMap, len) {
  let data;
  if (gameMap.length>len) {
    data = gameMap.slice(0,len).map(arr=>arr.slice(0,len));
  }
  else {
    data = gameMap.map(arr=>arr.concat(list(0,len-gameMap.length-1, 0)))
                  .concat(list(0, len-gameMap.length-1,
                    ()=>list(0,len-1,0)));
  }
  return data;
}