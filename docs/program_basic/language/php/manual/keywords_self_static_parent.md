<!--
author: 刘青
date: 2016-06-15
title: static,self,parent
tags: php
category: php/manual
status: publish
summary: 
-->

PHP5以后支持面向对象。就有了几个关键字：self,static,parent，用于在类定义的内部对其属性|方法进行访问。

### static
> 声明类属性|方法为静态，就可以不实例化类而直接访问。

> 静态属性不可以通过对象来访问，但是静态方法可以。

```php
<?php

class StaticClass{
    public static $var_static = "static_1 \n";

    public static function static_function(){
    	//使用static关键字引用类
        echo 'static function' . static::$var_static;
    }

    //非静态函数可以引用静态变量，反之不行
    public function normal_function(){
        echo 'normal function' . static::$var_static;
    }
}


echo StaticClass::$var_static; //=> "static_1"
StaticClass::static_function();//=> "static function static_1"

$static_class = new StaticClass();
echo $static_class::$var_static; //=> "static_1"
$static_class::static_function();

//语法错误
//echo $static_class->$var_static;
$static_class->static_function();=> "static function static_1"
$static_class->normal_function();=> "normal function static_1"
```

### parent
> 用来引用父类的变量|函数

```php

<?php

class ParentClass{
    public static $parent_static = "parent_static \n";
    public $parent_normal = "parent_noraml \n";

    public static function static_function(){
        echo "parent_static function - " . self::$parent_static;
    }

    public function normal_function(){
        echo  "parent_normal function - " . self::$parent_static;
    }
}

class ChildrenClass extends ParentClass{
    public static function static_function(){
    	//可以引用静态变量|函数
        parent::static_function();
    	//可以引用非静态变量|函数（这个很诡异，静态函数中可以引用非静态函数）
        parent::normal_function();
        //语法错误，必须使用 :: 运算符
        //parent->normal_function();
        echo "children \n";
    }

    public function normal_function(){
        parent::static_function();
        parent::normal_function();
        echo "children \n";
    }
}

ChildrenClass::static_function();
/**
parent_static function - parent_static 
parent_normal function - parent_static 
children 
*/

$children = new ChildrenClass();
$children->normal_function();
/**
parent_static function - parent_static 
parent_normal function - parent_static 
children 
*/
```

### self
> self可以应用常量，也可以引用静态变量。

> 常量：类中始终保持不变的值。在定义和使用常量的时候不需要使用 $ 符号。常量的值必须是一个定值，不能是变量，类属性，数学运算的结果或函数调用。

```php
<?php

class AClass{
    public static $var_static = "static_1 \n";
    const VAR_CONSTANT = 1;

    public static function static_function(){
        echo static::$var_static;
        echo static::VAR_CONSTANT;
    }

    public static function static_function_2(){
        echo self::$var_static;
        echo self::VAR_CONSTANT;
    }
}

AClass::static_function();
/**
static_1 
1
*/

AClass::static_function_2();
/**
static_1 
1
*/
```

可是，self和static有没有区别呢？
```php

<?php

class ParentClass{
    public static $var_static = "parent_static \n";

    public static function static_function(){
        echo self::$var_static;
        echo static::$var_static;
    }
}

class ChildrenClass extends ParentClass{
    public static $var_static = "children_static \n";
}

ChildrenClass::static_function();
/**
parent_static 
children_static 
*/

```
> self 始终绑定当前对象。


好了，基本上结束了。对了，在类内部这三个关键字都可以用具体的类名代替，而类外部，只能用具体的类名了。
