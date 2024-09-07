<!--
author: 刘青
date: 2016-05-15
title: PHP核心：函数的使用
tags: interal_of_php functions
category: php/manual
status: draft
summary: 
-->
> 方法 method：类的成员。

在PHP中，函数和方法大体相同。方法是一个有特定作用域的函数，这个特定的域就是他们的类实体。关于类实体其他章节会进行介绍，本章节专注于方法|函数：如何定义函数，如何接受参数，如何返回数据给PHP编程人员。

最简单的函数：
```php
PHP_FUNCTION(hacker_function){
	/*已经接收的参数*/
	long number;

	/*待接收的参数*/
	if (zend_parse_parameters(ZEND_NUM_ARGS(), TSRMLS_CC, "l", &number) != SUCCESS){
		return;
	}

	/*做一些事情*/
	number *= 2;

	/*设置返回值*/
	RETURN_LONG(number);
}
```

预处理器转账会返回的声明为：
```cpp
void zif_hackers_function(INTERNAL_FUNCTION_PARAMETERS)
```
INTERNAL_FUNCTION_PARAMETERS 被定义为一个宏，
