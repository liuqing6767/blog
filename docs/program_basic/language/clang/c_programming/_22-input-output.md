<!--
author: 刘青
date: 2017-02-27
title: 输入/输出
tags: 
type: note
category: clang/c_programming
status: publish
summary: C语言的输入/输出库是标准库中最大且最重要的部分。
-->

### 流 stream
> 流：表示任意输入的源或任意输出的目的地。

许多小型程序都是通过一个流（通常和键盘相关）获得全部的输入，并且通过另一个流（通常和屏幕相关）写出全部的输出。

较大规模的程序可能会需要额外的流。这些流常常表示存储在不同介质上的文件，但也很容易和不存储文件的设备相关联。本章集中讨论文件。

> 文件指针：C程序中对流的访问是通过文件指针实现的，类型为 FILE *。


<stdio.h\>提供了3个标准流。这3个标准流可以直接使用，我们不需要进行声明、打开和关闭：
- stdin：标准（键盘）输入；
- stdout：标准（屏幕）输出；
- stderr：标准（屏幕）错误；

上述流都有默认位置，可以通过重定向改变：
- 输入重定向：demo < in.bat。使用in.bat文件代替键盘输入
- 输出重定向：demo \> out.bat。使用out.bat文件代替屏幕输出

<stdio.h\>支持两种类型的文件：
- 文本文件：字节表示字符。内容分为若干行，使用特殊字符结尾。文件没可以有一个特殊的"文件结尾"标记。
- 二进制文件：字节不一定表示字符，字节组还可以表示其他类型的数据。

### 文件操作
简单性是输入输出重定向的魅力之一：不需要打开、关闭或执行其他的任何显式文件操作。可是无法做到同一时间读入两个文件或者写入两个文件。<stdio.h\>提供了文件操作的方法。

#### 打开文件

```
FILE *fopen(const char * restrict filename, const char * restrict mode);
```

`restrict` 是C99的关键字，表明变量所指向的字符串的内存单元不共享。

文本文件的mode有如下选项：
- r：只读
- w：写入（不要求文件存在）
- a：追加（不要求文件存在）
- r+：打开文件用于读和写，从文件头开始
- w+：打开文件用于读和写（如果文件存在就截去）
- a+：打开文件用于读和写（如果文件存在就追加）

二进制文件的mode有如下选项：
- rb：只读
- wb：写入（不要求文件存在）
- ab：追加（不要求文件存在）
- r+b|rb+：打开文件用于读和写，从文件头开始
- w+b|wb+：打开文件用于读和写（如果文件存在就截去）
- a+b|ab+：打开文件用于读和写（如果文件存在就追加）

#### 关闭文件

```
int fclose(FILE *stream);
//成功返回0，失败返回定义了的宏
```

#### 为打开的留附加文件

```
FILE * freopen(const char * restrict filename, const char * restrict mode, FILE * restrict stream)
//打开filename，将文件内容追加到stream追加到文件后，返回stream文件指针
```

#### 临时文件
现实世界中的程序经常需要产生临时文件，即只在程序运行时存在的文件。<stdio.h\>提供了两个函数：

```
//wb+模式创建临时文件，文件一直存在直到程序结束或主动关闭。无法知道文件名，无法让文件永久保存。
FILE *tmpfile(void);

//产生一个文件名。如果s为空，变量名返回，不然变量名存储到s中
char *tmpnam(char *s);
```

#### 文件缓冲
从磁盘读写数据是很缓慢的，解决方案就是缓冲，将读写流存储在内存的缓冲区域。一次打的块移动要比多次小字节英东要快很多。
<stdio.h\>中的函数会在缓冲有用时自动进行缓冲操作，我们不需要关心。只有在极少情况下我们需要主动调用。

```
//当程序想问句中写输出时，数据通常先放入缓冲区中。当缓冲区满了或者关闭文件是，缓冲区会自动清洗。fflush可以主动清洗，如果stream为空，则清洗全部。
int fflush(FILE *stream);


void setbuf(FILE * restrict stream, char * restrict buf);

int setvbuf(FILE * restrict stream, char * restrict buf, int mode, size_t size);
```

