@echo off

chcp 65001

node "%~dp0/../dist/ReduceImageSize75Quality" %1

pause