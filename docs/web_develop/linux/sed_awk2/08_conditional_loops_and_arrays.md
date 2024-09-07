<!--
author: 刘青
date: 2017-03-16
title: 条件、循环和数组
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

### 流控制语句
awk中的条件和循环结构的语法借鉴c语言。
```
# 判断语句
if (expression)
    action1
[else if
    action2]

[else
    action3]

if ( x==y ) {
    statement1
    statement2
}

if ( x ~ /[yY](es)?/ ) print x

# 三目运算符
grade = (avg >= 65) ? "Pass" : "Fail"

# while-loop
while (condtion)

i = 1
while ( i <= 4 ) {
    print $1
    ++i
}

# do-loop
do 
    action
while (condition)

# for-loop
for (set_counter; test_counter; increment_counter) 
    action

for (i = 1; i<= NF; i++) {
    print $i;
}

# 其他关键字
break：退出循环
continue：停止当前循环直接开始下一次循环
next：读入下一个输入行，和continue类似
exit：从主输入循环退出跳转到END中。
```

### 数组
#### 基本用法
awk中不必指定数组的大小，只需为数组指定标识符，其下标可以为字符串（关联数组）。
```
array[subscript] = value
print array[subscript]

for (k in array) {
    print array[k]
}
```

eg:
```
# test.data:
k1 55
k2 1243
k1 -333
k3 -3
k2 190

# test.awk
{
    rep[$1]++
    total[$1] += $2
}

END {
    print "Repeat count:"
    for(k in rep) {
        print k "\t" rep[k]
    }

    print "Total:"
    for(k in total) {
        print k "\t" total[k]
    }
}

# output
Repeat count:
k1  2
k2  2
k3  1
Total:
k1  -279
k2  1433
k3  -3
```

### split函数生成数组

```
numberCount = split(inputString, outputArr, separator)
```

#### 判断成员是否在数组中
关键字in可以判断
```
if(key1 in array1) 

if((i, j) in array2)
```
#### 删除数组元素
delete 关键字可以删除数组元素
```
delete array[subscript]
```

#### 多维数组
awk不支持多维数组，但是它有特定的语法模拟多维数组。
```
file_array[1,2] = $1
```
其实现原理是将下标转换为一个字符串，默认连接符是SUBSEP。

demo:
```
# 0801.data
1,1
2,2
3,3
4,4
5.5
6,6
7,7
8,8
9,9
10,10
11,11
12,12
1,12
2,11
3,10
4,9
5,8
6,7
7,6
8,5

# 0801.awk
BEGIN {
    FS = ","
    WIDTH = 12
    HEIGHT = 12
    
    for (i = 1; i<= WIDTH; ++i) {
        for(j = 1; j <= HEIGHT; ++j) {
            bitmap[i, j] = "0"
        }
    }
}

{
    bitmap[$1, $2] = "X"
}

END {
    
    for (i = 1; i<= WIDTH; ++i) {
        for(j = 1; j <= HEIGHT; ++j) {
            printf("%s", bitmap[i, j])
        }
        printf("\n")
    }
}

# output
X0000000000X
0X00000000X0
00X000000X00
000X0000X000
0000000X0000
00000XX00000
00000XX00000
0000X00X0000
00000000X000
000000000X00
0000000000X0
00000000000X
```

#### awk中可以访问的数组
- ARGV：命令行参数列表，是一个数组，下标以0开始，以ARGC-1结束；
- ARGC
- ENVIRON：系统环境变量列表，一个数组，小标是环境变量名；
