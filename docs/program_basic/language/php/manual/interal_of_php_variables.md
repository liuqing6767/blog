<!--
author: 刘青
date: 2016-04-27
title: PHP核心：变量的使用
tags: interal_of_php variables
category: php/manual
status: draft
summary: 
-->

### 介绍

[原文阅读](http://php.net/manual/en/internals2.variables.intro.php)

理解变量是如何存储和操作对于骇客来说很重要。引擎通过提供一个统一又直接的范围结构体变量字段宏集合来屏蔽变量可以是任何类型这个概念的复杂性。

> PHP是一门动态，弱类型语言，使用 copy-on-write 和引用计数。

作为一门高级语言，弱类型暗含着引擎会执行转换或者强制变量到要求的类型。引用计数指的是引擎可以推断一个变量是否不再有然后引用了，那样它就可以是否这个变量管理的结构体了。

所有的PHP都用一个结构体表示 **zval**
```cpp
typedef struct _zval_struct {
    zvalue_value value;        /* 变量的值 */
    zend_uint refcount__gc;    /* 引用计数 */
    zend_uchar type;           /* 变量的类型 */
    zend_uchar is_ref__gc;     /* 引用标志 */
} zval;
```
而 **zval_value**让一个变量可以处理所有类型
```cpp
typedef union _zvalue_value {
    long lval;                 /* long value */
    double dval;               /* double value */
    struct {                   
        char *val;
        int len;               /* this will always be set for strings */
    } str;                     /* string (always has length) */
    HashTable *ht;             /* an array */
    zend_object_value obj;     /* stores an object store handle, and handlers */
} zvalue_value;
```

上面的结构体可以清楚的看错，一个变量由zval_value中一个合适的字段展现，而zval本身处理类型，引用计数和标志是否被引用的标记。

原生类型常量：
| Constant|     Mapping|
| -------- | --------| 
| IS_NULL|  - |
| IS_LONG|  lval |
| IS_DOUBLE|  dval |
| IS_BOOL|  lval |
| IS_RESOURCE|  lval |
| IS_STRING|  str |
| IS_ARRAY|  ht |
| IS_OBJ|  obj |

zval相关的由引擎解析的宏：
| 原型|     访问方式 |   描述|
| -------- | --------| ------ |
|zend_uchar Z_TYPE(zval zv)	|type|	返回值的类型|
|long Z_LVAL(zval zv)	|value.lval||	 
|zend_bool Z_BVAL(zval zv)	|value.lval|转换long到zend_bool|
|double Z_DVAL(zval zv)	|value.dval||	 
|long Z_RESVAL(zval zv)	|value.lval|返回值的资源列表标志|
|char* Z_STRVAL(zval zv)	|value.str.val|返回其string类型的值|
|int Z_STRLEN(zval zv)	|value.str.len|	返回其string类型的值的长度|
|HashTable* Z_ARRVAL(zval zv)	|value.ht|	|返回其hashtable（数组）的值|
|zend_object_value Z_OBJVAL(zval zv)|	value.obj|返回对象的值|
|uint Z_OBJ_HANDLE(zval zv)|	value.obj.handle	|返回对象的句柄|
|zend_object_handlers* Z_OBJ_HT_P(zval zv)	|value.obj.handlers	|返回对象的hashtable的句柄|
|zend_class_entry* Z_OBJCE(zval zv)|value.obj|	返回对象的类实体|
|HashTable* Z_OBJPROP(zval zv)	|value.obj|	返回对象的属性集合|
|HashTable* Z_OBJDEBUG(zval zv)	|value.obj|	要是对象设置了 the get_debug_info处理器，调用这个函数，不然调用Z_OBJPROP |

引用计数的细节我们在其他地方讨论，其API有：



创建，销毁，分离和复制的API有：


PHP是弱类型，类型转换API有：

| 原型  | 
| -------- |
|void convert_to_long(zval* pzval)|
|void convert_to_double(zval* pzval)|
|void convert_to_long_base(zval* pzval, int base)|
|void convert_to_null(zval* pzval)|
|void convert_to_boolean(zval* pzval)|
|void convert_to_array(zval* pzval)|
|void convert_to_object(zval* pzval)|
|void convert_object_to_type(zval* pzval, convert_func_t converter)|

到现在，我们一个可以很好的理解：引擎天然支持类型，类型解析发送，zval值读取方式，引用计数维护方式，还有其他的zval标记。


