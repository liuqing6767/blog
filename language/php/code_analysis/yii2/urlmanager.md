<!--
author: 刘青
date: 2016-06-25
title: 组件之UrlManager
tags: Yii-Request
category: php/yii2
status: publish
summary: 
-->
Yii框架的另一个核心组件是 UrlManager。
> UrlManager：基于一系列的规则，进行 HTTP 请求的转换和 Url 的创建。

UrlManger的工作规则都是通过配置指定的，先给出一段配置：

```php
//components 字段下：
'urlManager' => [
    'enablePrettyUrl' => true,
    'rules' => [
        // your rules go here
    ],
    // ...
]
```

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_urlmanager.jpg)

对于数据成员，我们在函数成员中解释。

我们先来看看规则的创建，它是请求的解析和Url的创建的基础。
```php
/**
 从规则列表中创建规则对象
 规则配置规范有：
 
[
    'dashboard' => 'site/index',
    'POST <controller:[\w-]+>s' => '<controller>/create',
    '<controller:[\w-]+>s' => '<controller>/index',
    'PUT <controller:[\w-]+>/<id:\d+>'    => '<controller>/update',
    'DELETE <controller:[\w-]+>/<id:\d+>' => '<controller>/delete',
    '<controller:[\w-]+>/<id:\d+>'        => '<controller>/view',
];
 */
protected function buildRules($rules)
{
    $compiledRules = [];
    $verbs = 'GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS';
    foreach ($rules as $key => $rule) {
	    //如果是字符串，进行解析，构造成数组
        if (is_string($rule)) {
            $rule = ['route' => $rule];
            if (preg_match("/^((?:($verbs),)*($verbs))\\s+(.*)$/", $key, $matches)) {
                $rule['verb'] = explode(',', $matches[1]);
                // 只有GET类型的规则才参与URL的创建
                if (!in_array('GET', $rule['verb'])) {
                    $rule['mode'] = UrlRule::PARSING_ONLY;
                }
                $key = $matches[4];
            }
            $rule['pattern'] = $key;
        }
        //创建 UrlRule 对象，UrlRule我们后面细说
        if (is_array($rule)) {
            $rule = Yii::createObject(array_merge($this->ruleConfig, $rule));
        }
        if (!$rule instanceof UrlRuleInterface) {
            throw new InvalidConfigException('URL rule class must implement UrlRuleInterface.');
        }
        $compiledRules[] = $rule;
    }
    return $compiledRules;
}
```

再看看请求的解析，如果成功将返回 [route, params]
```php
/**
 * 解析请求，返回路由器和参数
 */
public function parseRequest($request)
{
	//enablePrettyUrl参数标识是否将路由参数放到请求路径里面，不然放到get参数中。
	//比如:index.php/student/list  index.php?r=student/list
    if ($this->enablePrettyUrl) {
	    //得到路径信息
        $pathInfo = $request->getPathInfo();
        //规则列表是通过处理配置得到的，所以我们会顺带讲rule
        foreach ($this->rules as $rule) {
            if (($result = $rule->parseRequest($this, $request)) !== false) {
                return $result;
            }
        }
        //是否要求任意一个请求都要求有匹配的规则
        if ($this->enableStrictParsing) {
            return false;
        }
        Yii::trace('No matching URL rules. Using default URL parsing logic.', __METHOD__);
        //路径不能以 // 结尾
        if (strlen($pathInfo) > 1 && substr_compare($pathInfo, '//', -2, 2) === 0) {
            return false;
        }
        //得到后缀
        $suffix = (string) $this->suffix;
        if ($suffix !== '' && $pathInfo !== '') {
            $n = strlen($this->suffix);
            //路径中包含了后缀，进一步判断
            if (substr_compare($pathInfo, $this->suffix, -$n, $n) === 0) {
	            //将路径中的后缀去除
                $pathInfo = substr($pathInfo, 0, -$n);
                if ($pathInfo === '') {
                    // suffix alone is not allowed
                    return false;
                }
            } else {//路径中不包含后缀，匹配失败
                // suffix doesn't match
                return false;
            }
        }
        return [$pathInfo, []];
    } else {
	    //路由参数只能放在get参数中得到，默认的key是 r
        Yii::trace('Pretty URL not enabled. Using default URL parsing logic.', __METHOD__);
        //获得查询参数中r对应的值
        $route = $request->getQueryParam($this->routeParam, '');
        if (is_array($route)) {
            $route = '';
        }
        return [(string) $route, []];
    }
}
```

