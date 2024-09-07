<!--
author: 刘青
date: 2017-2-5
title: 结构、联合和枚举
type: note
source: C语言程序设计：现代方法-结构、联合和枚举
tags: 
category: clang/c_programming
status: publish
summary: 介绍3中新的类型：结构、联合和枚举
-->

### 结构变量
到目前为止数组是唯一被介绍过的数据结构：
- 数组所有元素具有相同的类型
- 通过整数下标选择数组元素

结构：
- 结构的成员可以是不同的类型
- 每个结构成员都有名字，可以通过键去取值

```
//每个零件都有编号、名称和剩余数量

//声明结构
struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part1, part2;


//声明并初始化
struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part1 = {52, "Disk", 10}, 
  part2 = {914, "Printer", 5};
//也可以：
struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part1 = {.number = 52, .name = "Disk", .on_hand = 10}, 
  part2 = {.numbe = 914, "Printer", 5}; /* .成员名称 叫做指示符，没有指定的话编译器将其当做前面成员的在声明中的后一个成员*/

//对结构的操作
printf("Part number: %d\n", part1.number);
part1.number = 258;
part1.on_hand++;
scanf("%d", &part1.on_hand);

part1 = part2;
```

语法说明：
- struct{...}指明了类型
- part1和part2是具有这种类型的变量
- 结构成员在内存时顺序存放的
- 每个结构代表一种新的作用域，元素成员不会和在此作用域内的名字冲突


### 结构类型
前面说的结构变量有一个问题：

```
struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part1;
struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part2;
```

两个变量是不兼容的。

解决这个问题有两种方式：

- 声明一个结构标记：

``` 
struct Part {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
};
// 声明其类型的变量
struct Part part1, part2;

//可以将两者同时声明:
struct Part{
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} part1, part2;
```

- 定义结构类型

```
typedef struct {
    int number;
    char name [NAME_LEN + 1];
    int on_hand;    
} Part;

struct Part part1, part2;
```

#### 将结构作为参数和返回值

将结构当做参数或者返回值都是返回结构中成员的副本，会有不小的系统开销。传递指针可以避免这种开销。

```
void print_part(struct part p) {...}

struct part build_part(int number, const char* name, int on_hand)
{
    struct part p;
    
    p.numbe = number;
    strcpy(p.name, name);
    p.on_hand = on_hand;
    
    return p;    
}
```

C99中有一个复合字面量的新特性：
```
print_part((struct part) {528, "Disk drive", 10});

print_part((struct part) {  
    .on_hand = 528, 
    .name = "Disk drive", 
    .number = 10
});
```

结构体和数组可以相互嵌套：
```
#include <stdio.h>

#define FIRST_NAME_LEN 10
#define LAST_NAME_LEN 10

struct PersonName {
    char first[FIRST_NAME_LEN + 1];
    char middle_initial;
    char last[LAST_NAME_LEN + 1];
};

struct Student {
    struct PersonName name;
    int id, age;
    char sex;    
} student1, student2;

int main(void)
{
    struct Student student_list [100] = {
        { {"f1", '1', "l1"}, 1, 11, 'g'},
        [1] = { .name = {"f2", '2', "l2"}, .id = 2, .age = 11, .sex = 'g'},
        [2].sex = 'b', [2].name.first = "f3", 
    };

    printf("%s \n", student_list[1].name.first);

    return 0;
}
```


### 联合

- 由一个或者多个不同类型的成员构成
- 便为其作为联合中最大的成员分配足够的内存空间
- 联合的成员在这个空间内彼此覆盖（它们共享一个内存空间，新值覆盖旧值）

```
union {
    int i;
    double d;    
} u;

//只能初始化第一个
union {
    int i;
    double d;    
} u =  {0};

//C99中可以：
//可以初始化指定的那一个
union {
    int i;
    double d;    
} u = {.d = 10.0};
```

联合的作用是用来节省空间。
假设打算设计id结构包含通过礼品册售出的商品的信息。礼品册有三种商品：书籍、杯子和衬衫。每件商品都含有：
- 库存量
- 价格
- 商品类型相关的其他信息：
    - 书籍：书名、作者、页数；
    - 杯子：设计；
    - 衬衫：设计、可选颜色、可选尺寸。

```
struct catalog_item {
    int stock_number;
    float price;
    int item_type;
    char title[TITLE_LEN + 1];
    char author[AUTHOR_LEN + 1];
    int num_pages;
    char design[DESIGN_LEN + 1];
    int colors;
    int sizes;
}

//没有问题，但是浪费内存

struct catalog_item {
    int stock_number;
    float price;
    int item_type;
    union {
        struct {
            char title[TITLE_LEN + 1];
            char author[AUTHOR_LEN + 1];
            int num_pages;
        } book;
        struct {
            char design[DESIGN_LEN + 1];
        } mug;
        struct {
            char design[DESIGN_LEN + 1];
            int colors;
            int sizes;
        } shirt;
    } item;
}

//这只是一个示例范围内嵌套在结构内部的联合是很困难的
//然而，C标准中提到了一种特殊清空：联合的成员为结构，而这些结构最初的一个或者几个成员是相匹配的（对应位置类型兼容，名称可以不一样）时，如果当前某个结构有效，则其他结构中匹配的成员也有效。
```

再举例说明联合的用法：
```
typedef union {
    int i; 
    double d;    
} Number;

Number number_array[1000];
number_array[0].i = 5;
number_array[1].i = 8.5;

//进行改良
#define INT_KIND 0
#define DOUBLE_KIND 1
typedef struct {
    int kind;
    union {
        int i;
        double d;    
    } u;
} Number;

n.kind = INT_KIND;
n.u.i = 82;

void print_number(Number n)
{
    if (n.kind == INT_KIND) {
        printf("%d", n.u.i);    
    } else {
        printf("%g", n.u.d);    
    }
}
```

### 枚举
对于某个变量只有可枚举的值，枚举是一种比较好的数据结构。
```
//定义两个枚举变量，它们的可用值为枚举常量
enum (CLUBS, DIAMONDS, HEARTS, SPADES) s1, s2;

//声明枚举标记
enum suit (CLUBS, DIAMONDS, HEARTS, SPADES);
suit s1, s2;

//定义类型名
typedef enum (CLUBS, DIAMONDS, HEARTS, SPADES) Suit;
Suit s1, s2;
```

在系统内部，C语言会把枚举变量和常量作为整数来处理。从0开始依次递增。如果想要改变：
```
enum suit (CLUBS = 1, DIAMONDS, HEARTS, SPADES);

//将其当做整型使用是合法的
int i;
enum (CLUBS = 1, DIAMONDS, HEARTS, SPADES) s;

i = DIAMONDS;   // i = 2;
s = 1;          //s是1(CLUBS)
s++;            //s是2(DIAMONDS)
i = s + 2;      // i = 4;
```
