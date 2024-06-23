<!--
author: 刘青
date: 2017-03-17
title: 函数
tags: 
category: linux/sed_awk2
status: publish
type: note
summary:
-->

awk 有许多内置函数，可分为两组：算术函数和字符串函数。

### 算术函数
- cos(x), exp(x), log(x), sin(x), sqrt(x), atans(y,x)
- int(x)：返回x的整数部分
- rand()：返回 [0, 1) 的随机数
- sand(x)：建立rand()的新的种子数。

### 字符串函数
- gsub(r, s,
  t)：使用正则表达式r对字符串t进行匹配，使用字符串s替换，返回替换的个数
- index(s, t)：返回子串t在字符串s中的位置
- length(s)：求s的长度
- match(s, r)：返回正则表达式r在s中出现的位置，或者0
- split(s, a, sep)
- sprintf(fmt, expr)
- sub(r, s, t)：在字符串t中用s替换正则表达式r的首次匹配。成功返回1，失败返回0
- substr(s, p, n)：返回字符串s中从位置p开始长度为n的子串
- tolower(s)：对所有的字符小写
- toupper(s)：对所有的字符大写

### 自定义函数
用户可以自定义函数，用C语言语法。我们通常将定义放在脚本顶部的模式操作规则之前。

eg:
```
sort.awk
# sort.awk - 对学生成绩进行排序 sort(sortedpick, NUM)
# 输入：后面跟有一系列成绩的学生姓名
# 排序函数
function sort(ARRAY, LEN, temp, i, j) { #i,j 如果不当做入参默认是全局变量
    for (i = 1; i <= LEN; ++i) {
        for (j = i+1; j <= LEN; ++j) {
                if(ARRAY[i] < ARRAY[j]) {
                    temp = ARRAY[i]
                    ARRAY[i] = ARRAY[j]
                    ARRAY[j] = temp
            }
        }
    }

    return
}

{
    for(i = 2; i <= NF; ++i) {
        grades[i-1] = $i
    }

    sort(grades, NF-1)

    printf("%s:", $1)
    for(j = 1; j <= NF-1; ++j) {
        printf("%d ", grades[j])
    }

    printf("\n")
}

# sort.data
mona 77 45 90 23 99
john 44 33 45 22 99

# output
mona:99 90 77 45 23 
john:99 45 44 33 22 
```

进一步，我们可以有一个lib，通过指定多个文件：
```
awk -f a.awk -f b.awk inputfile
```
