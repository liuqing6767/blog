<!--
author: 刘青
date: 2016-06-10
title: 引导文件
tags: Yii-bootstrap
category: php/yii2
status: publish
summary: 
-->

我们先来看一个请求进来了以后的工作流：

1. 用户发送(web|console，我们讲前者)请求，会进入入口文件 web/index.php
2. 入口文件加载应用配置，创建应用实例来处理请求
3. 应用解析被请求的路由
4. 应用创建控制器实例来处理请求
5. 控制器创建action实例并执行过滤器
	1. 如果过滤器失败，action被取消
	2. 否则action执行
7. action 可能加载model，dao
8. action可能呈现view
9. view的结果传递给 response 应用组件
10. response 应用组件响应给用户（浏览器）



**本节我们讨论第1步。**

### 入口文件
我们先看入口文件 web/index.php 的代码：
```php
<?php
// 定义一些常量
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

//忽略，composer的一些东西
require(__DIR__ . '/../vendor/autoload.php');

//这里引入了Yii
require(__DIR__ . '/../vendor/yiisoft/yii2/Yii.php');
//配置文件
$config = require(__DIR__ . '/../config/web.php');

//使用配置创建应用实例并执行
(new yii\web\Application($config))->run();
```
入口文件涉及到Yii类，Application类。

### Yii类
我们看 yii2/Yii.php：
1 它定义了一个Yii类：没自己的实现，直接继承BaseYii
2 并设置了：
```php
//在类找不到的时候尝试去加载
spl_autoload_register(['Yii', 'autoload'], true, true);
//设置Yii的静态属性 classMap
Yii::$classMap = require(__DIR__ . '/classes.php');
//设置Yii的静态属性 container
Yii::$container = new yii\di\Container();
```

对于Yii类我们认真分析，看 yii2/BaseYii.php。
它一开始就给系统需要的常量进行赋值：

|常量|含义|默认值|
|:-|:-|-|
|YII_BEGIN_TIME|应用开始时间戳|microtime(true)|
|YII2_PATH|框架安装路径|\__DIR__|
|YII_DEGUE|是否为debug模式|false|
|YII_ENV|应用运行环境|"prod"\|{"prod","dev", "test"}|
|YII_ENV_DEV|应用是否在开发环境|{true, false}|
|YII_ENV_PROD|应用是否在生产环境|{true, false}|
|YII_ENV_TEST|应用是否在测试环境|{true, false}|
|YII_ENABLE_ERROR_HANDLER|是否进行错误处理|true\|{true, false}|

然后就是类 BaseYii：

![Yii 类图](http://7nliuximu.liuximu.com/yii2_Yii_class.jpg)

所有的变量|方法都是静态成员，Yii是单例。
如图所示，Yii数据成员主要有：
- app对象：我们后面展开说；
- logger对象：日志，我们后面展开说；
- container对象：依赖注入的容器，我们后面展开说；
- aliases：别名。
> Yii2中的别名：Yii2对别名的用法进行了扩展，支持文件|目录路径和URL。别名必须以@开头来和普通文件|目录路径或URL

```php
//别名查找（转换）的实现细节
/**
就是讲alias中@xxx进行替换
*/
public static function getAlias($alias, $throwException = true)
{
	//别名一定是@开头，不然返回原值
    if (strncmp($alias, '@', 1)) {
        // not an alias
        return $alias;
    }
    //查找第一个 / 的位置
    $pos = strpos($alias, '/');
    //得到 / 最前面的元素t 如 @tt/cc/bb => @tt
    $root = $pos === false ? $alias : substr($alias, 0, $pos);
    //如果在别名数组中存在别名t
    if (isset(static::$aliases[$root])) {
	    //t也是字符串，直接拼接返回
        if (is_string(static::$aliases[$root])) {
            return $pos === false ? static::$aliases[$root] : static::$aliases[$root] . substr($alias, $pos);
        } else {
	        //t是一个数组，比较拼接
            foreach (static::$aliases[$root] as $name => $path) {
                if (strpos($alias . '/', $name . '/') === 0) {
                    return $path . substr($alias, strlen($name));
                }
            }
        }
    }
    //找不到，异常处理
    if ($throwException) {
        throw new InvalidParamException("Invalid path alias: $alias");
    } else {
        return false;
    }
}
```
- classMap：类名和类文件位置映射关系；

Yii其实是一个工具类，它实现一些基本功能（日志，对象生成，别名转换），也存储一些基本配置（classMap）。

我想大家一定对类自动加载很感兴趣：
```php
//声明
/**
找到类文件，引入
*/
public static function autoload($className)
{
	//映射文件中存在，类名就找到了
    if (isset(static::$classMap[$className])) {
        $classFile = static::$classMap[$className];
        if ($classFile[0] === '@') {
            $classFile = static::getAlias($classFile);
        }
    }
    //命名空间和类所在文件名进行转换 
    elseif (strpos($className, '\\') !== false) {
        $classFile = static::getAlias('@' . str_replace('\\', '/', $className) . '.php', false);
        if ($classFile === false || !is_file($classFile)) {
            return;
        }
    } else {
        return;
    }
    include($classFile);
    if (YII_DEBUG && !class_exists($className, false) && !interface_exists($className, false) && !trait_exists($className, false)) {
        throw new UnknownClassException("Unable to find '$className' in file: $classFile. Namespace missing?");
    }
}

//使用 yii2/Yii.php
spl_autoload_register(['Yii', 'autoload'], true, true);
//spl_autoload_register会在类无法加载时调用，这是最后一次机会
```
