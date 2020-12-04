# image-size-reducer
[简体中文](./README-zh_CN.md)

Convert to .webp to reduce size. If converted image is larger, reserve original.

**Non Recursive** now.

Maybe has issues.

## Development

1. Download Node.js, globally install `typescript`

2. Open cmd, enter project directory, execute `npm install`

3. Execute `tsc`

4. Run `scripts\install-conextmenu-100.bat` to add context menu to directory.


## Requirement

- Node.js
- Windows x64 System

## Development Plan

- long path support
- use webp-converter

## Credit

- [mime-types](https://www.npmjs.com/package/mime-types)
- [WebP](https://developers.google.com/speed/webp)
