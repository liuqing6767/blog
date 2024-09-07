<!--
author: 刘青
date: 2017-1-31
title: 使用gdb调试C代码
type: note
tags: 
category: clang
status: publish
summary: 在Windows中调试C代码有VC，Linux中其实有不逊色的gdb。
-->

在Linux下运行C代码出现bug时会在同级目录下生成core.*文件。gdb通过这个文件进行调试。

### core.*文件的生成
若是没有生成core.*文件：
```
#查看配置 若是0为未打开，若是unlimited才打开了。
ulimit -c

#临时打开
unlimit -c unlimited

#临时关闭
unlimit -c 0

#将配置加入到 /etc/profile中可永久生效。
```

### 打开调试器

```
#编译代码 -g 指明需要调试信息
gcc source.c -g -o source.out

#运行代码
./source.out

#当产生问题想调试时可以：
gdb ./source.out core.*

可以看到版权信息和程序信息
```

### 在gdb中交互
```
#help 查看帮助信息
help

#list 查看所载人的文件
l

#breakpoint 设置断点
b 3 #在第二行末尾结束

#info查看断点信息
info b

#run 运行代码
r #从开头运行代码到断点前

#print 打印变量
p var

#next 单步执行不进入函数
n

#step 单步执行进入函数
s

#continue 恢复程序运行
c
```