再来看Url的创建：
```php
/**
 根据所给的路由和参数创建URL
 */

public function createUrl($params)
{
    $params = (array) $params;
    //单独处理锚
    $anchor = isset($params['#']) ? '#' . $params['#'] : '';
    unset($params['#'], $params[$this->routeParam]);
    //第一个参数是路径,进行简单处理
    $route = trim($params[0], '/');
    unset($params[0]);
    //获取根路径
    $baseUrl = $this->showScriptName || !$this->enablePrettyUrl ? $this->getScriptUrl() : $this->getBaseUrl();
    //对于 将路由器放到路径中的情况,拼接字符串
    if ($this->enablePrettyUrl) {
        //通过拼接参数得到缓存的键值
        $cacheKey = $route . '?';
        foreach ($params as $key => $value) {
            if ($value !== null) {
                $cacheKey .= $key . '&';
            }
        }
        //UrlRule可能会被缓存,这样的话就找到UrlRule让其创建URL
        $url = $this->getUrlFromCache($cacheKey, $route, $params);
        if ($url === false) {
            $cacheable = true;
            foreach ($this->rules as $rule) {
                /* @var $rule UrlRule */
                if (!empty($rule->defaults) && $rule->mode !== UrlRule::PARSING_ONLY) {
                    // if there is a rule with default values involved, the matching result may not be cached
                    $cacheable = false;
                }
                if (($url = $rule->createUrl($this, $route, $params)) !== false) {
                    if ($cacheable) {
                        $this->setRuleToCache($cacheKey, $rule);
                    }
                    break;
                }
            }
        }
        //处理路径
        if ($url !== false) {
            if (strpos($url, '://') !== false) {
                if ($baseUrl !== '' && ($pos = strpos($url, '/', 8)) !== false) {
                    return substr($url, 0, $pos) . $baseUrl . substr($url, $pos) . $anchor;
                } else {
                    return $url . $baseUrl . $anchor;
                }
            } else {
                return "$baseUrl/{$url}{$anchor}";
            }
        }
        //处理后缀
        if ($this->suffix !== null) {
            $route .= $this->suffix;
        }
        //拼接剩余参数
        if (!empty($params) && ($query = http_build_query($params)) !== '') {
            $route .= '?' . $query;
        }
        return "$baseUrl/{$route}{$anchor}";
    } else {
        //不然直接拼接字符串返回
        $url = "$baseUrl?{$this->routeParam}=" . urlencode($route);
        if (!empty($params) && ($query = http_build_query($params)) !== '') {
            $url .= '&' . $query;
        }
        return $url . $anchor;
    }
}
```

UrlManger的一个重要的数据成员是UrlRule，UrlManager管理的是一系列的UrlRule，所以我们还是要去看看UrlRule。


![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_urlrule.jpg)

规则是在配置里面配置的，每条规则产生一个路由（controller和action），可能有参数，形式如：
- 'dashboard' => 'site/index'
- 'POST <controller:[\w-]+>s' => '<controller>/create'
-  '<controller:[\w-]+>s' => '<controller>/index'
-  'PUT <controller:[\w-]+>/<id:\d+>'    => '<controller>/update'
-   'DELETE <controller:[\w-]+>/<id:\d+>' => '<controller>/delete'
-  '<controller:[\w-]+>/<id:\d+>'        => '<controller>/view'

具体实现先跳过吧。
