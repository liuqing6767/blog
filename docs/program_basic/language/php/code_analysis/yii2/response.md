<!--
author: 刘青
date: 2016-06-27
title: 组件之Response
tags: Yii-Response
category: php/yii2
status: publish
summary: 
-->

Yii框架的一个核心组件是 response。 

### yii\base\Response
> Response 代表一个被Application对请求的响应。


![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_response.jpg)

yii\base\Response 继承自组件，只实现了一个方法：
```php
//输出控制：清除缓存
public function clearOutputBuffers()
{
    // the following manual level counting is to deal with zlib.output_compression set to On
    for ($level = ob_get_level(); $level > 0; --$level) {
        if (!@ob_end_clean()) {
            ob_clean();
        }
    }
}
```
### yii\web\Response
> web Response 代表一个HTTP响应，它处理将被发送到客户端的 headers、cookies、content。

yii\web\Response 的核心方法是覆写父类的send方法：
```php
/**这个函数会调用各种生命周期函数，其实非常好理解
 */
public function send()
{
    if ($this->isSent) {
        return;
    }
    $this->trigger(self::EVENT_BEFORE_SEND);
    $this->prepare();
    $this->trigger(self::EVENT_AFTER_PREPARE);
    $this->sendHeaders();
    $this->sendContent();
    $this->trigger(self::EVENT_AFTER_SEND);
    $this->isSent = true;
}
```

prepare 方法会预先处理待响应的数据：
```php
// 处理待发出的数据，依赖 ResponseFormatterInterface
protected function prepare()
{
    if ($this->stream !== null) {
        return;
    }
    //得到格式化助手
    if (isset($this->formatters[$this->format])) {
        $formatter = $this->formatters[$this->format];
        //将其对象化
        if (!is_object($formatter)) {
            $this->formatters[$this->format] = $formatter = Yii::createObject($formatter);
        }
        if ($formatter instanceof ResponseFormatterInterface) {
            //实际上是将data进行格式化赋值给content
            $formatter->format($this);
        } else {
            throw new InvalidConfigException("The '{$this->format}' response formatter is invalid. It must implement the ResponseFormatterInterface.");
        }
    }
    //对于行数据,优先使用data,将其负责给content
    elseif ($this->format === self::FORMAT_RAW) {
        if ($this->data !== null) {
            $this->content = $this->data;
        }
    } else {
        throw new InvalidConfigException("Unsupported response format: {$this->format}");
    }
    if (is_array($this->content)) {
        throw new InvalidParamException('Response content must not be an array.');
    } elseif (is_object($this->content)) {
        if (method_exists($this->content, '__toString')) {
            $this->content = $this->content->__toString();
        } else {
            throw new InvalidParamException('Response content must be a string or an object implementing __toString().');
        }
    }
}
```

我们再看sendHeaders：
```php
/**
 它依赖了 HeaderCollection | CookieCollection
 */
protected function sendHeaders()
{
    if (headers_sent()) {
        return;
    }
    if ($this->_headers) {
        $headers = $this->getHeaders();
        foreach ($headers as $name => $values) {
            $name = str_replace(' ', '-', ucwords(str_replace('-', ' ', $name)));
            // set replace for first occurrence of header but false afterwards to allow multiple
            $replace = true;
            foreach ($values as $value) {
                header("$name: $value", $replace);
                $replace = false;
            }
        }
    }
    $statusCode = $this->getStatusCode();
    header("HTTP/{$this->version} {$statusCode} {$this->statusText}");
    $this->sendCookies();
}
```

最重要的是sendContent 方法：
```php
/**
 * 前面调用了prepare将data都转换为content，现在就还有content和stream
 */
protected function sendContent()
{
	//对于没有stream，只能讲content写出，但优先使用stream
    if ($this->stream === null) {
        echo $this->content;
        return;
    }
    //php的执行时间默认是30，设置为0表示不限制
    set_time_limit(0); // Reset time limit for big files
    //以下是流的操作了
    $chunkSize = 8 * 1024 * 1024; // 8MB per chunk
    if (is_array($this->stream)) {
        list ($handle, $begin, $end) = $this->stream;
        fseek($handle, $begin);
        while (!feof($handle) && ($pos = ftell($handle)) <= $end) {
            if ($pos + $chunkSize > $end) {
                $chunkSize = $end - $pos + 1;
            }
            echo fread($handle, $chunkSize);
            flush(); // Free up memory. Otherwise large files will trigger PHP's memory limit.
        }
        fclose($handle);
    } else {
        while (!feof($this->stream)) {
            echo fread($this->stream, $chunkSize);
            flush();
        }
        fclose($this->stream);
    }
}
```

前面提到了许多依赖，我们一个个简单的看一下：

### Header|CookieCollection
> xxxCollection 是一个集合类。集合作为一个常用的工具类，在任何语言中高频出现。

![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_xxCollection.jpg)

HeaderCollection和CookieCollection唯一不同的就是其私有数据成员不一样，一个是_header，一个是_cookies，它们都是数组，所以许多接口实现非常容易，调用原生函数就好了。

```php
//PHP的面向对象还是挺不错的
public function getIterator()
{
    return new ArrayIterator($this->_cookies);
}
```

### ResponseFormatterInterface
> ResponseFormatterInterface 指定了一个响应在发送之前需要被格式化的接口。


![enter image description here|center|600*0](http://7nliuximu.liuximu.com/yii2_class_ResponseFormatterInterface.jpg)

在 yii\web\Response 中定义了一下默认的格式转换器：
```php
protected function defaultFormatters()
{
    return [
        self::FORMAT_HTML => 'yii\web\HtmlResponseFormatter',
        self::FORMAT_XML => 'yii\web\XmlResponseFormatter',
        self::FORMAT_JSON => 'yii\web\JsonResponseFormatter',
        self::FORMAT_JSONP => [
            'class' => 'yii\web\JsonResponseFormatter',
            'useJsonp' => true,
        ],
    ];
}
```

我们就看jsonp的实现：
```php
protected function formatJsonp($response)
{
	//设置头
    $response->getHeaders()->set('Content-Type', 'application/javascript; charset=UTF-8');
    //得有callback字段
    if (is_array($response->data) && isset($response->data['data'], $response->data['callback'])) {
        $response->content = sprintf('%s(%s);', $response->data['callback'], Json::htmlEncode($response->data['data']));
    } elseif ($response->data !== null) {
        $response->content = '';
        Yii::warning("The 'jsonp' response requires that the data be an array consisting of both 'data' and 'callback' elements.", __METHOD__);
    }
}
```
