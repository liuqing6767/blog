<!--
author: 刘青
date: 2017-2-3
title: 预处理器
type: note
source: C语言程序设计：现代方法-预处理器
tags: 
category: clang/c_programming
status: publish
summary: 
-->

> 预处理器：在编译前处理C程序的小软件。

预处理器会根据预处理指令（#开头的语句）将程序进行处理。
绝大多数宏定义的分类为：
- 预定义：#define定义一个宏，#undef删除一个宏定义；
- 文件包含：#include将指定文件包含到程序中；
- 条件编译：#if、#ifdef、#ifndef、#elif、#else、#endif 根据测试的条件确定是否将一段文本块包含到程序中

规则有：
- 指令都以#开始
- 在指令的符号之间可以插入容易受凉的空格或水平制表符
- 指令总是在第一个换行符出结束，不然需要使用 \ 结尾
- 指令可以出现在程序的任何地方
- 注释可以和指令放在同一行

### 宏定义
#### 简单的宏定义
```
#define 标识符 替换列表

e.g:
#define N 100;
int a[N]
/*
预处理器会将其处理为：
int a[100]
*/

#define LOOP for(;;)
LOOP {
    printf("%s", "123");
    break;    
}
/*
预处理器会将其处理为：
for(;;) {
    printf("%s", "123");
    break;    
}
*/
```

#### 带参数的宏定义

```
#define 标识符(x1, x2,..., xn) 替换列表

e.g:
//在宏名字和左括号之间必须没有空格，不然预处理器会当做简单宏
#define MAX(x, y) ((x)>(y)?(x):(y))
i = MAX(j+k, m-n);
j = MAX(i++, j)
/*
预处理器会将其处理为： 
i = ((j+k)>(m-n)?(j+k):(m-n));
j = ((i++)>(j)?(i++):(j)); //悲剧了
*/

#define IS_EVEN(N) ((N)%2==0)
if (IS_EVEN(i)) i++;
/*
预处理器会将其处理为：
if(((i)%2==0)) i++;
*/

#define getchar() getc(stdin)
```

> 如果宏参数没有传递，宏依旧可以被调用，只是不做任何替换。

使用带参数的宏的优点和缺点：
- 程序可能更快
- 宏更“通用”
- 编译后的代码通常变化会很大
- 宏参数没有类型检查
- 无法用一个指针指向一个宏

#### \#运算符
宏定义中可以包括#，预处理器会将宏的一个参数转化为字符串字面量。
```
#define PRINT_IN(n) printf(#n " = %d \n", n)
PRINT_INT(i/j);
/*
预处理器会将其处理为：
printf("i/j" " = %d\n", i/j);
*/
```

#### \#\#运算符
\#\#可以将两个标记粘合在一起成为一个标记。

```
#define MK_ID(n) i##n

int MK_ID(1), MK_ID(2);
/*
预处理器会将其处理为：
int i1, i2;

一个有用的方式是：
#define GENERIC_MAX(type)       \
type type##_max(type x, type y) \
{                               \
    return x >ｙ? x : y;        \
}                               \

GENERIC_MAX(float)
GENERIC_MAX(int)
```

#### 宏的通用属性
- 宏的替换列表可以包括对其他宏的调用

```
#define PI 3.14159      f1
#define TWO_PI (2*PI)   f2

//预处理器会先处理f2，发现还有宏，进一步处理
```

- 预处理器只会替换完整的记号，而不会替换记号的判断。

```
#define SIZE 256

int BUFFER_SIZE;
if (BUFFER_SIZE > SIZE) {}
```

- 宏定义的作用范围通常到出现这个宏的文件末尾
- 宏不可以被定义两遍，除非新的定义和旧的定义是一样的。
- #undef 取消定义
```
#undef 标识符
```

#### 宏定义中的圆括号 
宏定义加括号的规则：
- 如果宏的替换列表中有运算符，那么始终要将替换列表放在括号；
```
#define TWO_PI (2*3.1415)
```
- 如果宏有参数，每个参数每次在替换列表中替换时都要放在括号中
```
#define SCALE(x) ((x)*10)
```

倒不是语言强制要求的，如果不加括号，后果可能是悲剧的。
```
#define TWO_PI 2*3.1415
#define SCALE(x) (x*10)

con = 360/TWO_PI;      
//=>
con = 360/2*3.1415;

j = SCALE(i+1);
//=>
j = (i+1*10) 
```

### 条件编译
#### #if指令和#endif指令
```
#define DEBUG 1
#if DEBUG
printf("Value of i: %d \n", i);
#endif
```

#### #defined指令
```
#if defined(DEBUG)  //括号是可以省略的
...
#endif
```

#### #ifdef指令和#ifndef指令
```
#ifdef 标识符  (强等于上面的宏定义)
...
#endif
```

#### #elif指令和#else指令
```
#if 表达式1
...
#elif 表达式2
...
#else
...
#endif
```

### 其他指令
#### #error指令
```
#if INT_MAX < 10000
#error int type is too small
#endif

//编译器会直接停止编译抛出错误
```
