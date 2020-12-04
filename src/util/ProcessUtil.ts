/**
 * 得到第一个参数
 * 命令行参数得用双引号
 */
export function obtainFirstArg(): string {
    // args 字符串数组, 路径中的 \ 自动转为 \\
    let args = process.argv.splice(2)
    return args[0]
}
