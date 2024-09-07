<!--
author: 刘青
date: 2017-1-28
title: 循环语句
type: note
source: C语言程序设计：现代方法-循环语句
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### while语句
```
while (expr) {
    statements;    
}
```

### do语句
```
do {
    statements;    
} while (expr);
```

### for语句
```
for (expr1; expr2; expr3) {
    statements;    
}
```

#### C99中的for语句
在C99中，第一个表达式可以替换为一个声明。

```
int i;
for (i = 0; i < n; i++)


for (int i = 0; i < n; i++)
```

#### 逗号运算符

```
expr1, expr2
```

它的步骤是：
1. 计算expr1~expr n-1的值，并抛弃返回值
2. 计算expr n，将其返回值作为表达式的值

```
int i, j, k;

//type1
j = 2;
k = 3;
for (i = 0; i < n ; i++) {
    ...    
}

//===
//type2
j = 2;
k = 3;
for (j = 2, k = 3, i = 0; i < n ; i++) {
    ...    
}
```

### 退出循环
- break
- continue
