<!--
author: 刘青
date: 2017-1-28
title: C语言基本概念
type: note
source: C语言程序设计：现代方法-C语言基本概念
tags: 
category: clang/c_programming
status: publish
summary: 基本概念包括：预处理指令、函数、变量和语句。
-->

### 程序的编写
1. 编写 \*.c 文件；

```
#include<stdio.h>

int main(void)
{
    printf("To C, or not to C:that is the question.\n");
    return 0;
}
```
2. 预处理：预处理器执行以#开头的命令（指令）。预处理器有点想编辑器，可以给程序添加内容，也可以对程序进行修改。
3. 编译：修改后的程序进入编译器被翻译成技巧指令（目标代码）。
4. 链接：链接器将编译器产生的目标代码还需要的其他附加代码整合到一起产生最终可执行的程序。

编译和链接的命令是：
```
cc c_file

# 默认输出到a.out
cc c_file -o out_file

# 编译器除了cc，gcc是最流行的。
```

运行的话，使用 ./out_file

### 程序的一般形式
最简单的程序也依赖3个关键的语言特性：指令、函数和语句。

#### 指令
> 指令：预处理器执行的命令。

所有的指令都是以字符#开头，默认占用一行，不用分号结尾。

#### 函数
函数这个名词来源于数学，指根据一个/多个参数进行数值计算的规则。C语言中函数是用来构建程序的构建块。
main函数是非常特殊的函数，系统会自动调用其开始整个程序。
函数包括：
- 函数名
- 函数参数
- 函数返回值
- 函数体

#### 语句
> 语句：运行时执行的命令。

### 注释
- 多行： /\* comment \*/
- 单行：// comment


### 变量和赋值
程序参数输出前一般需要一系列的计算，因此需要程序执行过程中有一中临时存储数据的方法。这类存储单元被称为变量。

#### 类型
每个变量都有一个类型，说明变量存储数据的种类。

#### 声明
变量使用之前必须先声明（为编译器所做的描述）。
```
type_name variable_name;
int height;
```

#### 赋值
- 在声明时进行初始化：

```
int height = 8;
```
- 在后续中进行赋值：

```
int height;
height = 8;

int width;
width = 8;

int area = height * width;
```

### 读入输入

```
scanf(foramt_string, params_list);

int width;
scanf("%d", &width)
```

#### 常量

将不变的量作为常量是个好的习惯。

```
# 语法
#define const_name const_val

# e.g.
#define INCHES_PRE_POUND 166
weight = (volume + INCHES_PRE_POUND - 1) / INCHES_PRE_POUND;

#预处理器会将其进行预处理： 
weight = (volume + 166 - 1) / 166;
```

