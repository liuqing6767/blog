<!--
author: 刘青
date: 2017-02-06
title:  指针的高级应用
tags: 
type: note
category: clang/c_programming
status: publish
summary:
前面已经介绍了如何利用指向变量的指针作为函数的参数从而允许函数修改该变量以及对指向数组元素的指针进行算术运算来处理数组。本章继续完善指针的内容：动态存储分配和指向函数的指针。
-->

### 动态存储分配
C语言的数据结构通常是固定大小的。但是C语言支持动态存储分配：在程序执行期间分配内存单元。

#### 内存分配函数
全部在 <stdlib.h> 中：
- malloc：分配内存块不初始化
- calloc：分配内存块并对内存块清零
- realloc：调整先前分配的内存块大小

因为函数无法做到计划存储在分配的内存块中的数据结构是什么类型，所以统一返回"通用"指针类型`void *`,本质是只是内存地址。

#### 空指针
> 空指针：不指向任何地方的指针。

当调用内存分配函数找不到足够大的内存块时将返回空指针。要时刻警惕空指针。
```
p = malloc(10000);
if (p == NULL) {
    
}
// NULL 宏在很多头文件中都定义了

//可以简写为：
if (!p) {
    
}
```

### 动态分配字符串
通过动态分配字符串将字符串的长度退出到程序运行时才做决定。

- 使用malloc函数为字符串分配内存

```
void *malloc(size_t)

char *p = (char *) malloc(n + 1);
strcpy(p, "abc"); //p的前四位是：a b c \0
```

### 动态分配数组
动态分配数组会获得和动态分配字符串相同的好处。
```
int *a;
int i;
a = malloc(n * sizeof(int));
for(i = 0; i < n; i++) {
    a[i] = 0;    
}

//calloc 会初始化为 0
void *calloc(size_t member_count, size_t member_size);

//动态调整内存大小也是必不可少的：
void *realloc(void *ptr, size_t size);
// 扩展内存时realloc函数不会对新加的内容初始化；
// 如果扩展失败将返回NULL，原有内容不改变；
// 如果第一个参数为空指针，效果和malloc一样；
// 如果第二个参数为0，它将释放掉内存
```

#### -> 运算符
```
struct one{
    int a;
}

struct one = malloc(sizeof(struct one));
one->a = 1;
// ===>
(*one).a = 1;
```

### 释放内存
内存函数所获得的内存块都来自一个称为堆（heap）的存储池，其大小是有限的。

```
//内存泄漏
p = malloc();
q = malloc();

p = q;
```

C语言不提供垃圾收集器，C程序自己负责内存的回收。
```
void free(void *ptr)
```

```
// 悬挂指针
char *p = malloc(4);
...
free(p);
...
strcpy(p, "abc"); // 程序崩溃
```

### 指向函数的指针
函数占用内存单元，所以每个函数都有地址，所以指针可以指向函数。
```
#include<stdio.h>

int add (int a, int b);
int caculate(int (*f)(int, int), int a, int b);
//等价于 
//int caculate(int f(int, int), int a, int b);

int main(void)
{
    caculate((&add), 1, 3);
    return 0;
}

int add (int a, int b) 
{
    printf("a + b = %d", a + b);
    return a + b;
}
int caculate(int (*f)(int, int), int a, int b)
{
    return (*f)(a, b);
    //等价于
    //return f(a, b);
}

```


