import childProcess from 'child_process'
import fs from 'fs'
import mineTypes from 'mime-types'
import path from 'path'
import * as DateUtil from './DateUtil'
import { createDir, replaceExtensionToWebp } from './FSUtil'
import { getFileNameWithExtension, getFolderName } from './PathUtil'
import { buildPromiseAllQueue } from './PromiseUtil'

const { exec } = childProcess

const fsPromises = fs.promises
// [Linen] 怎么得到? npm i mime-types -g
// [Linen] npm全局安装某个 module 时, 会其依赖到其根目录的 node_modules 下. 即 bundle 的理念, 而 yarn global add mime-types 不是的
// [Linen] 可以手动 bundle, 先手动下载下来, 再 npm install
// [Linen] 所以尽量少用 npm -g, 虽然只有一层 node_modules
// [Linen] npm i mime-types --save 和 npm i mime-types 是不同的, 没有 --save 可能导致 package.json 的  dependencies 很臃肿
// 暂时没有 @types/webp-converter
// import webpConverter from 'webp-converter'

const cwebpExeFile = '../lib/libwebp-1.1.0-windows-x64/bin/cwebp.exe'
const gif2webpExeFile = '../lib/libwebp-1.1.0-windows-x64/bin/gif2webp.exe'

namespace ParameterTypes {
  export  type filterImages = {
    fileNameArray: Array<string>
    includeTypeArray?: Array<string>
    excludeTypeArray?: Array<string>
  }
  export  type filterImagesInFolder = {
    sourceDir: string
    includeTypeArray?: Array<string>
    excludeTypeArray?: Array<string>
  }

  export type toWebp = {
    exePath: string
    input: string
    output: string
    options?: string
    success?: (targetFile: string) => void
  }

  export type imageToWebp = {
    input: string
    output: string
    options?: string
    success?: (targetFile: string) => void
  }
  export type gifToWebp = imageToWebp

  export type imagesToWebp = {
    // 如果目标文件夹与源文件夹相同, 则应该重命名源文件夹, 即传入 sourceDirNewName
    sourceDirNewName?: string

    includeTypeArray?: Array<string>
    excludeTypeArray?: Array<string>
    // 图片们的绝对路径数组, TODO 暂不予支持, 只为了把文件夹内的图片转为 .webp
    // images?: Array<string>
    sourceDir: string
    targetDir?: string
    options?: string
    success?: (obj: { sourceDir: string, targetDir: string, targetImages: Array<string> }) => void
    // 每转换完一张图片后执行.  如果 ImageUtil 是一个 class 的话, 这里应该是事件, 类似于 on('file', callbak) 之类的
    singleSuccess?: (targetFile: string) => void
  }

  export type imagesToHTML = {
    // 图片们的绝对路径数组
    images?: Array<string>
    // 如果不传入 "images", 可以传入 sourceDir, 目前认为里面的文件都是图片
    sourceDir?: string
    includeTypeArray?: Array<string>
    excludeTypeArray?: Array<string>
    // 传入 "sourceDir" 时可选, 源文件夹内是否都是图片, 为了性能考虑 TODO 暂未支持
    isAllImages?: boolean
    // target html file path
    targetFile?: string
  }
  export type imagesToHTMLBundle = {
    sourceDir: string
    targetDir?: string
    targetFile?: string
    options?: string

  }
}

namespace ReturnValueTypes {
  export type toWebp = {
    exePath: string
    input: string
    output: string
    options?: string
    success?: (targetFile: string) => void
  }
}

// MIME image/* are so many, it's not necessary to loop all of them
let imageExtnameArray = ['.jpg', '.png', '.webp', '.jpeg', '.gif', '.bmp']

/**
 * TODO
 * @param {string} file
 * @param {Array<string>} imageTypes
 * @return {boolean}
 */
export function isImage (file: string,
  imageTypes: Array<string> = imageExtnameArray
): boolean {
  let isContain
  if (file) {
    // [Lyne] should call toLowerCase()
    let fileExtName = path.extname(file).toLowerCase()

    if (imageTypes) {
      isContain = imageTypes.indexOf(fileExtName)
    } else {
      isContain = imageExtnameArray.indexOf(fileExtName)
    }
  }
  return isContain !== -1

}

/**
 * TODO 实现图片筛选
 * @param {Array<string>} fileNameArray
 * @param {Array<string> | undefined} includeTypeArray
 * @param {Array<string> | undefined} excludeTypeArray
 * @return {Array<string>}
 */
export function filterImages ({ fileNameArray, includeTypeArray, excludeTypeArray }: ParameterTypes.filterImages): Array<string> {
  let images: Array<string> = []
  if (fileNameArray) {
    fileNameArray.forEach(file => {
      if (isImage(file, includeTypeArray)) {
        images.push(file)
      }
    })

  }
  return images
}

