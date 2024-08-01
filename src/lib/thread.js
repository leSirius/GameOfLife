// eslint-disable-next-line import/no-anonymous-default-export

export default function thread() {
  self.onmessage = function(eve){

    const map = calMatrix(eve.data);
    self.postMessage(map);
  }

  function calMatrix(tempMap){
    //let hasDif = false;
    const sizeR = tempMap.length, sizeC = tempMap[0].length;
    const data = emptyArray(sizeR, sizeC);
    for (let i=0; i<sizeR; i++) {
      for (let j=0; j<sizeC; j++) {
        if (tempMap[i][j]!==0) {
          setDataAround(data, i, j);
        }
        if (i>0 && j>0){
          data[i-1][j-1] = getRules(data[i-1][j-1], tempMap[i-1][j-1]);
        }
      }
    }
    for (let i=0; i<sizeR; i++){
      data[i][sizeC-1] = getRules(data[i][sizeC-1], tempMap[i][sizeC-1]);
    }
    for (let j=0; j<sizeC-1; j++){
      data[sizeR-1][j] = getRules(data[sizeR-1][j], tempMap[sizeR-1][j]);
    }
    return data;
  }

  function setDataAround(data, r, c, val=1) {
    for (let i=r-1;i<=r+1;i++) {
      for (let j=c-1;j<=c+1;j++) {
        if (i<0||i>=data.length||j<0||j>=data[0].length||(i===r&&j===c)) { continue; }
        data[i][j] += val;
      }
    }
  }

  function emptyArray(lenR, lenC=lenR) {
    const data = new Array(lenR);
    const initial = new Array(lenC).fill(0);
    for (let i=0;i<lenR;i++){
      data[i] = initial.map(val=>val);
    }
    return data;
  }

  function getRules(numOfNeigh, prevState) {
    switch (true) {
      case (numOfNeigh<2):{
        return 0;
      }
      case (numOfNeigh===2): {
        return prevState;
      }
      case (numOfNeigh===3): {
        return 1;
      }
      case (numOfNeigh>3): {
        return 0;
      }
    }
  }

}

