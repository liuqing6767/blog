<!--
author: 刘青
date: 2016-09-05
title: 并发
tags: 
category: golang/doc
status: publish
summary: 
type: translate
source: https://tour.golang.org/concurrency/1
-->

### Goroutines
> Goroutines:一个 Go 运行时管理的轻量级线程。

goroutines 的语法很简单： `go f([parmas])`。
```
package main

import (
    "fmt"
    "time"
)

func say(s string) {
    for i := 0; i < 5; i++ {
        time.Sleep(100 * time.Millisecond)
        fmt.Println(s)  
    }    
}

func main() {
    go say("world") 
    say("hello")   
    //>> world hello world hello world hello world hello world hello
}
```

f的验证在当期的go进程中，但是执行在新的进程中。goroutines运行在同一个地址空间，所以共享的内存必须做成同步。go对于这个本身有很好的基础架构，`sync`包也有有用的资源。

### 管道
> 管道：有类型的导管，通过管道符 `<-` 发送和结束值。

```
func sum(s []int, c chan int) {
    sum := 0
    for _, v := range s {
        sum += v
        fmt.Println("sum", v, sum)
    }    

    c <- sum
}

func main() {
    c := make(chan int)
    s := []int{1,2,3, 4, 5}
    go sum(s[:len(s)/2], c)
    go sum(s[len(s)/2:], c)
    x, y := <-c, <-c
    fmt.Println(x, y)
}
/*
sum 3 3
sum 4 7
sum 5 12
sum 1 1
sum 2 3
12 3

可以发现它们不并行运算的(这个不应该吧...)
*/

```

管道的未来并发时保证数据的一致性的。在发送者或接受者没准备好时赋值操作会被阻塞。这样goroutines在不需要额外的锁或者条件变量。

管道可以设置缓存的长度
```
func bufferdChannel() {
    //第二个参数为缓存的长度
    ch := make(chan int, 2)
    ch <- 1    
    ch <- 2
    //再放进去就会造成死锁
    //ch <- 3
    fmt.Println(<-ch)
    //这时候可以放了
    ch <- 3
    fmt.Println(<-ch)
    fmt.Println(<-ch)
    //再取也会造成死锁
    //fmt.Println(<-ch)
}
```

管道可以被关闭，使用`close`函数。
```
func closeTest() {
    ch := make(chan int ,2)

    ch <- 1
    x, isOpen := <-ch
    fmt.Println(x, isOpen) //>>> 1 true

    ch <- 2
    close(ch)
    x, isOpen = <-ch
    fmt.Println(x, isOpen) //>>> 2 true

    x, isOpen = <-ch
    fmt.Println(x, isOpen) //>>> 0 false

    //不能向关闭了的管道赋值
    //ch <- 3 
}
```

管道不要求一定被关掉，不像文件；
管道应该被发送者关闭，不是接受者，向被关闭了的管道赋值会有警告

### Select
`select` 语句让 goroutine 在多通信操作是进行等待，它会一直阻塞，直到它的一个`case`可以运行。当有多个可以选择时，它会随机选一个。
```
func selectTest() {
    c := make(chan int)
    quit := make(chan int)
    go func() {
        for i := 0; i < 10; i++ {
            fmt.Println(<-c)   
        }
        quit <- 0
    }()
    fibonacci(c, quit)
}
//-> 0 1 1 2 3 5 8 13 21 34

func fibonacci(c, quit chan int) {
    x, y := 0, 1
    for{
        select {
        case c <-x:
            x, y = y, x+y
        case <-quit:
            fmt.Println("quit")
            return    
        }    
    }        
}

```

### sync.Mutex
> Mutex: mutual exclusion,相互排斥。

在goroutines 管道在通信方面做得很好，可是如果我们经济效益保证goroutine可以在访问同一个变量时没有冲突呢？

供提供了 `sync.Mutex`来提供该能力，它有两个函数: `Lock`, `Unlock`
```
type SafeCounter struct {
    v map[string]int
    mux sync.Mutex    
}


func (c *SafeCounter) Value(key string) int {
    c.mux.Lock()
    defer c.mux.Unlock()    
    return c.v[key]
}
func (c *SafeCounter) Inc(key string) {
    c.mux.Lock()
    c.v[key]++
    c.mux.Unlock()    
}

func mutexTest() {
    c := SafeCounter{v: make(map[string]int)}
    for i :=0; i< 1000; i++ {
        go c.Inc("somekey")    
    }

    time.Sleep(time.Second)

    fmt.Println(c.Value("somekey"))
}

```
