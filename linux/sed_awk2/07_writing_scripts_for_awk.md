<!--
author: 刘青
date: 2017-03-15
title: 编写awk脚本
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

> awk是一个很好的小型语言。

awk程序有自己的规则，必须了解它们。 《The AWK Programming Languag》是一个很好的教材。

eg
```
# hello world

echo 'Hello world' > test
awk '{print "Hello world"}' test

awk '{print}' test

awk 'BEGIN {print "Hello world"}'
```

awk 是输入驱动的，它会读入所提供的脚本，检查指令的语法并在每个输入行上执行。

### awk程序设计模型
awk给程序员提供了基本模型：主输入循环。
- 读入前例程：BEGIN，可选，在读入前执行一次。
- 循环例程：每读入一行执行一次：验证模型；
- 读入后例程：END，可选，在读入后执行一次。

eg
```
awk '/^$/ {print "blank line"}' input_file

vim awkscr:
/[0-9]+/ {print "integer"}
/[A-Za-z]+/ {print "string"}
/^$/ {print "blank line"}

awk -f awkscr input_file
```

对于script文件，awk可以用`#`开头作为注释。

awk假设输入行是有结构的，使用分隔符分隔。提供了每列的引用方式：
- $0：整行
- $n：第n列

```
awk '{print $1, $2, $3}' input_file 
```

可以指定分隔符：
```
# -F 指定分隔符
awk -F "\t" '{print $1, $2, $3}' input_file 

# 在BEGIN中指定系统分隔符
 awk 'BEGIN {FS = "n"} {print $1, $2, $3}' input_file 

# FS可以指定多个（正则表达式），匹配时会使用 最左边最长的非空的不重叠的子串
 awk 'BEGIN {FS = "[':\t]"} {print $1, $2, $3}' input_file 
```

可以使用表达式过滤输入行：
```
# 匹配有1的行
awk '/1/ {print $1, $2, $3}' input_file 

# 匹配第2列有1的行:~
awk '$2 ~ /1/ {print $1, $2, $3}' input_file 

# 匹配第2列没有1的行:!~
awk '$2 !~ /1/ {print $1, $2, $3}' input_file 


# 匹配正则表达式
awk '/1?(-| )?/ {print $1, $2, $3}' input_file 
```

### awk支持的语言特性
既然说awk是编程语言，我们看看其支持的语言特
- 字符串型常量表达式转义序列
    - \a：报警符
    - \b：退格键
    - \f：走纸符
    - \n：换行符
    - \r：回车
    - \t：水平制表符
    - \v：垂直制表符
    - \ddd：将字符表示为1到3位八进制
    - \xbex：将字符表示为十六进制
    - c
- 字符串连接操作符：空格
```
z = "Hello" "World"
// z = "HelloWorld"
```
- 引用字段操作符： $
- 算术运算符：+, -, *, /, %, ^, **
- 赋值运算符： ++， --， +=， -=， *=， /=, %=, ^=, **=

```
# 打印空行行数
awk '/^$/{x++} END {print x}' input_file 

# 计算平均成绩
awk '{total = $2 + $3 + $4; print $1, total/3}' input_file
```
- 可写系统（内置）变量
    - FS：field sperator，默认为空格
    - RS：record sperator ，默认为 \n
    - OFS：output field sperator，默认为空格
    - ORS：output record sperator ，默认为 \n
- 只读系统（内置）变量
    - NF：number of fields
    - $[n]
    - NR: number of fields (当前处理的行的个数)

    ```
    # data.txt
    10000
    125     Market          -123.22
    126     Hardware Store  -35.22
    127     Video Store     -45.22

    # commands.awk
    BEGIN {FS = "\t"}
    NR == 1 {
        print "Begin: \t" $1
        # 记录第一条
        balance = $1
        # 跳出
        next
    }
    {
        print $1 $2 $3
        print balance += $3
    }
    ```
- 关系操作符： <, >, <=, >=, ==, !=, ~, !~
```
$5 ~ /MA/ {print $1 "," $2}
```
- 布尔操作符：||, &&, !
```
NF == 6 && NR > 1 {commands}
ls -l $* | awk 'NR != 1 {print $5 "\t" $9; sum += $5; ++filenum} END {print "End\t" sum "\t" filenum }'
```
### 格式化打印
printf (for mat-expression [, arguments])。语法和c语言的printf一致。

### 向脚本传递参数
参数传递形式为 k=v
脚本内部就可以直接使用k

```
awk 'script' var=value inputfile
awk 'script' var=value var2=value2 inputfile
```
