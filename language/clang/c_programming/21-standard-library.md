<!--
author: 刘青
date: 2017-02-27
title: 标准库 
tags: 
type: note
category: clang/c_programming
status: publish
summary: 
-->

### 标准库的使用
C89有15个标准头，C99又加了9个。大多数编译器的库是其超集。

标准对库中的名字有限制：
- 不能重新定义定义过的宏
- 具有文件作用域的库名（尤其是typedef名）不能在文件层次重定义
- 由一个下划线和一个大写字母开头或两个下划线开头的标识符是为标准库保留的标识符，程序员不能使用
- 由一个下划线开头的标识符被保留用作具有文件作用域的标识符和标记
- 在标准库中所有具有外部链接的标识符被保留用作具有外部链接的标识符


C程序员经常使用带参数的宏来替代小的函数，这在标准库中很常见。
```
#define getchar() getc(stdin)

//我们可以在适当的时候删除这个宏
#undef getchar

//然后定义一个函数
int getchar(void) {
    //...
}
```

### 标准库概览
- assert.h：诊断。允许我们在程序中插入自我检查。一旦失败程序将终止
- ctype.h：字符处理。字符分类及大小写转换的函数
- errno.h：提供error number
- float.h
- limits.h：整数类型的大小限制
- locale.h：本地化
- math.h
- setjmp.h：非本地跳转
- signal.h：信号处理
- stdarg.h：可变参数
- stddef.h：常用定义
- stdio.h：输入输出
- stdlib.h：常用实用程序
- string.h
- time.h
- C99
- complex.h：复数算术
- fenv.h：浮点环境
- inttypes.h：整数类型格式转换
- iso646.h：拼写转换
- stdbool.h：布尔类型和值
- tgmath.h：泛型数学
- wchar.h：扩展的多字节和宽字符实用工具
- wtype.h：宽字符分类和映射实用工具


