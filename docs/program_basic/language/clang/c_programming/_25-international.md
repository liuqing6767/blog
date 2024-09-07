<!--
author: 刘青
date: 2017-03-05
title: 国际化特性
tags: 
category: clang/c_programming
status: publish
type: note
summary: 
-->

许多年来C语言并不十分适合非英语国家使用。C最初假定字符都是单字节，并且所有的机器都能识别C的关键字。但是这个假设有时候是不成立的。
在C89中专家们又添加了新的特性和函数库使C语言更加国际化。

### <locale.h\>：本地化
提供了允许程序员针对特定的『地区』调整程序行为的函数。
标准库中依赖地区的部分包括：
- 数字量的格式：比如294.11和294,11
- 货币量的格式
- 字符集
- 日期和时间的表示形式

#### 类别 category
通过修改地区，程序可以改变它的行为来适应世界的不同区域。这可能会影响库的许多部分，我们可以通过宏来指定受影响的类别：
- LC_COLLATE：影响两个字符串比较函数的行为
- LC_CTYPE：影响<ctype.h\>中的函数
- LC_MONETRAY：影响由localeconv函数返回的货币格式信息
- LC_NUMERIC：影响格式化输入/输出函数使用的小数点字符以及<stdlib.h\>中的数值转换函数
- LC_TIME：影响strftime函数
- LC_ALL

#### setlocale 函数
修改当前的地区

```
char *setlocale(int category, const char *locale);
```

#### localeconv 函数
得到更信息的本地化设置信息。

```
struct lconv *localeconv(void);
```

### 多字节和宽字符
程序适应不同地区的最大的难题之一是字符集的问题。因为定义已经把char类型值的大小限制为一个字节，通过改变char类型的含义来处理更大的字符集显然是行不通的。对于字符集扩展，C提供了两个方法：
- 多字节字符: 用一个或多个字节表示一个扩展字符。
- 宽字符: 宽字符是一种整数，其值代表字符。

more：需要的时候再学习。
