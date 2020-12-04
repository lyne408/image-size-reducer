import { reserveSmallerFile } from './util/FSUtil'
import { imagesToWebp } from './util/ImageUtil'
import { getFirstArg } from './util/ProcessUtil'

export function reduceImageSize75Quality () {
  let sourceDir = getFirstArg()
  let options = `-q 75`
  imagesToWebp({
    sourceDir,
    options,
    success: ({ sourceDir, targetDir }) => {
      reserveSmallerFile({ sourceDir, targetDir, isSameExtname: false })
    }
  })
}

reduceImageSize75Quality()