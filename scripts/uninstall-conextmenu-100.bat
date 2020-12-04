@echo off

chcp 65001

%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~0 ::","","runas",1)(window.close)&&exit

REM 只需修改 shell_text
set shell_text=Reduce_Image_Size_100_Quality

set command1=reg delete "HKCR\Directory\shell\%shell_text%"

set command2=reg delete "HKCR\Directory\Background\shell\%shell_text%"


@echo on
ECHO Y|%command1%
ECHO Y|%command2%
@echo off

pause