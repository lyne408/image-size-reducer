REM [Lyne] 基本原理: .bat 是可执行脚本

rem cmd /k str, 不适合接收参数, 不做解释.

rem 获取 node.exe 所在目录
rem for /F %%i in ('where node') do ( set node_path=%%i)
rem reg add "HKCR\Directory\shell\images_to_webp_100\command" /ve /t REG_SZ /d "\"%node_path%\node.exe\"  \"%~dp0\ \src\images-to-webp-100\" \"%%V\""

rem [Lyne] 推荐使用 bat, 不像上面的语句, 不会依赖 node 的安装目录

@echo off
chcp 65001

%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~0 ::","","runas",1)(window.close)&&exit

rem 需要修改的只有 menu_text, shell_text, bat_file
set menu_text=Reduce Image Size 100 Quality

set shell_text=Reduce_Image_Size_100_Quality

set bat_file=%~dp0\Reduce_Image_Size_100_Quality.bat

set command1=reg add "HKCR\Directory\Background\shell\%shell_text%" /ve /t REG_SZ /d "%menu_text%"

set command2=reg add "HKCR\Directory\shell\%shell_text%" /ve /t REG_SZ /d "%menu_text%"

set key_name1="HKCR\Directory\Background\shell\%shell_text%\command"
set value=/ve
set type=/t REG_SZ

set reg_arg_trans=\"%%V\"
set bat_file_trans=\"%bat_file%\"

set data=/d "%bat_file_trans% %reg_arg_trans%"
set command3=reg add %key_name1% %value% %type% %data%

set key_name2="HKCR\Directory\shell\%shell_text%\command"
set command4=reg add %key_name2% %value% %type% %data%

rem [Lyne] 就这样先定义命令, 在一个地方执行, 便于统一显示
@echo on
ECHO Y|%command1%
ECHO Y|%command2%
ECHO Y|%command3%
ECHO Y|%command4%
@echo off


pause
