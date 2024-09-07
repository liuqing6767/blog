<!--
author: 刘青
date: 2016-04-27
title: PHP核心：内存管理
tags: interal_of_php memory_management
category: php/manual
status: draft
summary: 
-->

Zend 引擎中的内存管理真的很简单。所有的内容就是一些API及这些API后面的原理。

### [内存管理基础](http://php.net/manual/en/internals2.memory.management.php)
引擎的内存管理被当做特性进行实现对于像PHP这样的系统非常的重要。我们不讨论引擎的内存管理的具体特性和性能优化，只提供一些基础知识来更好的理解这些特性，也介绍在PHP使用中涉及到的术语和特性。

内存管理最重要的特性是**跟踪分配**。跟踪分配允许内存管理器避免内存泄漏。当在debug模式下构建PHP时，内存泄漏将被报告。
即便有了内存的跟踪分配这个高可用特性，开发人员也不应该懈怠，而是应该在部署代码之前竭尽全力去避免内存泄漏。内存泄漏在SAPI环境中很快就会成为一个大的问题。

另外一方面，内存管理器的一个功能就是可用强制限制每个PHP实例的内存使用。如果一下代码在运行时内存溢出了，说明它有问题。因此对内存的限制对于语言来说不是一个限制，在产品中也十分成熟。开发环境，内存限制可以在代码失去控制后简单的将其停止，在生产环境中也是如此。

PHP的内存管理API看起来有点像libc的malloc实现。

主要的内存API：

| 原型      |     描述|
| :-------- | --------|
| void *emalloc(size_t size)|分配size位的内存 |
| void *ealloc(size_t nmemb, size_t size)|为nmenb元素分配size位的缓冲区并确保初始化 |
| void *erealloc(void *ptr, size_t size)|对由emalloc创建缓冲区ptr重新调整到size |
| void efree(void *ptr)|清空由emalloc分配的缓冲区ptr |
| void *safe_emalloc(size_t nmemb, size_t size, size_t offset)|分配缓冲区来存放每块大小为 size 字节的 nmemb 块，并附加 offset 字节。类似于 emalloc(nmemb * size + offset)，但增加了针对溢出的特殊保护。 |
| char *estrdup(const char *s)|分配一个可存放 NULL 结尾的字符串 s 的缓冲区，并将 s 复制到缓冲区内。 |
|char *estrndup(const char *s, unsigned int length)|类似于 estrdup，但 NULL 结尾的字符串长度是已知的。|
**内存分配失败不会返回NULL, 引擎会直接抛错。**

有些内存泄漏不可避免。有些类库在进程的最后释放它们的结构体，这个是在一些情况下很常见，也可接受。

使用--enable-debug 参数来在debug环境下执行代码，可以看到内存泄漏的报告。

### [数据持久化](http://php.net/manual/en/internals2.memory.persistence.php)
>数据持久化：将任何数据从当前的请求中保存下来。

引擎的内存管理非常关心请求范围内的内存分配，但这个不是在任何场景下总是适合。扩展的类库有时会要求将内存持久化。
一个内存持久化的常见用法就是持久化数据库连接。

以下的函数都有额外的持久化参数，当值为false时，引擎会使用常规的分配器，也不会考虑持久化。当内存被分配位持久化类型后，系统分配器被调用，绝大多数情况下他们还是不能返回空指针。

| 原型      |    描述 |
| -------- | -------- |
| void *pemalloc(size_t size, zend_bool persistent)  |分配size位的内存|
|void *pecalloc(size_t nmemb, size_t size, zend_bool persistent)|分配nmemb个size位长度的元素并进行初始化|
|void *perealloc(void *ptr, size_t size, zend_bool persistent)|清空由pemalloc分配的缓冲区ptr|
|void pefree(void *ptr, zend_bool persistent)|分配缓冲区来存放每块大小为 size 字节的 nmemb 块，并附加 offset 字节。类似于 emalloc(nmemb * size + offset)，但增加了针对溢出的特殊保护。|
|void *safe_pemalloc(size_t nmemb, size_t size, size_t offset, zend_bool persistent)|分配缓冲区来存放每块大小为 size 字节的 nmemb 块，并附加 offset 字节。类似于 emalloc(nmemb * size + offset)，但增加了针对溢出的特殊保护。|
|char *pestrdup(const char *s, zend_bool persistent)|分配一个可存放 NULL 结尾的字符串 s 的缓冲区，并将 s 复制到缓冲区内。|
|char *pestrndup(const char *s, unsigned int length, zend_bool persistent)|类似于 estrdup，但 NULL 结尾的字符串长度是已知的。|

分配为持久化类型的内存引擎不能优化或者追踪，也不被memory_limit管理。

### 线程安全的资源管理器
> TSRM：Thread-Safe Resource Manager

PHP是线程安全的，引擎要求每个上下文相互独立，比如各个处理器的各个线程互不干扰的处理独立的请求。PHP内部的TSRM功能强大，扩展编写时只需要做很少的事就能确保其能同时线程安全和非线程安全。

示例：接近标识宏
```cpp
#ifdef ZTS
#define COUNTER_G(v) TSRMG(counter_globals_id, zend_counter_globals *, v)
#else
#define COUNTER_G(v) (counter_globals.v)
#endif
```
这段代码展示了扩展中定义全局访问标识。TSRMG宏作为一个标识符，在每个模块初始化时由TSRM初始化。定义全局访问符可以确保扩展在同一逻辑下可以同时线程安全或非线程安全。

[待续]

