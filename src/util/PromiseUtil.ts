import { toTwoDimensional } from './ArrayUtil'

namespace PrivateTypes {
  /**
   * 参数为数组, 返回一个 Promise 数组
   */
  export type ReturnPromiseAll = (arg: Array<any>) => Promise<Array<any>>

  /**
   * 对于多个 Promise.all() 形成的异步队列, 累加每个 Promise.all().then(values) 中的 values
   */
  export type PromiseAllAccumulator = {
    // 每次累加后的数组
    accumulatingValueArray: Array<any>
    // 下一个要执行的 Promise.all()
    currentPromiseAll: Promise<Array<any>>
  }
}

namespace ParameterTypes {
  export type buildPromiseAllQueue = {
    // 一维数组数组
    array: Array<any>
    // 每次处理多少个元素(把 array 参数转为二维数组后, 这个二维数组的元素的容量), 默认是 8
    capacity?: number
    // 处理每个元素, 返回 Promise
    elementHandler: (element: any) => Promise<any>
  }
}

/**
 * 功能有限... TODO
 * [Lyne] async 声明 + Promise<类型> 返回值, 就可以把同步函数转成返回 Promise 函数.
 *        若是返回 Promise<void>, 使用 async后,  不用在函数体特意 return Promise<void>.
 *
 */
 /*
export async function promisify (fn: Function): Promise<void> {
	fn()
}
*/

/**
 * 构建 Promise.all() 队列, 返回值是每个 Promise.all().then(values) 的 values 叠加后形成的数组
 * @param array
 * @param capacity
 * @param elementHandler
 *
 * 如下载 160 个文件, 每次并行下载 8 个, 这 8 个下载完成后, 再继续
 *
 * ### 实现思路
 *
 *
 */
export async function buildPromiseAllQueue (
  { array, capacity = 8, elementHandler }: ParameterTypes.buildPromiseAllQueue
): Promise<Array<any>> {
  if (array.length <= 0) {
    console.log(`[Warning] array.length <= 0`)
    return Promise.resolve([])
  }

  let arrayTwoDimensional = toTwoDimensional(array, capacity)

  // [Lyne] 多个 promise 并行后才执行某个操作, 可以在 Promise.all() 创建这些 promise
  let returnPromiseAll: PrivateTypes.ReturnPromiseAll = (arrayOneDimensional) => {
    return Promise.all(arrayOneDimensional.map(elementHandler))
  }



  // [遍历方案一]: 同步便利器
  // [构建 Promise] 序列方案一: promiseInstance.then().then().then()..., 不推荐, 繁琐

  // 第一个 PromiseAll 是个空数组
  // let sequence: Promise<Array<any>> = Promise.resolve([])

  // 等待最后一个 Promise.all() 执行完成后, 返回累加后的数组
  // for (let i = 0; i < arrayTwoDimensional.length; i++) {
  //   let arrayOneDimensional = arrayTwoDimensional[i]
  //   // [Lyne] promise 的链式调用就像是一个对象一直 then.then.then.then..., 这就可以形成序列. 可以采用 await 等待
  //   // [Lyne] promise 一旦建立就会立即执行. 如果想要按顺序执行, 应按顺序创建
  //   // [Lyne] 所以这里就是在 每个 then() 里面的 Promise.all() 的参数里创建 promise 们, 然后立即并行执行. 每个 then() 只执行应执行的 promise 们
  //   sequence = sequence.then((accumulatingValueArray) => {
  //     return returnPromiseAll(arrayOneDimensional).then((currentValueArray) => {
  //       accumulatingValueArray.push(currentValueArray)
  //       return accumulatingValueArray
  //     })
  //   })
  // }

  // [遍历方案二]: for await ... of, 异步便利器. 由于需要等待上个遍历元素才能进行下一次遍历, 这里并不合适
  // for await (let arrayOneDimensional of arrayTwoDimensional) {
  //   sequence = sequence.then((accumulatingValueArray) => {
  //     return returnPromiseAll(arrayOneDimensional).then((currentValueArray) => {
  //       accumulatingValueArray.push(currentValueArray)
  //       return accumulatingValueArray
  //     })
  //   })
  // }

  // [构建 Promise 序列方案二]: await, 等待性同步, 推荐, 比较简单, 也符合思维
  let accumulatingValueArray = []

  function printProcessInfo (array: Array<any>, capacity: number = 8, arrayOneDimensionalIndex: number): void {

    let remainder: number = array.length % capacity
    let quotient: number = (array.length - remainder) / capacity
    if (remainder === 0 || (arrayOneDimensionalIndex + 1) <= quotient) {
      console.info(`[Info]`, `Process: ${capacity * (arrayOneDimensionalIndex + 1)}/${array.length}`)
    } else {
      console.info(`[Info]`, `Process: ${capacity * arrayOneDimensionalIndex + remainder}/${array.length}`)
    }
  }

  // arrayInstance.forEach(callback) 的 callback 与 await 不搭
  for (let i = 0; i < arrayTwoDimensional.length; i++) {
    let arrayOneDimensional = arrayTwoDimensional[i]
    let currentValueArray = await returnPromiseAll(arrayOneDimensional)
    printProcessInfo(array, capacity, i)
    accumulatingValueArray.push(currentValueArray)
  }

  return accumulatingValueArray
}
