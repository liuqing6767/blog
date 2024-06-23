<!--
author: 刘青
date: 2016-08-27
title: 函数和接口
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://tour.golang.org/methods/1
-->

Go中没有类，但是你可以在类型上定义函数。
（类的）方法是有唯一特定接受者参数的函数。就好像是在OOP中obj.method() 转换为
function(obj)。
函数的参数的类型只能是定义在同一个包中。

### 传值和传引用
```
func main() {
    v := Vertex{3, 4}
    //fmt.Println(Abs(v))

    valueReceiverTest(v)
    fmt.Println(v) //>>> {3, 4}

    pointerReceiverTest(&v)
    fmt.Println(v) //>>> {5, 4}
}

type Vertex struct {
    X, Y float64    
}

//当传值时，参数是个副本，其被修改但是不影响外界的变量
func valueReceiverTest(v Vertex, i float64) {
    v.X = v.X + i
}

//当使用指针传引用，值本身被改变
func pointerReceiverTest(v *Vertex, i float64) {
    //直接使用指针获取结构体成员是go语言支持的简便方式
    v.X = v.X + i
    //两者是等价的
    (*v).X = (*v).X + i
}
```

使用指针参数有两个原因：
- 函数可以修改参数的值；
- 避免每次函数调用产生的参数副本，当参数是大型结构时更高效。

### 函数和方法
方法（fucation）是写在类里面的函数（method）。Go里面有类似的语法。
```
//当第一个参数是指针时，可以将其放到前面
func (v *Vertex) pointerReceiverIndirection(i float64) {
    v.X = v.X + i
}

//当第一个参数不是指针时，也可以将其放到前面
func (v Vertex) valueReceiverIndirection(i float64) float64{
   return v.X + i
}

func main() {
    v := Vertex{3, 4}

    (&v).pointerReceiverIndirection(1)
    fmt.Println(v) //=> {4, 4}

    v.pointerReceiverIndirection(1)
    fmt.Println(v) //=>{5, 4}

    result := v.valueReceiverIndirection(1)
    fmt.Println(result) //=> 6

    result = (&v).valueReceiverIndirection(1)
    fmt.Println(result) //=>6
}
```

我们可以发现，对于结构体而言，传进去的参数是值还是引用并不重要，Go会智能的处理.


### 接口
> 接口类型：一系列方法签名的集合。

接口是go里面实现继承的方式，它可以重载类型的函数。
- 接口的实现是隐含的，只要类型（type）有和某个接口相同的函数就可以实现该接口
- 可以得到变量的值和接口类型
- 空接口是一种特殊的接口
- switch 可以和 接口的type 一起使用
- 接口的存在一部分原因为了重载

```
package main

import (
    "fmt"
    "math"
)

//为非本地类型起别名
type MyFloat float64

type Abser interface {
    Abs() float64
}

func (f MyFloat) Abs() float64 {
    if f < 0 {
        return float64(-f)    
    }
    return float64(f)
}


func(v *Vertex) Abs() float64 {
    return math.Sqrt(v.X * v.X + v.Y * v.Y)    
}

func main() {
    f := MyFloat(-math.Sqrt2)
    fmt.Println(f);
    fmt.Println(f.Abs())   
    
    //声明一个接口类型的变量
    var a Abser; 
    //MyFloat 实现了 Abser
    //应该类型通过实现一个接口的函数来实现它，不需要使用关键字implement
    a = f
    fmt.Println(a.Abs())   

    //接口也是有值的，它是一个元组(value, type)
    fmt.Printf("%v, %T \n", a, a) //>> -1.4142135623730951, main.MyFloat5

    v := Vertex{3, 4}
    //不使用接口时也是可以用的
    fmt.Println(v.Abs())   
    // Vertex 实现接口 Abser
    a = &v
    fmt.Println(a.Abs())   

    fmt.Printf("%v, %T \n", a, a) //>> &{3 4}, *main.Vertex

    var empty Abser
    //空对象
    fmt.Printf("%v, %T \n", empty) //>> <nil>, %!T(MISSING)
    //会报运行时错误
    //empty.Abs()

    //值非空，类型空
    fmt.Printf("%v, %T \n", f) //>> -1.4142135623730951, %!T(MISSING) 

    //空接口，没有任何函数的接口，可以被任何类型实现，常用来处理未知类型的值
    var i interface { }
    i = 4
    fmt.Printf("%v, %T \n", i) //>> 4, %!T(MISSING)  

    //类型断言的语法和map的获取值的语法相似 value, ok := i.(T)
    //如果断言成功，value被正常赋值，ok为true，不然value为T的零值
    r, ok := i.(int)
    fmt.Println(r, ok) //>>> 4, true
    r1, ok := i.(float64)
    fmt.Println(r1, ok) //>>> 0, false

    //可以得到接口的类型，用在switch中
    switch v := i.(type){
        default:
            fmt.Printf("%T\n", v)
    }

    //Stringer 是最常用的接口，里面有一个函数是String
    /**
    type Stringer interface {
        String() string    
    }
    */
    p1 := Person{"aaa", 111}
    p2 := Person{"bbb", 11}
    fmt.Println(p1, p2)

    b1 := Person{"b1", 111}
    b2 := Person{"b2", 11}
    fmt.Println(b1, b2)

    //Errors接口是用来处理错误的
    /*
    type error interface {
        Error()    
    }
    */
    //更多常用包我们在3.\*中继续
}

type Boy struct {
    Name string
    Age int        
}

type Person struct {
    Name string
    Age int        
}
//对类型 Person 的String进行重载
func (p Person) String() string {
    return fmt.Sprintf("%v %v", p.Name, p.Age)
}

//对类型 Boy 类型 的String进行重载
func (p Boy) String() string {
    return fmt.Sprintf("%v %v", p.Name, p.Age)
}
```
