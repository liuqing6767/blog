<!--
author: 刘青
date: 2016-08-22
title: 流控制语句
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://tour.golang.org/flowcontrol/1
-->

编程语言语句的执行只有三种顺序，选择，循环，和默认的顺序。

### 循环
循环的构造，GO 里面只有 `for` 循环。
```
for i := 0; i< 10; i++ {
        
}

//简洁的语法，和 while一致
sum := 1
for sum < 1000{
    
}

//最简洁的写法
for {
    
}
```
可以发现，一共仨部分，由分号分隔：
- 初始化语句：在第一个迭代前执行。常常会有变量的声明，该变量的作用域仅限于for
  循环内部语句。（可选）
- 条件语句：在每个迭代前进行验证；
- 后置语句：在每个迭代后执行。（可选）

### 选择
#### if-else
```
if x < 0 {

} else {
    
}

// 也可以有初始化语句
if v := mathPow(x, n); v < lim {
    
}
```
#### switch
```
switch os :=runtime.GOOS; os {
    case "darwin":
        fmt.Println("OS X.")
    case "linux":
        fmt.Println("Linx")
    default:
        fmt.Printf("%s.", os)    
}    

t := time.Now()
//没有条件的switch，就是简洁版的 if - else
switch {
    case t.Hour() < 12:
        fmt.Println("moring")    
    case t.Hour() < 17:
        fmt.Println("afternoon")
    default:
        fmt.Println("evening")
}
```
- 不需要break；
- 可以有初始化语句
- 可以没有条件，这样就永远执行switch代码

#### defer
延迟函数会让函数的执行延迟到包裹其函数返回前。延迟的函数会被放进栈中，当返回时后进先出的执行
```
func defersTest() {
    fmt.Println("counting") 
    
    for i := 0; i < 3; i++ {
        defer fmt.Println(i)    
    }   

    fmt.Println("done")
}
// >>> counting done 2 1 0
```
