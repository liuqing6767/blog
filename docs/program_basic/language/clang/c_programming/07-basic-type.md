<!--
author: 刘青
date: 2017-1-28
title: 基本类型
type: note
source: C语言程序设计：现代方法-基本类型
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### 整数类型

从符号角度分：
- signed
- unsigned

从长度分：
- short
- normal
- long

排列组合后就是六种：
- short int
- unsigned short int
- int 
- unsigned int
- long int
- unsigned long int

#### C99的整数类型
C99额外提供了两个标准整数类型：
- long long int
- unsigned long long int

C99标准允许在具体实现时定义扩展的数类整型。

#### 整数常量
C语言运行不同进制的整数常量：
- 十进制：0~9组成，不能0开头
- 八进制：0~7组成，0开头
- 十六进制：0~9 + A~F组成，0x开头

可以在整数常量(不区分大小写和顺序)后加字符强制编译器处理规则：
- U: unsigned
- L: long
- LL

### 浮点类型

浮点：小数点可以浮动。

根据精度不一样，可以分为：
- float
- double
- long double

### 字符类型
```
char one_char = 'A';
```

#### 字符操作
C中的字符串操作非常简单，因为C语言把字符当做小整数进行处理。
```
if ('a' <= ch && ch <= 'z') {
    ch = ch - 'a' + 'A';    
}
```

#### 转义字符
普通的字符常量是用单引号括起来的单个字符，一些特殊字符就需要转义。
- 字符转义序列：\n, \t
- 数字转义序列：
    - 八进制，不一定要用0开头 \033
    - 十六进制以\x开头

#### 从输入读取字符
- scanf, printf

```
char ch;
scanf("%c", &ch);
printf("%c", ch)
```
- getchar, putchar

```
// 上面代码等价于：
char ch;
ch = getchar();
putchar(ch);
```


### 类型转换
计算机执行算术运算时要求操作数的位数是一样的，要要求其存储方式是一样的。C语言运行在表达式中混用基本类型，当编译器可以处理时期会进行隐式转换。也运行程序员进行显示转换。
- 隐式转换：向上转换。
- 显示转换：

```
(type_name) expr
```

### 类型定义
运算符`typedef`可以定义类型。
```
#define BOOL int
//等价于：
typedef int Bool;

Bool flag
```
#### 可移植性
typedef运算符可以解决一些问题。C语言库自身使用typedef为那些可能依据C语言实现不同而不同的类型创建了类型名：以 _t 结尾。
```
#include<stdint.h>

int32_t one_int;
```

### sizeof运算符

```
unsigned long size_of_type_in_byte = sizeof(type_name);
```

参数的值也可以是常量、变量和表达式。
括号在不考虑优先级的情况下其实是可以去掉的。
C中为其设置了一个类型：size_t
