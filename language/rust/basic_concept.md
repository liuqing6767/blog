# 开始
- rustup 是 Rust版本和相关工具的命令行工具
- rustc 是 Rust的编译器
- rustfmt 是格式器
- Cargo 是 Rust的构建系统和包管理器

# 语法
- 用 // 开头表示行注释， /// 表示文档注释
- ! 表示宏
- 依赖包使用 use
- let 创建一个不可变的变量， let mut 创建一个可变变量
- const 创建一个常量 
- let|const var_name[: type] = value
- 变量能隐藏（不同的块作用域不同的类型不同的值）
- :: 用来关联类型和函数
- & 表示引用
- Result是一种可枚举的类型
- loop 关键字开启一个循环, while conditon, for element in set 用来变量集合
- match 关键字开启一个 if
- 分支：if, else if, else
- 类型有：
    - 标量：
        - 整型 [i|u][8|16|32|64|128|size]
        - 浮点型 f[32|64]
        - 布尔型：bool, true|false
        - 字符型： char 
    - 复合类型
        - 元组 tup：长度固定的元素类型各异的数据组合。 let tup: (i32, f64) = (500, 6.4); let (x, y) = tup; tup.0
        - 数组:长度确定的元素类型系统的数据组合。 let a: [i32; 5] = [1,2,3,4,5]; a[0]
    - Vector 类型（就是数组）
    - String!
    - Hash Map
- 函数 fn name(v: t [, v: t]) [-> t]。如果有返回值，不要加分号
- 枚举： enum Name {ele[(Type)], [...]}, Name::ele
    - match 就是搭配枚举使用的
- 包和Crate、workspace
    - 模块和use：控制作用域和路径的私有性
        - 模块/子模块 声明: [pub] mod Name
        - use as
        - 嵌套导入： self
    - 路径：一个命名 结构体、函数、模块等的 方式
        - crate::Name1:::Name2
        - crate 开头的为绝对路径， super 开头的为相对路径
    - crate 是 编译时的最小单位，有二进制和库两种形式
    - 包是提供一系列功能的一个或多个crate，包括最多一个库crate，任意个二进制crate
    - workspace 是一系列包


    # 语言特性
    ## 属性
    `#[]` 是属性的概念，用来修饰任何语法项，用来向编译器提供各种指令和建议

    ## 多态
    rust 的多态实现通过：
    - 特性：接口/抽象基类
    - 泛型：