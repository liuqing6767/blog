<!--
author: 刘青
date: 2016-06-10
title: application对象
tags: Yii-appliction
category: php/yii2
status: publish
summary: 
-->
前面一篇文章讲了引导文件，最后一行是：
```php
(new yii\web\Application($config))->run();
```
这篇文章就看看Application类。

我们先来看Application的整体继承结构：

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_all.jpg)

我们就讲web的，console暂时不讲。

### yii\web\Application
![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_web_application.jpg)

web应用类继承自 yii\base\Application。
它定义了web特有的变量：
- defaultRoute：默认路由；
- controller：控制器实例
- catchAll：用来处理所有请求的 controller和action

重写了 bootstrap。

我们重点看看处理请求函数的实现：
```php
/**
* @param $request 请求对象
*/
public function handleRequest($request)
{
	
    if (empty($this->catchAll)) {
        list ($route, $params) = $request->resolve();
    } else {
	    //如果设置了catchAll数组，所有的请求就交给它
        $route = $this->catchAll[0];
        $params = $this->catchAll;
        unset($params[0]);
    }
    try {
        Yii::trace("Route requested: '$route'", __METHOD__);
        //设置应用的路由
        $this->requestedRoute = $route;
        //调用Action组件去处理业务
        $result = $this->runAction($route, $params);
        //Response 对象直接返回
        if ($result instanceof Response) {
            return $result;
        } else {
	        //不然包装成对象再返回
            $response = $this->getResponse();
            if ($result !== null) {
                $response->data = $result;
            }
            return $response;
        }
    } catch (InvalidRouteException $e) {
        throw new NotFoundHttpException(Yii::t('yii', 'Page not found.'), $e->getCode(), $e);
    }
}
```
而getSession|getUser都是直接调用对应的组件。

### yii\base\Application
![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_base_application.jpg)

Base Application其实有生命周期的概念在里面了：
- 应用在创建时执行构造函数：配置Yii对象，注册错误处理
- 紧接着会执行preInit：加载应用配置
- init函数会被调起：调用bootstrap函数
- run函数会被调起：调用钩子函数EVENT_BEFORE_REQUEST，处理请求，调用钩子函数EVENT_AFTER_REQUEST，发送请求
- end函数被调起：应用结束

每个生命周期函数被执行，其状态都会同步修改。

我们发现其依赖了非常多的组件（Component），所有的具体任务都是交给组件进行处理，后面我们将一一看。
我们着重看看引导函数：
```php
/**
引导函数会在init中被调用，用于初始化扩展和执行引导组件
*/
protected function bootstrap()
{
	//若无扩展配置，使用默认扩展配置
    if ($this->extensions === null) {
        $file = Yii::getAlias('@vendor/yiisoft/extensions.php');
        $this->extensions = is_file($file) ? include($file) : [];
    }
    foreach ($this->extensions as $extension) {
	    //对于每个扩展，如果有别名，添加到Yii中
        if (!empty($extension['alias'])) {
            foreach ($extension['alias'] as $name => $path) {
                Yii::setAlias($name, $path);
            }
        }
        //如果有bootstrap属性，实例化并执行
        if (isset($extension['bootstrap'])) {
            $component = Yii::createObject($extension['bootstrap']);
            if ($component instanceof BootstrapInterface) {
                Yii::trace('Bootstrap with ' . get_class($component) . '::bootstrap()', __METHOD__);
                $component->bootstrap($this);
            } else {
                Yii::trace('Bootstrap with ' . get_class($component), __METHOD__);
            }
        }
    }
    //依次处理每个引导
    foreach ($this->bootstrap as $class) {
        $component = null;
        if (is_string($class)) {
            if ($this->has($class)) {
                $component = $this->get($class);
            } elseif ($this->hasModule($class)) {
                $component = $this->getModule($class);
            } elseif (strpos($class, '\\') === false) {
                throw new InvalidConfigException("Unknown bootstrapping component ID: $class");
            }
        }
        if (!isset($component)) {
            $component = Yii::createObject($class);
        }
        if ($component instanceof BootstrapInterface) {
            Yii::trace('Bootstrap with ' . get_class($component) . '::bootstrap()', __METHOD__);
            $component->bootstrap($this);
        } else {
            Yii::trace('Bootstrap with ' . get_class($component), __METHOD__);
        }
    }
}
```

### yii\base\Module
> 模块：一个不能独立部署的、包含MVC元素的子应用。模块也可以嵌套模块。

如果让我们设计模块，我们应该会：
- [getUnique]id：模块的id
- [get|set]basePath：模块的根路径
- [get|set]viewPath：模块的视图路径
- [get|set]layoutPath：模块的模板路径
- [get|set|has]module：子模块列表
- [get|set]modules：父模块
- 它应该有个控制器：
	- defaultRoute
	- controllerMap
	- controllerNamespace
	- getControllerPath
	- createController
	- createControllerByID

它应该有一个生命周期：
- init
- beforeAction
- runAction
- afterAction

它还有一些工具函数：
- get|setInstance：当前请求的模块对象的实例
- setAliases：添加别名

这个就是模块类的所有的数据成员和方法成员。
![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_module.jpg)

我们分析模块id的生成逻辑：
```php
//如果有父模块，id=为父模块id + / + 当前id
public function getUniqueId()
{
    return $this->module ? ltrim($this->module->getUniqueId() . '/' . $this->id, '/') : $this->id;
}
```

