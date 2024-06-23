<!--
author: 刘青
date: 2017-03-14
title: 基本sed命令
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

sed一共有25个命令。这里介绍d（delete），a（append），i（insert），c（change）, s(replace)。

**行地址对于任何命令都是可选的**，语法为：
```
# 两个地址确定
[address1, address2]command

# 当行地址
[line-address]command

# 同一个地址应用多个分组
address {
    command1
    command2
    ...
}
```

**使用 `#` 进行注释**。

### replace

```
[address]s/pattern/replacement/flags
# 默认界定符是/，也可以指定为其他任意字符
```

其中flags可以为下面中的一个或组合：
- n：1-512的数字，表示对文本模式中指定模式的第n次出现的情况进行替换
- g：全局替换，没有g的只替换行第一次出现
- p：打印模式空间的内容
- W file：将模式空间写入文件file中

其中replacement可以为：
- 正常字符串
- &：用正则表达式匹配的内容进行替换
- \n：匹配第n个字符串，在pattern中使用“\(”和"\)"进行替换
- \：对特殊字符 & \等进行转义

eg
```
# test.data
Column1*Column2>Column3*Column4
# 执行
sed 's/*/>/2' test.txt 
# 得到
Column1*Column2>Column3>Column4

# test.data
See Section 19.2
# 执行
sed 'See Section [1-9][0-9]*\.[1-9][0-9]*/(&)/' test.txt
# 得到
(See Section [1-9][0-9]*\.[1-9][0-9]*/(&)/)

# test.data
A:B
2:1
# 执行
sed 's/(.*):(.*)/\2:\1/' test.data
# 得到
B:A
1:2
```

### delete
如果行匹配这个地址，那么就删除整行，而不只是删除行中匹配的部分。不允许在被删除的行上进一步操作。

```
address/d
```

eg
```
sed '/^$/d'
```

### append, insert, change

```
[line-address]a\
text

[line-address]i\
text

[line-address]c\
text
```

eg
```
# test.data
Hi, all:

LiuQing

# 执行
sed '/LiuQing/a\
My Addre\
England' test.txt
# 得到
Hi, all:

LiuQing
My Addre
England


# 执行
sed '/LiuQing/i\
Your' test.txt
# 得到
Hi, all:

Your
LiuQing


# 执行
sed '/LiuQing/c\
LQ' test.txt
# 得到
Hi, all:

LQ


# 在第一行插入内容
sed '1i\
第\
一\
行' inputFile

# 在最后一行追加内容
sed '$a\
last line' inputFile
```
