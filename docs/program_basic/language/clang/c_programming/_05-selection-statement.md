<!--
author: 刘青
date: 2017-1-28
title: 选择语句
type: note
source: C语言程序设计：现代方法-选择语句
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### 逻辑表达式
逻辑表达式的值只有两个：0|1.
- 关系运算符：<, >, <=, >=
- 判等运算符：==, !=
- 逻辑运算符：!, &&, ||

### if语句
```
if (逻辑表达式) {
    statements;
}[ else {
    statements;   
}]
```

#### 条件表达式
```
expr = expr1 ? expr2 : expr3;
```

#### C89中的布尔值
C一直没有布尔类型，C89标准也没有定义布尔类型。许多程序需要变量能存储 真 或 假。一直变通的方式是：
```
int flag;

flag = 0; 
...
flag = 1;
```

但是它不能明确的表示flag赋值只能是布尔值，也没有指出0是假1是真。C89的程序员是这样做的：
```
#define TRUE 1
#define FALSE 0

flag = FALSE;
...
flag = TRUE;

if (flag) ...

if (!flag) ...

// 进一步：
#define BOOL int
BOOL flag;
```

#### C99中的布尔值
C99中提供了_Bool类型(无符号整型)。
```
_Bool flag;

flag = 0;
flag = 1 | 5;
```
C99中还提供了<stdbool.h>，提供bool宏。
```
bool flag;
flag = false;
...
flag = true;
```

### switch
```
switch (expr) {
    case expr:
        statements;
        break;
    [case expr:
        statements;
        break;]
    [ ... ]
    [default: 
        staements;
        break;]    
}
```
