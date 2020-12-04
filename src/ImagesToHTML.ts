/**
 * @deprecated
 */
import { imagesToHTML } from './util/ImageUtil'
import { getFirstArg } from './util/ProcessUtil'

function getImageDir () {
  return getFirstArg()
}

export function imagesToHTMLProgram () {
  let imageDir = getImageDir()
  let argObj = {
    sourceDir: imageDir
  }
  imagesToHTML(argObj)
}

imagesToHTMLProgram()