<!--
author: 刘青
date: 2017-03-18
title: "底部抽屉"
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

> 底部抽屉：上面的抽屉经常使用所以很熟悉，而底部的则要进一步去了解，有时候它们更有用。

### getline 函数
getline 用于从输入（正常输入|文本输入|管道输入）中读取另一行。和next()不同，getline得到下一行当不改变脚本的控制。返回值可能是： - 1 如果能够督导一行
- 0 如果读到文件末尾
- 1 遇到错误

**getlne 看起来是个函数，但是不能用圆括号**

```
$1 ~ /MA/ {
    getline     # 得到下一行
    print $1    # 打印新行的值
}

/^LINE/ {
    print
        while (getline > 0) {
            commandList = commandList $0
        }
}

# 从文件中读取
getline < "file_name"

# 从管道中读取
”who am i“ | getline

# 将读入赋值给其他变量
getline input # 读入下一行并赋值给input

”date +‘ %a, %h, %d, %Y’“ | getline today # 得到今天
```

### close 函数
用于关闭打开了的文件|通道。使用的原因有：
- 系统有最大同时打开文件数
- 一个程序有最大同时打开文件数
- 为了得到下一个管道

```
{
    some processiong of $0 | "sort > tmpfile"
}

END {
    close ("sort > tmpfile") 
        while ((getline < "tmpfile") > 0 ) {
            do more work
        }
}
```
### system 函数
执行一个表达式给出的命令，返回命令的退出状态。

```
BEGIN {
    if (system("mkdir dale") != 0) {
        print "Command Failed"
    }
}
```

### 将结果输出到文件
```
print ”some infomration“ > "filePath"
```
