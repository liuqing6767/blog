<!--
author: 刘青
date: 2017-2-2
title: 字符串
type: note
source: C语言程序设计：现代方法-字符串
tags: 
category: clang/c_programming
status: publish
summary: 
-->

### 字符串字面量
> 字符串字面量（string literal）：用一堆双引号括起来的字符序列。

- 转义序列：和字符一样。
- 延续字符串字面量：如果字符串字面量太差而无法放置在一行内，重要把第一行用\结尾就可以另起一行。

#### 存储原理
> C语言把字符串字面量当做字符数组来处理。编译器将其看做是char *类型的指针。长度是字符串字面量长度+1，最后一位存储的是'\0'，表示结束。

### 字符串变量
有些编程语言为字符串变量提供专门的string类型。C语言采用了不同的方式：这样抱着字符串是以空字符结尾的，任何一位字符数组都可以用来存储字符串。
```
#define STR_LEN 80
...
//声明一个长度为80的字符串
char str[STR_LEN + 1];

//初始化
char date1[8] = "June 14";
//等价于 字符数组，未赋值的数组元素默认值为'\0'
char date1[8] = {'J', 'u', 'n', 'e', ' ', '1', '4'}; 
```

#### 字符数组和字符指针
```
char date[] = "June 14";
char *date = "June 14";
```

因为数组和指针紧密关联，两者和类似，但是差异很大：
- 它们都可以匹配类型为字符数组或者字符指针的形参；
- 数组可以任意修改数组元素，而指针指向的是字符串字面量，不可修改；
- 数组时，data是数组名，指针时，date是变量。变量可以指向其他的字符串。

### 字符串的读和写
```
#define MAX 10
int main()
{
    char str[MAX];

    //scanf 会跳过头尾的空字符，以空白字符结束，包括空格和换行。
    scanf("%s", str);
    printf("%s\n", str);
    //printf可以指定长度
    printf("%.6s\n", str);
    puts(str);

    //gets 不会跳过头尾的空字符，只以换行结束读入
    gets(str);
    printf("%s\n", str);
    printf("%.6s\n", str);
    puts(str);

    return 0;
}
```

### C语言的字符串库
> C语言中将字符串当做数组来处理，所以语言本身提供的字符串操作不多。
```
char str1[10], str2[10];
//初始化操作
str1 = "abc";

//赋值操作是非法的
str2 = str1;

//比较操作
str1 == str2 //比较的是内存地址
```

> string类库提供函数进行字符串操作。

```
//复制：将s2指向的字符串复制到s1指向的数组中直到遇到s2的第一个空字符
char *strcpy(char *s1, const char *s2);

//更安全的操作：
char *strncpy(char *s1, const char *s2, int char_size);

//长度
size_t strlen(const char *a);

//追加：将s2的内容追加到s1并返回s1
char *strcat(char *s1, const char *s2);
//更安全的操作：
char *strncat(char *s1, const char *s2, int char_size);

//比较：字典顺序
int strcmp(const char *s1, const char *s2);
```

### 字符串数组
二维字符数组是一种方式，但是会浪费很多空间，因为它的列数是对齐的。
```
char plants[][8] = {
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", 
    "Saturn", "Uranus", "Neptune", "Pluto"
};
```

另外一种方式是字符指针数组：
```
char *plants[] = {
    "Mercury", "Venus", "Earth", "Mars", "Jupiter", 
    "Saturn", "Uranus", "Neptune", "Pluto"
};
```