/**
 * 从一个文件夹中筛选出图片
 * @param {string} sourceDir
 * @param {Array<string> | undefined} includeTypeArray
 * @param {Array<string> | undefined} excludeTypeArray
 * @return {Promise<Array<string>>} 图片们的 绝对路径 数组
 */

export function filterImagesInFolder ({ sourceDir, includeTypeArray = imageExtnameArray, excludeTypeArray }: ParameterTypes.filterImagesInFolder): Promise<Array<string>> {

  return fsPromises.readdir(sourceDir).then((files) => {
    if (files.length === 0) {
      console.log('[Warning]`, `Could not find any files in source images directory!')
      return Promise.resolve([])
    } else {
      let sourceFileURLs: Array<string> = []
      // Target directoty may contains some subdirectories.
      files.forEach(file => {
        // for convenient, use fs.statSync()
        let fileURL = path.join(sourceDir, file)
        let stats = fs.statSync(fileURL)
        if (stats.isFile()) {
          sourceFileURLs.push(fileURL)
        }
      })

      // 建议返回值命名 sourceImages
      return Promise.resolve(filterImages({
        fileNameArray: sourceFileURLs,
        includeTypeArray,
        excludeTypeArray
      }))
    }
  })

}

export function imageToBase64 (fileUrl: string): Promise<string> {
  return new Promise(resolve => {
    // The "path" argument must be of type string or an instance of Buffer or URL
    fs.readFile(fileUrl, (err, data) => {
      // Buffer() is deprecated due to security and usability issues. Please use the Buffer.alloc(), Buffer.allocUnsafe(), or Buffer.from() methods instead.
      // data = new Buffer(data).toString('base64')
      if (err) throw err
      let base64Data = Buffer.from(data).toString('base64')
      resolve(base64Data)
    })
  })
}

export async function getImgElementBase64 (fileUrl: string): Promise<string> {
  let base64Data = await imageToBase64(fileUrl)
  // console.log(base64Data.substring(0, 50))
  let src = `data:${mineTypes.lookup(fileUrl)};base64,${base64Data}`
  return `<img src="${src}" >`
}

/**
 * Convert a single image to .webp format.
 */
function imageToWebp (argObj: ParameterTypes.imageToWebp): Promise<string> {
  let cwebpPath = `"${path.join(__dirname, cwebpExeFile)}"`
  let toWebpArgObj = Object.assign(argObj, { exePath: cwebpPath })
  return toWebp(toWebpArgObj)
}

/**
 * Cwebp.exe only convert animated .gif images to static .webp images,
 * so use gif2webp.exe to convert animated .gif images to .webp format.
 *
 */
function gifToWebp (argObj: ParameterTypes.gifToWebp): Promise<string> {
  let gif2webpPath = `"${path.join(__dirname, gif2webpExeFile)}"`
  let toWebpArgObj = Object.assign(argObj, { exePath: gif2webpPath })
  return toWebp(toWebpArgObj)
}

/**
 * 转换单张图片
 * @param exePath
 * @param input
 * @param output
 * @param options   webp 转换程序的可选项, 默认转换质量 100, 即其默认值为 '-q 100'
 * @param success
 */
function toWebp ({ exePath, input, output, options = `-q 100`, success }: ParameterTypes.toWebp): Promise<string> {
  if (input === `` || input === `""`) {
    console.log(`[Error]`, `Failed to read input image!`)
    return Promise.resolve('')
  }

  let command = `${exePath} ${options} ${input} -o ${output}`
  console.log(`\n`, command, `\n`)
  return new Promise(resolve => {
    exec(command, (err) => {
      if (err) throw err
      // [Lyne] Warning: 这个 output  "", 传给 js 作为路径需要删除两边的 ""
      // output.substring(1, output.length - 1) 从第2个截取到倒数第1个, 不包括倒数第一个
      let targetFile = output.substring(1, output.length - 1)
      // 2020-05-27 not used
      let successData
      // if (success instanceof Function) {
      //     successData = success(targetFile)
      // }
      resolve(targetFile)
    })
  })
}

/**
 * Convert images in a folder to .webp format.
 * @param ranameSourceDir
 * @param imageTypes
 * @param sourceDir
 * @param targetDir
 * @param options
 * @param success
 * @param singleSuccess
 *
 * 默认  targetDir = sourceDir, 会重命名 sourceDir
 */
