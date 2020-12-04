import path from 'path'

/**
 * 获取不包含扩展名的文件名
 * @param fileUrl 文件路径
 */
export function obtainFileName (fileUrl: string): string {

  return path.basename(fileUrl, path.extname(fileUrl))
}

/**
 * 获取包含扩展名的文件名
 * @param fileUrl 文件路径
 */
export function obtainFileNameWithExtension (fileUrl: string): string {
  return path.basename(fileUrl)
}

/**
 * 获取文件或文件夹所在的文件夹名
 * @param fsPath path
 */
export function obtainParentFolderName (fsPath: string): string {

  let dirname = path.dirname(fsPath)
  let folderArray = dirname.split(path.sep)
  return folderArray[folderArray.length - 1]

}

export function obtainFolderName (dirname: string): string {
  let folderArray = dirname.split(path.sep)
  return folderArray[folderArray.length - 1]
}

/**
 * reexport path.extname
 * [Lyne] 可以这样直接重导出, 但没有任何封装的, 也不是为了可读性和维护性的, 确实没必要
 */
// export let extname = path.extname