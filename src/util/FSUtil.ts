/**
 * 统一文件操作, 避免导包的繁琐
 */
import childProcess from 'child_process'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { nowForFilename } from './DateUtil'
import { obtainFileName } from './PathUtil'
import { replaceStringsByMap } from './StringUtil'

const fsPromises = fs.promises

const { exec } = childProcess

/**
 * 创建目录, 会 recursive 创建
 * @param {string} dir
 * @return {Promise<string | void>}
 */
export function createDirectory (dir: string): Promise<string | void> {
  return fsPromises.access(dir, fs.constants.R_OK)
    .then(() => {})
    // err 表示不存在
    .catch((err) => {
      return fsPromises.mkdir(dir, { recursive: true })
    })
}

export function deleteFile (fileURL: string): Promise<string | void> {
  return fsPromises.access(fileURL, fs.constants.R_OK)
    .then(() => {
      return fsPromises.unlink(fileURL)
    })
}

/**
 * 从 url 中获取文件名名称, 显然不是所有 url 都能使用
 * @param url
 */
export function obtainFilenameOfURL (url: string): string {
  let lastSlashIndex = url.lastIndexOf('/')
  let filename = url.substring(lastSlashIndex + 1)
  if (filename.indexOf('.') < 0) {
    console.warn('[Warn]', `filename.indexOf('.') < 0 !`)
  }
  return filename
}

export function obtainMD5FromBuffer (buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = crypto.createHash('md5')
    // 创建一个bufferstream
    let bufferStream = new stream.PassThrough()

    bufferStream.on('error', err => {
      reject(err)
    })
    bufferStream.end(buffer)

    output.once('readable', () => {
      resolve(output.read().toString('hex'))
    })

    bufferStream.pipe(output)
  })
}

export function renameForBackup (oldName: string): Promise<string> {
  let backupName = oldName + '_backup_' + nowForFilename()
  return fsPromises.rename(oldName, backupName).then(() => {
    return backupName
  })
}

export function replaceExtname (file: string, newExtname: string): string {
  let extname = path.extname(file)
  // Directly replace is bad, consider 111.png.png ---> 111.webp.webp
  // let newFile = file.replace(extname, newExtname)
  let fileNoExtname = file.substring(0, file.length - extname.length)
  let newFile = fileNoExtname + newExtname
  return newFile
}

export function replaceExtnameToWebp (file: string): string {
  return replaceExtname(file, '.webp')
}

/**
 * 对于一个文件路径, 若 dirname 不存在, 则创建.
 * 如使用 stream 操作文件时, 要求其所在文件夹必须存在.
 * @param {string} fileURL
 * @return {Promise<string | void>}
 */
export function safenFileURL (fileURL: string): Promise<string | void> {
  let dirname = path.dirname(fileURL)
  return createDirectory(dirname)
}

export function safenFileName (fileName: string): string {
  // 为了清除两边的空格
  fileName = fileName.trim()
  // Windows系统中文件名, 不能含有以下9种字符 ? * : " < > \ / |, 不能以空格开头
  let replaceStringMap = new Map<string, string>()
  replaceStringMap.set('?', '[QUESTION MARK]')
  replaceStringMap.set('*', '[ASTERISK]')
  replaceStringMap.set(':', '[COLON]')
  replaceStringMap.set('<', '[LEFT ANGLE BRACKET]')
  replaceStringMap.set('>', '[RIGHT ANGLE BRACKET]')
  replaceStringMap.set('"', '[QUOTE]')
  replaceStringMap.set('/', '[SLASH]')
  replaceStringMap.set('\\', '[BACKSLASH]')
  replaceStringMap.set('|', '[VERTICAL BAR]')
  return replaceStringsByMap(fileName, replaceStringMap)
}

/**
 * 打开文件, 只在 Windows 上运行.
 * [lyne] Absolute path is better for open a file. 
 * [lyne] Win10上, explorer 指令的路径参数有格式要求, 双 "\\" 等非标准 Windows 路径会解析出错, 所以用 path.resolve() 处理下. 
 * [lyne] Win10, 在 cmd.exe, 打开文件的话, 仅需执行 "文件路径" 这个指令. 但是在 Node 里 exec("文件路径")不行. 所以在 Node 里还是要用 exec(`explore "${fileURL}"`)
 */
