<!--
author: 刘青
date: 2017-03-05
title: 错误处理
tags: 
category: clang/c_programming
status: publish
type: note
summary: 商业用途的程序必须非常强壮 —— 能从错误中恢复正常而不崩溃。
-->

### <assert.h\>：诊断

```
void assert(scalar expression);
```

assert定义在<assert.h\>中。它使程序可以监控自己的行为，并尽早发现可能会发生的错误。

assert本身是一个宏，但是按照函数方式设计的，有一个参数，表明是一个
`断言`。每次执行assert时都会检查其参数的值。当值不为0时一切正常，否则想stderr写一条消息，然后调用abort函数退出。

```
int main()
{
     int i = 0;
     for(i; i< 10; i++) {
         printf("%d\n", i);
         assert(i < 5);
     }
}

// d1.o: d1.c:9: main: Assertion `i < 5' failed.
```

C99对其进行了修改：
- assert 的参数不必须是int，可以是scalar
- 输出格式改变

assert的缺点是会引入额外的检查，加长运行时间。可以全局关闭它：

```
#define NDEBUG
//在其前定义
#include <assert.h>
```

### <errno.h\>：错误
标准库中的一些函数通过向<errno.h\>中声明的int类型errno变量存储一个错误码（正整数）来表示有错误发生。

大部分errno的变量的函数集中在<math.h\>。

最常用的两个 errno：
- EDOM：定义域错误。传递给函数的一个参数超出了函数定义域。比如对负数开方。
- ERANGE：取值范围错误。比如函数的返回值太大。

错误打印函数有：
```
void perro(const char *s);      // 来自 <stdio.h>

char *strerror(int errnum);     // 来自 <string.h>
```

```
// 事先得清空
erno = 0;
y = sqrt(x);
if (errno != 0) {
    perror("sqrt error");
    exit(EXIT_FAILURE);
}
```

### <signal.h\>：信号处理
C语言中的信号又两种：
- 外部事件发生：许多操作系统都允许用户中断或者终止正在运行的程序
- 错误发生

大多数信号是异步的，可能在任何时候发生。需要独特的方式来处理它们。
 
 <signal.h\>中定义了一系列的宏，表示不同的信号：
 - SIGARRT：异常终止
 - SIGFPE：在算是运算中发生错误
 - SIGILL：无效指令
 - SIGINT：中断
 - SIGSEGV：无效存储访问
 - SIGTERM：终止请求

#### signal 函数
 ```
 void (
    *signal(
        int sig,                    //指定的信号
        void (*func)(int)           //处理的函数
    )
)  (int);

signal(SIGINT, handler);
 ```

C语言中预置了两个处理函数，用宏表示：
- SIG_DEL：使用默认的方式处理
- sig_ign：忽略

#### raise 函数
主动的触发信号。

```
int raise(int sig);
```

### <setjmp.h\>：非局部跳转
通常情况下函数会返回到它被调用的位置。goto语句只能跳转到同一个函数内的某个标记处。<setjmp.h\>可以使一个函数直接跳转到另一个函数而不需要返回。

- setjmp宏：标记程序中的一个位置，参数是一个jmp_buf类型的变量；
- longjmp函数：跳转到标记处。

这个强大的机制有很多种潜在的用途，但主要被用于错误处理。

```
#include <setjmp.h>
#include <stdio.h>

jmp_buf env;
void f1(void);
void f2(void);

int main(void)
{
    if(setjmp(env) == 0) {
        printf("setjmp returned 0 \n");
    }else {
        printf("Program terminates:longjmp called\n");
        return 0;
    }

    f1();
    printf("Program terminates normally \n");
    return 0;
}

void f1(void) {
    printf("f1 begin \n");
    f2();
    printf("f1 returns \n");
}

void f2(void){
    printf("f2 begin \n");
    longjmp(env, 1);
    printf("f2 returns \n");
}

/**
setjmp returned 0 
f1 begin 
f2 begin
Program terminates:longjmp called
 */
```