#### 其他文件操作
```
int remove(const char *filename);

int rename(const char *old, const char *new);
```

### 格式化的输入/输出流
使用格式串来控制读、写。

#### Xprintf 函数
```
// 将格式化后的数据写入 stream
int fprintf(FILE * restrict stream, const char * restrict stream, ...);

//将格式化后的数据写入 stdout
int printf(const char * restrict format, ...);

//eg:
printf("Total: %d\n", total);
```

#### Xscanf 函数
```
// 从fp得到数据并格式化赋值给其后变量
int fscanf(FILE * restrict strea, const char * restrict format, ...);

// 从stdin得到数据并格式化赋值给其后变量
int scanf(const char * restrict format, ...);

// eg:
scanf("%d%d", &i, &j);
```

#### 检测文件结尾和错误条件

当Xsacnf没有返回希望的存入数据项的个数时，程序一定出错了。一般有三种情况：
- 文件末尾：在未完成所有匹配就遇到文件结尾了；
- 读取失败：函数不能从流中读取数据；
- 匹配失败：

每个流都有 `错误指示器` 和 `文件末尾指示器`。当流打开时会清空这些指示器，当错误发生时会设置。

```

void clearerr(FILE * stream);

int feof(FILE *stream);

int ferror(FILE *stream);

```

### 字符的输入/输出
#### 输出函数

```
int fputc(int c, FILE *stream);
// 将 c 写入 stream
int putc(int c, FILE *stream);

// 将 c 写入 stdout
int putchar(int c);
```

#### 输入函数

```
int fgetc(FILE *stream);
int getc(FILE *stream);
int getchar(void);

// 将从流中读取的字符放回流。在输入过程中需要往前多看一个字符时就很有用
int ungetc(int c, FILE *stream);

while(isdigit(ch = getc(fp))) {
    ...
}

ungetc(ch, fp);
```

### 行的输入/输出
#### 输出函数

```
int fputs(const char * restrict s, FILE * restrict stream);
int puts(const char *s);
```

#### 输入函数

```
char * fgets(char * restrict s, int n, FILE * restrict stream);
char *gets(char *s);
```

### 块的输入/输出
```
// 将内存中的数组复制给流
size_t                              //实际写入的数组元素个数
fwrite(
    const void * restrict ptr,      //数组地址
    size_t size,                    //每个数组元素的大小
    size_t nmemb,                   //要复制的数组个数
    FILE * restrict stream);        //目标流对象

// 从流读入数据赋值数组
size_t fread(
    void * restrict pr, 
    size_t size, 
    size_t nmemb, 
    FILE * restrict stream);
```

### 文件定位
每个流都有相关联的文件位置。打开文件是默认在文件的起始位置，追加模式则在末尾。在执行读/写操作时文件位置会自动推进，实现按照顺序贯穿整个文件。
有5个函数可以支持跳跃访问：

```
int fgetpos(FILE * restrict stream, fpos_t * restrict pos);

int                     // 正常返回0
fseek(
    FILE * stream,      // 目标流 
    long int offset,    // 为偏移量
    int whence);        // 参照物：SEEK_SET：文件的起始；SEEK_CUR；SEEK_END

// 返回当前文件位置 如果是二进制文件则是字节数，但文本流不一定
long int ftell(FILE *stream); 

// 等价于 fseek(fp, 0L, SEEK_SET) + 清除错误指示器
void rewind(FILE *stream);

// 对于超大文件，文件位置不能存储在long int 中，可以使用以下两个函数：
int fsetpos(FILE *stream, const fpos_t *pos);
int fgetpos(FILE *stream, const fpos_t *pos);
```

### 字符串的输入/输出
使用字符串作为流读写数据。
#### 输出函数

```
int sprintf(char * restrict s, const char * restrict format, ...);

// C99
int snprintf(char * restrict s, size_t n, ... const char * restrict format, ...);
```

#### 输入函数

```
int sscanf(cosnt char * restrict s, const char * restrict format, ...)
```
