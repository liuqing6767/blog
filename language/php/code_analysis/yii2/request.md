<!--
author: 刘青
date: 2016-06-21
title: 组件之Request
tags: Yii-Request
category: php/yii2
status: publish
summary: 
-->
Yii框架的一个核心组件是 request，它是Application的一个数据成员。

> Request 代表一个被Application处理的请求。

在 \yii\web\Application的bootstrop函数中，第一步就是得到请求对象，通过ServiceLocator自动创建对象。

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_request.jpg)

### yii\base\Request
yii\base\Request是一个抽象类。
数据成员有：
- _scriptFile：入口脚本
- _isConsoleRequest：是否是控制台请求
方法成员除了上面两者的getter 和 setter，就是：
- resolve：根据参数将当前的请求分配到一个route。这个将是重点。

请求作为一个模块存在，我们只讨论Web模块。

### yii\web\Request
> web Request 表示一个 HTTP 请求。

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_base%7Cweb_request.jpg)

这个类有许多和HTTP请求相关的属性，我们关心除此之外的：
- 请求解析
- csrfTooken

请求解析是实现父类的 resolve 函数：
```php
public function resolve()
{
	//把请求本身传递给了UrlManager，所以我们去看其实现。
    $result = Yii::$app->getUrlManager()->parseRequest($this);
    if ($result !== false) {
        list ($route, $params) = $result;
        if ($this->_queryParams === null) {
            $_GET = $params + $_GET; // preserve numeric keys
        } else {
            $this->_queryParams = $params + $this->_queryParams;
        }
        //将路由器和参数返回
        return [$route, $this->getQueryParams()];
    } else {
        throw new NotFoundHttpException(Yii::t('yii', 'Page not found.'));
    }
}
```
而csrfTooken则是一块独立的逻辑。
```php

public function getCsrfToken($regenerate = false)
{
    if ($this->_csrfToken === null || $regenerate) {
        if ($regenerate || ($token = $this->loadCsrfToken()) === null) {
            $token = $this->generateCsrfToken();
        }
        // the mask doesn't need to be very random
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.';
        $mask = substr(str_shuffle(str_repeat($chars, 5)), 0, static::CSRF_MASK_LENGTH);
        // The + sign may be decoded as blank space later, which will fail the validation
        $this->_csrfToken = str_replace('+', '.', base64_encode($mask . $this->xorTokens($token, $mask)));
    }
    return $this->_csrfToken;
}



private function validateCsrfTokenInternal($token, $trueToken)
{
    $token = base64_decode(str_replace('.', '+', $token));
    $n = StringHelper::byteLength($token);
    if ($n <= static::CSRF_MASK_LENGTH) {
        return false;
    }
    $mask = StringHelper::byteSubstr($token, 0, static::CSRF_MASK_LENGTH);
    $token = StringHelper::byteSubstr($token, static::CSRF_MASK_LENGTH, $n - static::CSRF_MASK_LENGTH);
    $token = $this->xorTokens($mask, $token);
    return $token === $trueToken;
}
```
其实是字符串的加密和比较，得到一个token。将token传递给前端，前端下次请求时再带上，这样避免跨站脚本攻击。

我们发现web request把最重要的那部分（resolve）甩锅给了UrlManager，所以我们下一节看看UrlManager的实现。
