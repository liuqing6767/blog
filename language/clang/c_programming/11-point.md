<!--
author: 刘青
date: 2017-1-31
title: 指针
type: note
source: C语言程序设计：现代方法-指针
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### 指针变量
大多数现代计算机都将内存按字节分割，每个字节可以存储8位信息。
内存地址是连续的。
每个字节都有唯一的地址。
可执行程序由代码（原始程序中对应的机器码）和数据（原始程序中的变量）两部分构成。
程序中的每个变量占有一个或多个字节内存，把第一个字节的地址称为变量的地址。

> 指针就是地址，指针变量就是存储地址的变量。

```
//声明一个指向int类型的对象的指针
int *p;

int i, j, a[10], b[20], *p, *q;

int int_var = 1;
//&是寻址运算符
int *point_int_var;
point_int_var  = &int_var; //将对象地址赋值给指针变量
//*是间接寻址符
*point_int_var = int_var;  //将对象赋值给指针变量间接值，我们说*point_int_var 是 int_var的别名。

//两者都可以赋值成功。但是对一个未初始化的指针变量直接使用第二种方式可能造成程序崩溃。因为指针的默认值是无法确定的。

//*是间接寻址运算符，是&的逆运算
int_var = *point_int_var;
```

### 指针作为参数
```
void decompose(double x, long *int_part, double *frac_part)
{
    *int_part = (long)x;
    *fract_part = x - *int_part;    
}

double data = 1.23;
long int_part = 1;
double frac_part = 1;
decompose(data, int_part, frac_part);
```

#### 常量指针
在形参前加上const关键字可以表明函数不会改变指针参数所指向的对象。
```
void f(const int *p)
{
    *p = 0; /* wrong */    

    //以下代码可以运行，但是不能达到预期的效果，对形参的修改不会影响实参
    int a = 0;
    p = &a;
}

void f(int * const p)
{
    int j;
    *p = 0; /* legal */
    
    p = &j; /* wrong */    
}
```

### 指针作为返回值
```
int * max(int *a, int *b)
{
    return *a > *b ? a : b;    
}

in  *p, i, j;
...
p = max(&i, &j);
```


### more
```
int *p = &i;
//对比
int *p;
*p = i;

//两者好像是不一致的。原因在于，在声明中*的作用是告诉编译器其是一个指针，而赋值语句中时间接寻址运算符。
```