export function imagesToWebp ({
  includeTypeArray,
  excludeTypeArray,
  sourceDir,
  targetDir = sourceDir,
  // 如果只需要把一个文件夹的图片转为 .webp, sourceDir 不应该为 undefined
  sourceDirNewName = `${sourceDir}_original`,
  options,
  success,
  singleSuccess
}: ParameterTypes.imagesToWebp) {

  console.log(`[Info]`, `Source images directory: ${sourceDir}`)
  // source images directory must exists
  if (!fs.existsSync(sourceDir)) {
    console.log(`[Error]`, `Could not find source images directory!`)
    return undefined
  }

  // 临时的目标文件夹
  let targetDirTemp = sourceDir + '_' + DateUtil.nowForFilename()

  let toWebpArgObj: ParameterTypes.imageToWebp
  createDir(targetDirTemp).then(() => {
    return filterImagesInFolder({ sourceDir })
  }).then((sourceImages) => {
    return buildPromiseAllQueue({
      array: sourceImages,
      elementHandler: (imageFileURL) => {
        let input = `"${imageFileURL}"`
        let fileNameWithExtension = getFileNameWithExtension(imageFileURL)
        let output = `"${path.join(targetDirTemp, replaceExtensionToWebp(fileNameWithExtension))}"`

        if (typeof singleSuccess === 'function') {
          toWebpArgObj = { input, output, options, success: singleSuccess }
        } else {
          toWebpArgObj = { input, output, options }
        }
        if (path.extname(imageFileURL) === `.gif`) {
          return gifToWebp(toWebpArgObj)
        } else {
          return imageToWebp(toWebpArgObj)
        }
      }
    })
  }).then(resultArray => {

    let sourceDirForPass = sourceDir

    if (targetDir === sourceDir) {
      fs.renameSync(sourceDir, sourceDirNewName)
      sourceDirForPass = sourceDirNewName
      console.log(`[Info]`, `Rename "${getFolderName(sourceDir)}" to "${getFolderName(sourceDirNewName)}".`)
    }

    fs.renameSync(targetDirTemp, targetDir)
    console.log(`[Info]`, `Rename "${getFolderName(targetDirTemp)}" to "${getFolderName(targetDir)}".`)

    if (typeof success === 'function') {
      success({ sourceDir: sourceDirForPass, targetDir, targetImages: resultArray })
    }
  })

}

/**
 * @description 把 图片们 以 Base64 编码整合到单个 HTML 文件
 *
 * @deprecated 不推荐这样使用, 因为会使得文件变大, 只是方便预览的话, 真没必要
 *
 * @param images
 * @param sourceDir
 * @param isAllImages
 * @param targetFile
 */
export function imagesToHTML ({
  images,
  // @ts-ignore
  sourceDir,
  includeTypeArray,
  excludeTypeArray,
  // Default target file: source directory + .html
  targetFile = sourceDir + '.html'
}: ParameterTypes.imagesToHTML): void {

  // [Lyne] [Lyne-设计:互斥可选参数] 互斥可选参数 sourceDir 与 images, sourceDir 的本质也是传入 images, 所以先判断 sourceDir
  function handleImages (images: Array<string>): void {
    // add some margin
    let style = `<style>img{margin-bottom:10px; margin-right:10px;}</style>`
    let html = style
    buildPromiseAllQueue({
      array: images,
      elementHandler: (imageFileURL) => getImgElementBase64(imageFileURL)
    }).then((imgElementArray: Array<string>) => {
      html = html + imgElementArray.join('')
      fs.writeFile(targetFile, html, error => {
        if (error) {
          console.log('[Error] Write HTML file failed!')
        } else {
          console.log(`[Info] Success, target HTML file:`, targetFile)
        }
      })
    })
  }

  // 如果传入 sourceDir, 就修改 images
  if (typeof sourceDir === 'string') {
    console.log('[Info] Source images directory:', sourceDir)
    if (!fs.existsSync(sourceDir)) {
      console.log('[Error] Could not find source images directory!')
      return
    }
    filterImagesInFolder({ sourceDir }).then((images) => { handleImages(images)})

  }
  // 如果传入 images
  else if (Array.isArray(images)) {
    if (images.length <= 0) {
      console.log('[Warning] images.length <= 0!')
      return
    }
    handleImages(images)
  }

  // 如果没传 images, 也没传 sourceDir, 就提示错误的参数
  else {
    console.log('[Error] Could not find right parameter [images] or [sourceDir]!')
    return
  }

}

/**
 * images To HTML Bundle
 * @deprecated 方案不合适, 不应再使用
 * @param {string} sourceDir
 * @param {string | undefined} targetDir
 * @param {string | undefined} targetFile
 * @param {string | undefined} options
 */
export function imagesToHTMLBundle ({ sourceDir, targetDir, targetFile, options }: ParameterTypes.imagesToHTMLBundle): void {
  imagesToWebp({
    sourceDir,
    targetDir,
    options,
    success ({ targetImages }) {
      imagesToHTML({ images: targetImages, targetFile })
    }
  })
}

