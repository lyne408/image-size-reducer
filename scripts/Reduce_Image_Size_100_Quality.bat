@echo off
rem color 0a	

chcp 65001

rem add to reg system, use bat
rem "D:/Workspaces/front-end/project/image2html/image2html.bat" "%V"

rem [Lyne] this is wrong reg data, because  reg.exe does not recognize node, use absolute path
rem node D:/Workspaces/front-end/project/image2html/src/image2html "%V"

rem add to reg system, use node
rem "D:\Program_Files\nodejs-14.3.0\node" "D:\Workspaces\front-end\project\images2html/src/images2html"  "%V"

rem registery Data add "", so .bat not add "" to %1

node "%~dp0/../dist/ReduceImageSize100Quality" %1

pause