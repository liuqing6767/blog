<!--
author: 刘青
date: 2016-08-17
title: 基础：包，变量，函数 
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://tour.golang.org/basics/1
-->

### 包
> 每个Go程序都是由包(packages)组成的。

程序的运行入口是包 `main` 。你会有一个包的名字为 main，对其进行 git install
是会在bin文件中生成可执行文件，而非main包名时，之后在pkg生成 .a 文件。

包名就是引入路径的最后一个元素。

#### 引入包
```
# 引入一个
import "fmt"

# 再引入一个
import "math"

# 也可以同时引入多个，两者是等价的
import (
    "fmt"
    "math"
)

```

#### 变量作用域
包里面的变量的作用域是通过命名来区分的：
- 首字母小写的变量只能在包内被访问
- 首字母大写的变量可以被其他包访问


### 函数
```
func add(x int, y int) int {
    return x + y    
}

func function_name([形参名 形参类型 [, 形参名 形参类型]]) [返回类型] {
    statments
    [return ??]    
}
```

- 参数：如果所有的参数的类型都一样，可以只在最后指定，包括形参和返回参数。比如 `func add(x, y int)`
- 返回值：可以有多个返回值，需要在返回类型列表中指定，return 用 `,` 分隔；
- 返回值：如果在返回参数列表中指明参数名，那么return 语句就可以不包括变量列表。

```
func swap(a, b int) (x, y int) {
    x = b
    y = a
    return    
}

# 等价于

func swap(a, b int) (int, int) {
    return b, a
}
```

### 变量
- 变量通过 `var` 关键字进行声明，类型在最后。 比如 `var isRight, isError bool`
- 变量可以放在包级别，也可以放在函数级别
- 变量可以在声明时赋值，这时类型就可以忽略了。`var i, j int = 1, 2` 和 `var i, j = 1, 2` 是等价的。
- :=简洁语法：在函数内部，当可以确定类型时， `:=` 是可以省略 `var`
  关键字的，如 `k := 3`。它实际上是一个类型推论

#### 基本数据类型
- bool
- string
- int [u]int8 [u]int16 [u]int32 [u]int64 uintptr
- byte (等价于 uint8)
- rune (等价于 int32，代表一个Unicode代码位 )
- float32 float64
- complex64 complex128

变量分几个等级，有的是在包内，需要引入。

int，unit和uintptr类型是跨平台的，在32位的机器上和在64位的机器上长度是不一样的。要是没有特定的理由，不要指定类型的长度。


#### 变量的默认值
每个类型的变量要是没有有明确的初始值，它们会被初始化为 `零值`。
- 数字类型： 0
- 布尔类型： false
- 字符串类型： ""

#### 类型转换
go 里面不能默认的转换，不然就会出错。转换使用转换函数T(V)，会将 v 转化为类型
T。
```
var i int = 42;
var f float64 = float64(i)
```

#### 常量
所谓常量，是不能修改的变量
常量使用关键字 `const` 进行定义。可以是字符，字符串，布尔类型和数字。不能使用
:= 简洁语法。
数字类型的常量是高精度的，为指明类型时由上下文决定。

-----------
包、变量和函数的内容大概就是这么多。和其他的语言有类似的，有不同的。比较着学习吧。

所有的示例代码在 workspace/grammar/chapter01.go 中。
