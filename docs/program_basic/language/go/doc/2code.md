<!--
author: 刘青
date: 2016-08-16
title: golang 编码俗成
tags: 
category: golang/doc
status: publish
summary: 
type: note
source: https://golang.org/doc/code.html
-->

这篇文章讲解 golang 编码的一些原则的东西，是一些基础知识，和具体语法无关。

### 代码的组织
Go 语言有自己特有的代码组织形式，它的规则有：
- go 编程人员习惯将他们的所有的 go 代码放到单个`工作空间`(workspace)中；
- 每个工作空间包括多个版本控制库；
- 每个工作空间包括一到多个`包`(package)；
- 每个 包 有一到多个在单目录中的go源文件组成；
- 包 的目录路径决定了其被引入时的 import path；

#### 工作空间
一个工作空间包括三个子目录：
- src：放置源码；
- pkg：包括包对象
- bin：存放可执行命令

go tool 构建源码 后将其安装在pkg和bin目录下。
src 下有多个子目录，每个子目录代表一个包，里面会有版本控制库。
我们给个示例：
```
├── bin                         # 可执行命令
│   └── example
├── pkg                         # 包
│   └── linux_amd64
│       └── liuximu.com
│           └── trait.a
└── src                         # 源代码
    └── liuximu.com
        ├── example             # 一个类库
            │   └── hello.go
            │   └── .git        # 源代码管理
            └── trait           # 另一个类库
                └── string.go
                └── string_test.go # 测试代码
```

从go的代码结构就可以看出来，每个项目可以有多个独立的包。go可以分步编译每个包，然后再拼装。每个包都可以独自的修改，版本控制。

#### GOPATH 环境变量
GOPATH
环境变量指定工作空间的位置，到目前为止，这是开发中唯一一个你需要指定的环境变量。在[安装](安装.md)中进行了演示。

#### 引入路径
> 引入路径：一个字符串，包的唯一标识。

- 标准库的包：有简写，比如："fmt" "net/http"
- 个人包：包名的名称来源于其所在的路径，要确保包名的唯一性。

在创建包时，我们会指定包名；在使用包时，我们 使用包名。
举个例子:
```
# 我事先设置好了 GOPATH 环境变量

# 创建一个包
mkdir -p $GOPATH/src/liuximu.com/trait

# 在里面创建一个字符串工具模块 string.go
// package name 声明包名, 同一个包下面所有的.go 文件的 包名得一样
package string

func Reverse(s string) string {
    r := []rune(s)
    for i, j := 0, len(r)-1; i< len(r)/2; i, j = i+1, j-1 {
        r[i], r[j] = r[j], r[i]    
    }    
    return string(r)
}

# 进行编译 在src下
go build liuximu.com/trait
# 没有消息就是最好的消息， 然后进行安装
go install liuximu.com/trait 

# 在外层的pkg中就会多一些东西了，是一个 trait.a

# 再创建一个包 
mkdir -p $GOPATH/src/liuximu.com/example
# 进去后创建一个go源代码文件 hello.go
package main
// 使用包名
import (
    "fmt"
    "liuximu.com/trait"
)
//自定义包名就是源代码所在路径，加上 $GOPATH/src/ 就是绝对路径了

// 可执行命令必须使用 main
func main() {
    fmt.Printf(string.Reverse("hello, world"))
}

# 直接安装 在src下
go install liuximu.com/example

# 执行 到 pkg
bin/example # > dlrow, olleh
```

### 测试
go 有 一个轻量级的测试框架，还有`go test`命令以及测试包。
我们直接举例子吧：
```
# 我们要测试 string.go，首先要创建一个名为 string_test.go
# 的文件在同级目录(XXX_test.go)

# 我们要测试 string.go 中的Reverse函数，那么就应该创建一个叫 TestReverse
# 的函数(TestXXX)，函数签名为： t *testing.T

package string

import "testing"

func TestReverse(t *testing.T) {
    cases := []struct {
        in, want string    
    }{
        {"Hello, world", "dlrow ,olleH"},
        {"", ""},
        {"世界你好", "好你界世"},
    }
    for _, c := range cases {
        got := Reverse(c.in)
        if got != c.want {
            t.Errorf("Reverse(%q) == %q, want %q", c.in, got, c.want)
        }    
    }
}

# 进入 trait，执行
go test 
>>> PASS
>>> ok      liuximu.com/trait       0.002s
```

### 远端包
前面反复提到每个包应该被版本管理工具控制，go也提供了工来获取远端包
```
# 我们要获取 github.com/golang/example/hello 这个包
go get github.com/golang/example/hello
#上面命令可以获取代码，编译和安装，我们可以直接执行
$GOPATH/bin/hello
# 结果和源代码一致

对于包，直接用 包名 引用 就可以在其他包中被使用。
```
