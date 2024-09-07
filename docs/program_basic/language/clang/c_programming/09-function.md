<!--
author: 刘青
date: 2017-1-28
title: 函数
type: note
source: C语言程序设计：现代方法-函数
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### 函数的定义和调用
```
return_type function_name([param1, [...]) 
{
    statements    
}
//函数不能返回数组

type vari = function_name(params_list)
```

### 函数声明
C语言没有要求函数的定义必须放在调用点之前。
隐式声明：但是如果这样，编译器没有关于函数的信息，就会假设函数的返回类型为默认的返回类型int，参数根据默认的实参提升。
然后编译器继续读取，到函数定义的地方，这时就抛错了。
为了解决这个问题，C语言提供了：函数声明。

> 函数声明：声明函数原型而没有完整的定义，让编译器可以正常工作。

```
return_type function_name([param1, [...]);
```

> C99中调用函数钱必须先对其进行声明或者定义。

### 形参和实参
- 形参（parameter）：出现在函数的定义中，他们用假名字表示函数调用时需要提供的值；
- 实参（argument）：出现在函数的调用中。

> C语言中，实参是通过值传递的：调用函数时计算出每个实参的值并把它赋给相应的形参。形参的变化不会影响实参。

对于数组：
```
//函数不能返回数组

// 一维数组
int sum_array(int a[], int length);

//多维数组：第一位
int sum_two_dimensional_array(int a[][d2_len], int d1_len);
```

> 数组参数是传引用：对于形参的修改会影响实参。

在C99中有变长数组的新特性：
```
int sum_array(int length, int a[length])
//简写。编译器会自动使用第一个参数代替*
int sum_array(int length, int a[*])
```

在C99中可以使用复合字面量
```
int b[] = {1, 3, 5};
total = sum_array(b, 3);

// 等价于：
total = sum_array(int[] {1, 3, 5}, 3);
```

### return语句
```
return expr;

//返回void的函数的写法可以是：
return;

//函数默认返回类型是int
```

### 程序终止
return语句可以终止当前函数，exit函数会终止程序。
```
include <stdlib.h>

statements;
...
exit(expr);

```