export function openFileOnWindows (fileURL: string): void {
  let script = `explorer "${fileURL}"`
  exec(script)
}


export let openFile = openFileOnWindows

/**
 * TODO
 * 获取一个目录下的文件列表
 * @param {string} dir
 * @param {boolean} isFileOnly
 * @param {boolean} isRecursive 是否递归子目录, 暂不支持
 * @return {Promise<Array<string>>}
 */

/**
 *
 *
 * 原本打算实现复杂的业务, 可是发现太难维护了
 *
 * @param {string} directory
 *  REQUIRE.
 *
 *
 * @param {boolean | undefined} isRecursive
 * OPTIONAL. Default: false.
 *
 * @param {number | undefined} recursiveHierarchy
 *  OPTIONAL.
 *  If you only set ${isRecursive} to true, it will recur until no subdirectories.
 *
 * @param {number | undefined} specificHierarchy
 *  OPTIONAL.
 *  eg. Read the "mods path" of MO2 to get all plugins, you should set ${specificHierarchy} to 2.
 *      That path like "mods_path\mod_name(first hierarchy)\plugin_name(second hierarchy)".
 *
 * @param {Array<string> | undefined} fileExtnameFilters
 *  OPTIONAL.
 *  eg. Set ${fileExtnameIncluded} to "['.esm', '.esp', '.esl']" to filter Skyrim plugin files.
 *
 * @param {Array<string> | undefined} fileNameFilters // TODO
 *
 * @param {Array<string> | undefined} folderNameFilters // TODO
 *
 * @return {Promise<Array<string>>}
 */
export type Directory = {
  files?: Array<string>,
  /* name-object mapping, 考虑到遍历的方便, 不把文件夹存到 Directory 的属性*/
  folders?: Map<string, Directory>
  path: string
}

/*

	TODO
*/
export async function readDirectory ({ directory, isRecursive = false, isObtainFoldersOnly = false, isObtainFilesOnly = false, recursiveHierarchy, specificHierarchy, fileExtnameFilters, fileNameFilters, folderNameFilters }: {
  directory: string
  isRecursive?: boolean
  isObtainFoldersOnly?: boolean
  isObtainFilesOnly?: boolean
  recursiveHierarchy?: number
  specificHierarchy?: number
  fileExtnameFilters?: Array<string>
  fileNameFilters: Array<string>
  folderNameFilters?: Array<string>
}): Promise<Directory> {

  async function readDirectoryOneHierarchy (directory: string): Promise<Directory> {
    let files: Array<string> = await fsPromises.readdir(directory)
    let folderArray: typeof files = []
    let fileArray: typeof files = []
    let directoryReturned: Directory = {
      path: directory
    }
    for await (const file of files) {
      let stat = fs.statSync(file)
      if (stat.isDirectory()) {
        folderArray.push(file)
      } else if (stat.isFile()) {
        fileArray.push(file)
      }
    }

    if (folderArray.length > 0) {
      directoryReturned.folders = new Map<string, Directory>()
      for await (const folder of folderArray) {
        directoryReturned.folders.set(folder, {
          path: path.resolve(directory, folder)
        })
      }
    }

    if (fileArray.length > 0) {
      if (Array.isArray(fileExtnameFilters)) {
        let fileArrayFiltered: typeof fileArray = []
        for await (const file of fileArray) {
          if (fileExtnameFilters.includes(path.extname(file).toLowerCase())) {
            fileArrayFiltered.push(file)
          }
        }
        directoryReturned.files = fileArrayFiltered
      } else {
        directoryReturned.files = fileArray
      }
    }
    return Promise.resolve(directoryReturned)
  }

  let directoryReturned: Directory = {
    path: ``
  }
  if (!isRecursive) {
    return readDirectoryOneHierarchy(directory)
  } else {
    return Promise.resolve(directoryReturned)
  }

}

