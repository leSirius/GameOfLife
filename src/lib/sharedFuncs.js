
export function getRandomArray(len, den=0) {
  len = Number(len);
  const data = new Array(len);
  const initial = new Array(len).fill(0);
  for (let i=0;i<len;i++) {
    data[i] = initial.map(val=> Math.random()<den?1:val);
  }
  return data;
}

export function paintGrid(ctx, i, j, gridSize, w, h, isClear=false) {
  const baseLength = gridSize-1;
  const axisX = j*gridSize, axisY = i*gridSize
  switch (true){
    case (i<h-1&&j<w-1):{
      isClear?
        ctx.clearRect(axisX, axisY, baseLength, baseLength):
        ctx.fillRect (axisX, axisY, baseLength, baseLength);
      break;
    }
    case (i===h-1&&j===w-1):{
      isClear?
        ctx.clearRect(axisX, axisY, baseLength+1, baseLength+1):
        ctx.fillRect (axisX, axisY, baseLength+1, baseLength+1);
      break;
    }
    case (i===h-1):{
      isClear?
        ctx.clearRect(axisX, axisY, baseLength, baseLength+1):
        ctx.fillRect (axisX, axisY, baseLength, baseLength+1);
      break;
    }
    case (j===w-1):{
      isClear?
        ctx.clearRect(axisX, axisY, baseLength+1, baseLength):
        ctx.fillRect (axisX, axisY, baseLength+1, baseLength);
      break;
    }
  }
}

export function deepCopy(dataMap) {
  //return JSON.parse(JSON.stringify(dataMap))
  return dataMap.map(arr => [...arr]);
}
