<!--
author: 刘青
date: 2017-03-11
title: 了解基本操作
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

awk源自sed和grep，后两者又源自ed。awk和sed有非常多共同点：
- 调用语法： command [options] script filename
- 面向字符流：按行处理
- 使用正则表达式匹配
- 运行用户在脚本中指定指令

它们最大的不同是控制所做的工作是所用的指令。

### 命令行语法
> command [options] script inputfile

options有很多种；
script：指定要执行的命令。sed和awk都可以使用-f scriptfile来指定命令。每个指令包括两部分：
- 模式：由/分隔的正则表达式
- 过程：一个或多个将被执行的动作
inputfile：待执行的文件。成功程序每次从inputfile中读入一行，生成该行的备份再在备份上执行命令，并不影响输入文件。

#### 使用sed
> sed [-e] 'instruction' file

- '建议带上
- instruction可以有多个指令，分号分隔

eg:
```
sed 's/old_word/new_word/' input_file

# [-e] 在有多个指令时告诉sed将参数解析为指令
sed -e 's/old_word/new_word/; s/old2/new2/' input_file

# [-f] 指定scriptfile
sed -f sciptfile input_file

# [-n] 不打印输出，需要在instruction中添加p实现只打印被修改内容
sed -n -e 's/old_word/new_word/p; s/old2/new2/p' input_file
```

#### 使用awk
> awk 'instructions' files

通常情况下，awk将每个输入行解释为一条记录而将一行上的每个单词（有空格或制表符分隔）解释为每个字段。我们可以引用这些字段。

eg:
```
# 指定过程。$0 代表整行， $n 代表第n个字段。
awk '{print $1}' list

# 使用pattern对行进行过滤，没有指定过程，默认操作为打印匹配这种模式的每一行
awk '/pattern/' list

awk '/pattern/ {print $1}' list

# 指定分隔符
awk -F, '/pattern/ {print $1}' list
```

#### 同时使用sed和awk
```
sed -f script_file input_file | awk -F, '{print $4}'
```
