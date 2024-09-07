<!--
author: 刘青
date: 2016-09-10
title: 异常处理对象
tags: Yii-exception
category: php/yii2
status: publish
summary: 
-->

### SPL中的异常处理
> SPL: standard php library.

- Throwable
	- Error
		- ArithmeticError
		- AssertionError
		- ParseError
		- TypeError
	- Exception
		- LogicException
			- BadFunctionCallException
			- DomainException
			- InvalidArgumentException
			- LengthException
			- OutOfRangeException
		- RuntimeException
			- OutOfBoundsException
			- OverflowException
			- RangeException
			- UnderflowException
			- UnexcepectedValueException

在PHP7中，大多数错误被作为Error异常抛出，可以像Excepiton一样被 try / catch 块所捕获。如果没有匹配的 catch 块，则调用异常处理函数（事先通过 set_exception_handler() 注册）进行处理。

### Yii中的异常类


### Yii中异常处理对象
