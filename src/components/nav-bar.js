'use client'

import { saveAs } from 'file-saver';
import { Button, Input, ButtonGroup } from "@nextui-org/react";
import { useRef, useState } from "react";
import { list } from 'radash'
import { getRandomArray } from "@/lib/sharedFuncs";
import { defaultGridSize, defaultAxisColor, defaultLiveColor, defaultInterval, defaultDensity }
  from "@/lib/parameters";
import toast, {Toaster} from 'react-hot-toast';

// import { cva } from "class-variance-authority";
// const button = cva('cursor-pointer w-2/3 my-3 outline-none ');

export default function NavBar(
  { gameMap, start, setStart, setPrevAndTemp, setGridSize, setRatio, setLiveColor, setAxisColor, setInterval }
) {

  // set both stop and running.
  const [scale, setScale] = useState(1);
  const [inputLiveColor, setInputLiveColor] = useState(defaultLiveColor);
  const [inputAxisColor, setInputAxisColor] = useState(defaultAxisColor);
  // set only when stop
  const [density, setDensity] = useState(defaultDensity);
  const [inputMapSize, setInputMapSize] = useState(gameMap.length);
  const [inputGridSize, setInputGridSize] = useState(defaultGridSize);
  const [inputInterval, setInputInterval] = useState(defaultInterval);
  const inputRef = useRef(null);
  const minScale = 0.1;
  const mapSize = gameMap.length;

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
  ];

  return (
    <div className='h-full flex flex-col gap-2.5 text-center w-10/12 mx-auto  '>
      {
        inputList.map(ob=>
            <InputStyled
              key = {`${ob.inputProps.label}`} inputProps = {ob.inputProps} buttonProps = {ob.buttonProps}
            ></InputStyled>
        )
      }
      <ButtonStyled onClick={()=>{handleStart()}}> {start?'Pause':'Start'} </ButtonStyled>
      <ButtonStyled onClick={handleClean} isDisabled={start}>Clean</ButtonStyled>
      <input type="file" className='hidden' ref={inputRef} onChange={importMap}/>
      <ButtonGroup isDisabled={start}>
        <ButtonStyled onClick={()=>{inputRef.current.click()}} variant="ghost" >Load Map</ButtonStyled>
        <ButtonStyled onClick={exportMap} variant="ghost">Save Map</ButtonStyled>
      </ButtonGroup>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{duration: 3000,style: { background: '#363636', color: '#ddd'} }}
      ></Toaster>
    </div>
  )

  function handleStart() {
    setStart(!start);
    // !start? toast.success('Heating', {duration:1000, icon:"🔥"}):toast.success('Cooling down', {duration:1000, icon:"🧊"});
  }

  function validScale() {
    const numScale = Number(scale);
    return scale===''||(numScale>=minScale&&numScale<=5);
  }
  function handleRatio() {
    if (validScale()&&scale!==''){
      const numScale = Number(scale);
      setRatio(numScale);
      // toast.success("👓 or 🔎", {icon:"👉"});
    }
  }

  function validDensity() {
    const numDensity = Number(density);
    return density===''||(numDensity>=0&&numDensity<=1);
  }
  function handleGenerate() {
    if (validDensity()&&density!=='') {
      const numDensity = Number(density);
      setPrevAndTemp(getRandomArray(mapSize, numDensity));
      // toast.success("Enjoy your tasty sourdough rye bread", {icon:"🧑‍🍳"});
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
      const data = scaleMap(gameMap, numMapSize);
      setPrevAndTemp(data, false, getRandomArray(numMapSize, 0));
      // numMapSize>mapSize? toast("Good appetite", {icon:"🍴"}):toast("Less is more", {icon:"👟"});
    }
  }

  function validGridSize() {
    const numGridSize = Number(inputGridSize);
    return inputGridSize===''||(Number.isInteger(numGridSize)&&numGridSize>=1&&numGridSize<=200);
  }
  function handleGridSize() {
    if (validGridSize() && inputGridSize!==''){
      const numGridSize = Number(inputGridSize);
      setPrevAndTemp(getRandomArray(mapSize, 0), true);
      setGridSize(numGridSize);
      // toast.success("👓 or 🔎", {icon:"👉"});
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
    //toast.success("Completely cleaned", {icon:"🧹", duration:1000})
  }

  function importMap(e) {
    const mapFile = e.target.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = ()=>{
      try {
        const newMap = JSON.parse(fileReader.result.toString());
        inputRef.current.value = null;
        checkValidMap(newMap)
        newMap.length===mapSize?
          setPrevAndTemp(newMap):
          setPrevAndTemp(newMap, false, getRandomArray(newMap.length, 0));
        setInputMapSize(newMap.length);
        toast.success('A caramelized map', {icon: '🍞'});
      }
      catch (e) {
        toast.error(`${e.message}`, {icon: '🪲', duration: 5000});
      }
    }
    fileReader.readAsText(mapFile);
  }

  function checkValidMap(map) {
    if (!Array.isArray(map)) {throw new Error('Not even a bread');}
    for (let i=0;i<map.length;i++) {
      if (!Array.isArray(map[i])) {throw new Error(`A bug on the toast in row ${i}`);}
      if (map[i].length!==map.length) {throw new Error(`Not a well-cut toast in row ${i}`)}
    }
    return true;
  }

  function exportMap() {
    let blob = new Blob([JSON.stringify(gameMap)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "map.json");
  }
}

function ButtonStyled(props) {
  return (
    <Button color='primary' variant="shadow" size='lg' {...props} >{props.children}</Button>
  )
}

function InputStyled({inputProps, buttonProps}) {
  return (
    <>
      <Input
      color = 'default'
      variant = 'faded'
      radius = 'lg'
      size = 'sm'
      onKeyUp = { (e)=>{e.key==='Enter'&&buttonProps.onClick();} }
      endContent = { <Button size='sm' color='default' {...buttonProps}>{buttonProps.children? buttonProps.children:'Set'}</Button> }
      {...inputProps}
    ></Input>
  </>
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

/*
const InputButton = memo(function InputButton({list}){
  return <>{
    list.map(ob =>
      <InputStyled
        key = {`${ob.inputProps.label}`}
        inputProps = {ob.inputProps}
        buttonProps = {ob.buttonProps}
      ></InputStyled>
    )
  }</>
});

<InputButton list={inputList}></InputButton>

const inputList = useMemo(()=>{
  return [
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
  ];
}, [inputAxisColor, inputLiveColor, scale, inputInterval, inputMapSize, density, inputGridSize, start]);

*/