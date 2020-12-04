@echo off
chcp 65001

%1 mshta vbscript:CreateObject("Shell.Application").ShellExecute("cmd.exe","/c %~0 ::","","runas",1)(window.close)&&exit

rem 需要修改的只有 menu_text, shell_text, bat_file
set menu_text=Reduce Image Size 100 Quality
set shell_text=Reduce_Image_Size_75_Quality
set bat_file=%~dp0\Reduce_Image_Size_75_Quality.bat


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
