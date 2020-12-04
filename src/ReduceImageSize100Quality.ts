import { reserveSmallerFile } from './util/FSUtil'
import { imagesToWebp } from './util/ImageUtil'
import { getFirstArg } from './util/ProcessUtil'

// 7z 对 webp 等同于没有压缩

export function reduceImageSize100Quality () {
  let sourceDir = getFirstArg()
  let options = `-q 100`
  imagesToWebp({
    sourceDir,
    options,
    success: ({ sourceDir, targetDir }) => {
      reserveSmallerFile({ sourceDir, targetDir, isSameExtname: false })
    }
  })
}

reduceImageSize100Quality()