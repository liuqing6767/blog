<!--
author: 刘青
date: 2017-03-13
title: 编写sed脚本
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

sed 可以将类似于vi编辑器中山东的操作过程提取出来转换成一个非手动的过程。

sed工作有三个基本原理：
- 脚本中的所有编辑命令都将依次应用于每个输入行；

```
# 对于行
pig is not cow

# 对于指令集：
s/pig/cow/g
s/cow/horse/g

# 结果是：
horse is not horse

# 对于指令集
s/cow/horse/g
s/pig/cow/g

//结果是:
cow is not horse
```

- 命令应用于所有的行（全局的），除非寻址限制了受编辑命令影响的行；
    - 没有指定地址：命令应用于每一行；
    - 有一个地址：命令应用于与这个地址匹配的任意行；
    - 由逗号分隔的两个地址：应用于两个地址中间的行；
    - 地址后面有!：应用于除这个地址外的其他地址

```
# 默认是全局
s/CA/California
# 等价于 (???没有g好像只替换每一行的第一个匹配成功字符串)
s/CA/California/g

# 匹配包含Sebastopol 的行
/Sebastopol/s/CA/California/g

# 指令 d 是删除的含义
# 删除所有的行
d
# 只删除第一行
1d
# 删除最后一行
$d
# 正则表达式提供地址（包裹在 //中）删除空行
/^$/d
# 删除从50行开始的行
50,$d
# 删除从第一行到 第一个空行
1,/^$/d

# 删除指定范围内的更准确的细节：
1,8 {
    /^$/d
}
// {必须在行尾，}必须在行头，都没有空格
```
- 原始的输入文件未被改变，编辑命令修改了原始行的备份并发到标准输出。