### yii\di\ServiceLocator
> 服务定位器：本身是一个[设计模式][1]。在Yii里面，服务定位器通过id查找对于的服务（类）对象。每个对象都是单列，自动实例化的。它就好像一个服务的容器，只要set了，就可以get。

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_servicelocator.jpg)

两个私有变量：
- definitions：服务的定义
- components：服务实例化对象列表

重写了魔术函数__get和__isset，我们看前者的实现：
```php
public function __get($name)
{
    if ($this->has($name)) {
        return $this->get($name);
    } else {
        return parent::__get($name);
    }
}
```
上面代码的话，当引用没有定义的变量成员，魔术函数会执行尝试去加载。

我们看get函数的实现：
```php
public function get($id, $throwException = true)
{
	//组件里面有对象了，直接返回
    if (isset($this->_components[$id])) {
        return $this->_components[$id];
    }
    //要是定义里面有，需要的话先实例化，放到组件中，返回
    if (isset($this->_definitions[$id])) {
        $definition = $this->_definitions[$id];
        if (is_object($definition) && !$definition instanceof Closure) {
            return $this->_components[$id] = $definition;
        } else {
            return $this->_components[$id] = Yii::createObject($definition);
        }
    } elseif ($throwException) {
        throw new InvalidConfigException("Unknown component ID: $id");
    } else {
        return null;
    }
}
```

### yii\base\Component
> 组件：组件有三大特性：
> - property：属性。父类Object获得的，我们在Object中讲；
> - event：事件是一种将客户代码（event handlers）注入到确切位置的途径。当事件被激发，客户代码就会被执行。
> - behavior：一个组件可以有多个行为。当一个行为被添加到组件，组件可以直接访问其共有属性和方法，和访问自己的一样。

基于上面的描述，我们最好还是先看看event和behavior的实现：
> behavior：行为可以从来不修改组件的自身代码时扩展功能。它可以将自己的方法和属性"注入"到组件，而后者可以直接访问。
![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_behavior.jpg)
行为的类结构非常的简洁：
- owner：所属的component
- events：定义owner的时间处理
- attach：将行为和组件关联
- detach：解除行为和组件的关联

> event
![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_event.jpg)
- name：事件名
- sender：事件的发送者
- handled：是否已经处理，如果是就不交给下一个事件
- _events：全局注册的事件
- on：静态函数，类级别的绑定事件
- off：静态函数，类级别的解绑事件
- hasHandler：静态函数，判断某个类是否绑定了指定事件
- trigger：静态函数，触发类绑定的事件

我们看看绑定事件的实现：
```php
public static function on($class, $name, $handler, $data = null, 
$append = true)
{
	//获取类名后往私有变量 _events 里面塞
    $class = ltrim($class, '\\');
    if ($append || empty(self::$_events[$name][$class])) {
        self::$_events[$name][$class][] = [$handler, $data];
    } else {
        array_unshift(self::$_events[$name][$class], [$handler, $
data]);
    }
}
```

再看看激发函数：
```php
public static function trigger($class, $name, $event = null)
{
    if (empty(self::$_events[$name])) {
        return;
    }
    if ($event === null) {
        $event = new static;
    }
    //初始化事件对象
    $event->handled = false;
    $event->name = $name;
    if (is_object($class)) {
        if ($event->sender === null) {
            $event->sender = $class;
        }
        $class = get_class($class);
    } else {
        $class = ltrim($class, '\\');
    }
    //找到需要处理的所有的（父）类
    $classes = array_merge(
        [$class],
        class_parents($class, true),
        class_implements($class, true)
    );
    //依次激发
    foreach ($classes as $class) {
        if (!empty(self::$_events[$name][$class])) {
            foreach (self::$_events[$name][$class] as $handler) {
                $event->data = $handler[1];
                call_user_func($handler[0], $event);
                if ($event->handled) {
                    return;
                }
            }
        }
    }
}
```

好了，我们回头看组件。

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_component.jpg)

很明显，组件分为三大块。两块已经讲了，就还一块。

### yii\base\Object
>Object：实现"属性"特性。一个属性是被定义有getter函数，可能有setter 函数。


![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_application_class_object.jpg)

我们看其中一个函数的实现就好了：
```php
public function __set($name, $value)
{
	//拼接set函数名称
    $setter = 'set' . $name;
    if (method_exists($this, $setter)) {
        $this->$setter($value);
    } elseif (method_exists($this, 'get' . $name)) {
        throw new InvalidCallException('Setting read-only property: ' . get_class($this) . '::' . $name);
    } else {
        throw new UnknownPropertyException('Setting unknown property: ' . get_class($this) . '::' . $name);
    }
}
```


### yii\base\Configurable
Configurable是一个接口，什么函数都没有，唯一的要求是构造函数的最后一个参数得是 $config = []，这样就是可配置的了。

```php
//Object中的实现
public function __construct($config = [])
{
    if (!empty($config)) {
        Yii::configure($this, $config);
    }
    $this->init();
}

//在BaseYii中具体实现
public static function configure($object, $properties)
{
    foreach ($properties as $name => $value) {
        $object->$name = $value;
    }
    return $object;
}

```

-------
我们总结一下：
Application对象主要有：
- Request
- Route
- Response 
需要其他的服务是通过动态加载各种组件来实现，包括：
- db
- session
- user
- ...



[1]: http://en.wikipedia.org/wiki/Service_locator_pattern
