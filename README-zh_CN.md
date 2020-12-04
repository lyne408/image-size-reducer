# image-size-reducer
[English](./README.md)

## 介绍

- 仅为了减少图片大小
- 仅采用无损转换
- 仅支持 Windows x64

## 前置

- Node.js
- Windows x64 System

## 使用

## 开发背景

许多资源都有图库(如图片预览, 示例等), 图库本身是资源的描述之一(非文字描述).
保存资源应该保存其描述, 所以应该保存其图库.
有些图库中的许多图片采用 PNG 等格式, 压缩率并不高, 图片很大, 占用较多磁盘空间, 在保存资源到云盘, 也占用更多网络带宽. 对于某些非会员就限速的云盘, 不方便.
所以需要降低图片大小的程序.


## 机制

本着用户体验第一的原则, 仅采用**无损转换**的方案.
目前压缩比较高的, 也支持无损压缩的图片格式里, WebP 是良好的选择.

程序运行时, 首先将一个文件夹内的图片转为 WebP 格式, 转换完成后, 会与原文件比较大小, 如果转换后的 WebP 图片大小大于转换之前的图片, 就保留原图片.

JPEG 采用有损压缩, 许多时候, 使用 100 质量选项将 JPEG 图片转为 WebP 格式, 图片会增大.
PNG 采用无损压缩, WebP 的压缩比高于 PNG, 许多时候, 使用 100 质量选项将 PNG 图片转为 WebP 格式, 图片会减小.

这并不是确定的, 所以转换完成后, 只保留较的图片.

## 开发计划

- long path support, 暂时不知道怎么解决.
- use webp-converter, 似乎没有必要.

## 鸣谢
- [mime-types](https://www.npmjs.com/package/mime-types)
- [WebP](https://developers.google.com/speed/webp)