/**
 * 比较两个文件夹内的同名文件的大小, 默认会比较文件扩展名, 将文件较小的复制到目标文件夹, 并删除目标文件夹相应较大的文件
 * 前置: 源文件夹, 目标文件夹都不含有子文件夹
 * 目的: 如为了降低某个资源的图库大小, 会转换图片格式, 但转换后有的图片可能更大.
 * TODO 暂不支持遍历, 暂时没有这种需求
 * @param {string} sourceDir
 * @param {string} targetDir
 * @param {boolean} isSameExtname 是否比较扩展名
 */
export function reserveSmallerFile ({ sourceDir, targetDir, isSameExtname = true }: { sourceDir: string, targetDir: string, isSameExtname?: boolean }): void {
  Promise.all([fsPromises.readdir(sourceDir), fsPromises.readdir(targetDir)]).then((toTwoDimensionalArray) => {
    let sourceFileArray = toTwoDimensionalArray[0]
    let targetFileArray = toTwoDimensionalArray[1]
    if (!isSameExtname) {
      let sourceFileNameMap: Map<string, string> = new Map<string, string>()
      let targetFileNameMap: Map<string, string> = new Map<string, string>()
      for (let i = 0; i < sourceFileArray.length; i++) {
        sourceFileNameMap.set(obtainFileName(sourceFileArray[i]), path.extname(sourceFileArray[i]))
      }
      for (let i = 0; i < targetFileArray.length; i++) {
        targetFileNameMap.set(obtainFileName(targetFileArray[i]), path.extname(targetFileArray[i]))
      }

      function innerHander (fileName: string, extname: string) {
        if (sourceFileNameMap.has(fileName)) {
          let sourceFile = fileName + sourceFileNameMap.get(fileName)
          let targetFile = fileName + extname
          let sourceFileURL = path.resolve(sourceDir, sourceFile)
          let targetFileURL = path.resolve(targetDir, targetFile)
          Promise.all([
            fsPromises.stat(sourceFileURL).then((stats) => {
              return stats.size
            }),
            fsPromises.stat(targetFileURL).then((stats) => {
              return stats.size
            })
          ]).then((fileSizeArray) => {
            let sourceFileSize = fileSizeArray[0]
            let targetFileSize = fileSizeArray[1]
            if (targetFileSize > sourceFileSize) {
              fsPromises.unlink(targetFileURL).then(() => {
                console.info(`[Info]`, `Delete "${targetFile}" in target directory!`)
                fsPromises.copyFile(sourceFileURL, path.resolve(targetDir, sourceFile))
                console.info(`[Info]`, `Copy "${sourceFile}" to target directory!`)
              })
            }
          })
        }
      }

      targetFileNameMap.forEach((value, key) => {
        innerHander(key, value)
      })
    } else {
      targetFileArray.forEach((file) => {
        if (sourceFileArray.indexOf(file) >= 0) {
          let sourceFileURL = path.resolve(sourceDir, file)
          let targetFileURL = path.resolve(targetDir, file)
          Promise.all([
            fsPromises.stat(sourceFileURL).then((stats) => {
              return stats.size
            }),
            fsPromises.stat(targetFileURL).then((stats) => {
              return stats.size
            })
          ]).then((fileSizeArray) => {
            let sourceFileSize = fileSizeArray[0]
            let targetFileSize = fileSizeArray[1]
            if (targetFileSize > sourceFileSize) {
              fsPromises.unlink(targetFileURL).then(() => {
                console.info(`[Info]`, `Delete "${file}" in target directory!`)
                fsPromises.copyFile(sourceFileURL, path.resolve(targetDir, file))
                console.info(`[Info]`, `Copy "${file}" in source directory to target directory!`)
              })
            }
          })
        }
      })
    }

  })
}

// function linkIfSameHash ({type = 'hardlink', srcPath, destPath, eachCapacity = '8'}: {
// 	type?: 'hard link' || 'symbolic link'
// 	srcPath: string
// 	destPath: string
// 	eachCapacity: number
// }) {
//
// }
// function renameToMD5 (filePath) {
//     return new Promise(resolve => {
//         md5File(filePath).then(hash => {
//             resolve(hash)
//         })
//     })
// }
//
// function renameToMD5Sync (filePath) {
//     return md5File.sync(filePath)
// }
