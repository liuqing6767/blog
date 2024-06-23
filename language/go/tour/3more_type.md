<!--
author: 刘青
date: 2016-08-23
title: 复杂类型
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://tour.golang.org/moretypes/1
-->

我们讲了一些常规类型，包括：数字类型，字符，字符串，布尔类型等。go里面其实是有更多的类型的。

### 指针
指针保存内存地址。
- *T 是 一个T类型变量的指针，默认值为0：`var p *int`
- & 是取址符：`p = &i`
- * 符号获取地址对于的真实值
- 指针不能运算，和C不一样
```
func pointerTest() {
    i := 12
    var p *int = &i
    fmt.Println(p)
    fmt.Println(*p)
    *p = 21
    fmt.Println(p)
    fmt.Println(*p)
    fmt.Println(i)
}
```
要是学过C，这个非常好理解。

### 结构体
结构体是字段的集合。
```
//定义一个结构体，和普通变量很类似
type OneStruct struct {
    X int
    Y int    
}

func structTest() {
    //初始化一个变量，参数列表用 , 分隔
    v := OneStruct{1, 2}
    fmt.Println(v) 

    p := &v
    //使用指针变量对结构体成员进行修改
    p.X = 22

    fmt.Println(v) 

    //取值符然后调用成员
    fmt.Println((*p).X) 
    //两者是等价的
    fmt.Println(v.X)
    
    //用取值符太麻烦了，所以语言可以让我们简写 
    fmt.Println(p.X) 
}
```

### 数组
定义形式： [n]T
```
func arrayTest(){
    //声明方式
    var a [2]string
    a[0] = "Hello" 
    a[1] = "workd" 
    fmt.Println(a); 
    //引用单个成员
    fmt.Println(a[0]);
    
    //声明并赋值
    var b = [6]int{1,2,3}
    fmt.Println(b);

    //可以省略数组长度
    q := []int{1,2,3}
    fmt.Println(q)

    //对于结构体可以酱紫：
    s := [3]struct{
        i int
        b bool    
    }{
        {2, true},
        {3, false},
    }

    fmt.Println(s) //>>> [{2 true} {3 false} {0 false}]
}

```

数组语言给了两个函数
```
func printSlice(s []int) {
    //len 获取数组元素个数
    //cap 获取数组的容量
    fmt.Printf("len=%d cap=%d %v\n", len(s), cap(s), s)    
}
```

比数组更常用的是切片，数组本身是固定长度的，而切片的长度是灵活的，go将切片当做语言的特性。切片不会存储任何数据，它还是引用原数组的数据
```
func sliceTest(){
    var b = [6]int{1,2,3}
    //从下标1取到下标2
    var c = b[1:2]
    //b[begin:end] begin 不设置的话为0，end不设置的话为数组长度-1
    fmt.Println(c)
    //切片只是引用原数组
    c[0] = 10
    fmt.Println(b) //>>> [1 10 3 0 0 0]

    s := []int{1,2,3,4,5,6,7}
    printSlice(s)

    s= s[:0]
    printSlice(s) //>>> len=0 cap=7 []

    //扩容
    s= s[:4]
    printSlice(s) //>>> len=4 cap=7 [1 2 3 4]

    //截取
    s= s[2:3]
    printSlice(s) //>>> len=1 cap=5 [3]

    //扩容：截取是不可逆的，但是可以扩容
    s= s[0:5] //>>> len=0 cap=5 [3 4 5 6]
    printSlice(s)
}
```

make：切片可以使用内建函数 `make` 来创建，它会创建一个零值的数组并返回引用它的切片
````
   e := make([]int, 5)
   printSlice(e) //>>> len=5 cap=5 [0 0 0 0 0]
   
   //参数分别是 type length caption
   f := make([]int, 0, 5)
   printSlice(f) // >>> len=0 cap=5 [ ]
```

append：将多个切片（数组）进行拼接。后面的数组会追加到第一个数组中。若第一个数组长度不够，会自动扩容。
```
func append(first []T, vs ...T) []T
```

range：循环一个slice或者map，go有 range 形式：
```
var pow = []int{1,2,4,8,16}

for i, v := range pow{
    fmt.Printf("2 ^ %d = %d\n", i, v)
}
// 不要index
for _, v := range pow{
    fmt.Printf("%d\n", v)
}
//不要value
for i := range pow{
    fmt.Printf("%d\n", i)
}
```

### Map
```
func mapTest(){
    //声明而未初始化的map为 nil，不能赋值
    var m map[string]OneStruct
    //m["first"] = OneStruct{1,2}   
    fmt.Println(m)

    //声明并初始化
    var m1 = map[string]OneStruct{
        "first": OneStruct{1,1},
        "two": OneStruct{2,2},
    }
    m1["third"] = OneStruct{3, 3}
    fmt.Println(m1)

    //使用make进行初始化
    var m2 map[string]OneStruct = make(map[string]OneStruct)
    //操作：插入元素
    m2["first"] = OneStruct{1,1}
    fmt.Println(m2)
    //操作：查找元素 m[key]
    elem := m2["one"]
    //操作：查找元素 若 key存在，ok = true
    elem, ok := m2["two"]
    //操作：删除元素
    delete(m,key)
}
```

### 函数
函数也是个变量，可以像其他变量一样被当做参数传递和返回。
```
func functionTest() {
    add := func(x, y int) int {
        return x + y    
    }
    fmt.Println(add( 1, 2))
    fmt.Println(compute(add, 1, 2))

    add = functionClosure();
    fmt.Println(add(1, 2))
}

//函数参数
func compute(fn func(int, int) int, x int, y int) int {
    return fn(x, y)    
}

//函数返回值
func functionClosure() func(int, int) int {
    return func(x, y int) int {
        return x + y   
    }    
}
```
