<!--
author: 刘青
date: 2017-02-26
title:  底层程序设计
tags: 
type: note
category: clang/c_programming
status: publish
summary: 前面讲的是C语言中高级的、与机器无关的特性。C语言有底层的特性，合理使用会让编码更高效。
-->

### 位运算符
C一共提供了6个运算符：
- 移位 >> << 
- 按位求反 ~
- 按位与 &
- 按位或 |
- 按位异或 ^

```
unsigned short i, j, k;
i = 13;             // 00001101
j = i << 2;         // 00110100
j = i >> 2;         // 00000011

j = ~i;             // 11110010
k = i & j;          // 00000000
k = i | j;          // 11111111

k = i ^ j;          // 11111111
```

用位运算符访问位：
- 将第k位设置为1：i |= 1 << k;
- 将第k位设置为0：i &= ~(1 << k);
- 测试第k为是否被设置：if ( i && 1 << k )

用位运算符访问位域：
- 修改位域：先使用按位与清除位域，在使用按位或更新位域
- 获取位域：先进行右移让目标位域在最右端，再用&提取位域


### 结构中的位域
对于int, unsigned int和signed int类型变量作为结构体成员时可以将其声明为域位以节省空间。 
```
//对于日期，其存储形式可以是：YYYYYYY MMMM DDDDD

struct file_date {
    unsiged int day: 5;
    unsiged int month: 4;
    unsiged int year: 7;
}
```

