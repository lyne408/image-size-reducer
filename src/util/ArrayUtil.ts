/**
 *  delete 数组元素会形成空位, 但 array.join() 把空位当成空串连接. 遍历方式...
 *  所以自己写个方法, 因为 forEach 忽略空位.
 *  [Lyne] 副作用的全局性代码其实不利于维护和开发工具, 所以这里没有添加到原型上
 * @param array
 * @param joinStr
 *
 *  ### 测试代码
 *  let testArray = [,,,'非空串'];
 *  console.log(testArray.joinNoEmpty("\r\n"));
 */
export function joinNoEmpty (array: Array<string>, joinStr: string): string {
  let outputStr = ''
  array.forEach(element => {
    outputStr += element + joinStr
  })
  return outputStr.substr(0, outputStr.length - joinStr.length)
}

/**
 * 把一维数组 转为 二维数组.
 * 把 160 个并行任务拆分为 20 次序列的 8 个并行任务, 减少资源消耗
 * 如下载 160 个文件, 每次并行下载 8 个, 这 8 个下载完成后, 再继续
 * @param arrayOneDimensional
 * @param capacity
 */
// [Lyne] TS 的函数的参数有默认值都不能设为可选参数
export function toTwoDimensional (arrayOneDimensional: Array<any>, capacity: number = 8): Array<Array<any>> {

  let arrayTwoDimensional: Array<Array<any>> = []
  let tempArr: Array<any> = []

  for (let i = 0; i < arrayOneDimensional.length; i++) {
    tempArr.push(arrayOneDimensional[i])
    // 设 capacity = 8, 没到 8 个就 push 一次, 并清空 tempArr,  少于 8 个时会在遍历结束后 push
    // i + 1 不可能为 0
    if ((i + 1) % capacity === 0) {
      arrayTwoDimensional.push(tempArr)
      tempArr = []
    }
  }

  // 设 capacity = 8
  // oneDimensionalArr 的长度除 8 有余数时
  // oneDimensionalArr % 8 > 0 时会有 tempArr.length > 0, 应该 push
  if (arrayOneDimensional.length % capacity > 0) {
    arrayTwoDimensional.push(tempArr)
  }
  return arrayTwoDimensional
}

// [Lyne] TypeScript 扩展 Array.constructor.prototype 应该使用 继承...

// class FixArray extends Array {
//     joinNoEmpty = (str: string) => {
//         let outputStr = ''
//         this.forEach((element: string) => {
//             outputStr += element + str
//         })
//         return outputStr.substr(0, outputStr.length - str.length)
//     }
// }

// Array.constructor.prototype.joinNoEmpty = (function anonymous(str: string) {
//     let outputStr = ''
//     this.forEach((element: string) => {
//         outputStr += element + str
//     })
//     return outputStr.substr(0, outputStr.length - str.length)
// })
//
// let testArray = new FixArray()
// console.log(testArray.joinNoEmpty("\r\n"));

/**
 * Remove duplicated elements of an array.
 *
 * @param {Array<T>} array
 *
 * @param {"last" | "first"} reservation
 *  If "last", reserve the element which has the largest index.
 *
 * @return {Array<T>} array
 *  Return array has been handled.
 */
export function removeDuplication<T> (array: Array<T>, reservation: 'last' | 'first' = 'first'): Array<T> {

  let elementIndexMap = new Map<T, number>()
  let arrayReturned: Array<T> = []

  if (reservation === 'first') {
    /* reserved loop*/
    for (let i = array.length - 1; i >= 0; i--) {
      elementIndexMap.set(array[i], i)
    }
  } else if (reservation === 'last') {
    /* positive loop */
    array.forEach((element, index) => {
      elementIndexMap.set(element, index)
    })
  }

  /*
  If ${reservation} equals 'first', then ${elementIndexMap} is positive ordered.
  If ${reservation} equals 'last', then ${elementIndexMap} is reserved.
  */
  for (const key of elementIndexMap.keys()) {
    arrayReturned.push(key)
  }

  /* Get positive ordered ${arrayReturned} */
  if (reservation === 'last') {
    arrayReturned = arrayReturned.reverse()
  }

  return arrayReturned
}
