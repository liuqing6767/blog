<!--
author: 刘青
date: 2017-1-31
title: 指针和数组
type: note
source: C语言程序设计：现代方法-指针和数组
tags: 
category: clang/c_programming
status: publish
summary: 当指针指向数组元素时，C语言允许对指针进行算术运算（+和-）。通过这种运算我们可以用指针代替数组下标对数组进行处理。
-->

### 指针的算术运算
C语言支持3种运算：
- 指针加上整数；
- 指针减轻整数；
- 两个指针相减

```
int a[10], *p;
//p指向a的首元素的首地址
p = &a[0];
//对p赋值，同时也改变a[0]的值
*p = 5;

int *q;
q = p + 3;  //q 指向a[3]

int *w;
w = q - 1;  //w 指向a[2]

int i  = q - w; //i = 1

int index = 0;
a[index++] = index;
//等价于
*p++ = index;
//等价于
*(p++) = index;
```

#### 指向复合常理的指针
```
int *p = (int []) {3, 5, 3, 6, 4};
//等价于
int a[] = {3, 5, 3, 6, 4};
int *p = &a[0];
```

### 用数组名作为指针
> 可以用数组的名字作为指向数组第一个元素的指针。也可以将指针看做数组名进行取下标操作。
```
int a[10];

a[0] = 7;
//等价于
*a = 7;

a[0 + 5] = 6;
//等价于
*(a + 5) = 6
```

> a[i] === *(a + i)

### 指针和多维数组
> 数组其实是内存连续的。

```
#define ROW 2
#define COL 2

int main(void)
{
    int a[ROW][COL] = {1, 2, 3, 4};
    int i, j;
    for(i = 0; i < ROW; i++) {
        for(j = 0; j < COL; j++) {
            printf("%d ", a[i][j]);
        }
    }

    int *k;
    for(k = &a[0][0]; k <= &a[ROW - 1][COL - 1]; k++) {
        printf("%d ", *k);
    }

    int *p;
    for(p = &a[1][0]; p < COL + &a[1][0]; p++) {
        printf("%d ", *p);
    }
    //等价于：
    for(p = a[1]; p < COL + a[1]; p++) {
        printf("%d ", *p);
    }
    return 0;
}
```
