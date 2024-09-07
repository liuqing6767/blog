<!--
author: 刘青
date: 2016-03-17
title: 字符串
tags: 数据结构 线性结构
category: fundation/data_struct
status: publish
summary: 字符串的底层实现
-->
在计算机上的非数值处理的对象基本上是字符串数据。字符串是我们最常用的对象。但是，它在计算机底层又是怎么实现的呢？

> 字符串（string）：由零到多个字符组成的有限序列。

$$s = 'a_1 a_2 .... a_n'  [a≥0]$$

### 字符串的数据结构（5个基本操作）
``` java
package linear;

/**
 * 字符串接口
 * @author will
 */
public interface IString {
	/**
	 * 生成一个由chars组成的字符串
	 * @param chars
	 * @return
	 */
	IString assign[char[] chars];
	
	/**
	 * 对比两个字符串，返回 this - st
	 * @param st
	 * @return
	 */
	int compare[IString st];
	
	/**
	 * 字符串的长度
	 * @return
	 */
	int length[];
	
	/**
	 * 字符串拼接
	 * @param st
	 * @return
	 */
	IString concat[IString st];
	
	/**
	 * 子字符串
	 * @param start
	 * @param length
	 * @return
	 */
	IString subString[int start_index, int length];
	
	/******字符串操作最小集：以上五个5个******/

	
	IString copy[IString str];
	
	boolean isEmpty[IString str];
	
	/**
	 * 清空字符串
	 * @return
	 */
	boolean clear[];
	
	/**
	 * 返回st在this从start_index开始第一次出现的位置
	 * @param st
	 * @param start_index
	 * @return
	 */
	int index[IString st, int start_index];
	
	/**
	 * 用new_str替换所有在this出现的old_str
	 * @param old_str
	 * @param new_str
	 * @return
	 */
	IString replace[IString old_str, IString new_str];
	
	IString insert[IString str, int index]; 
	
	IString delete[int start_index, int length]; 
	
	boolean destroy[];
}
```

### 字符串的表示和实现
高级语言里面随便使用的字符的底层实现其实是很复杂的，有多种方式。我们应该去了解。

#### 定长顺序存储表示
> 用一组地址连续长度固定的存储单元存储字符序列。

它会预先分配一定长度的空间，用特殊字符标记结尾。要是长度大于预分配的空间长度则会被截取。

#### 堆分配存储表示
> 用一组连续的存储单元存放字符序列，但是空间长度动态分配。

C语言中使用malloc[] 和 free[] 来管理堆存储区，故得名。
在字符串操作时，当发现原始的存储空间不够用，先释放原始的存储空间，再申请更大的存储空间。

#### 块链存储表示
> 一到多个字符为一个节点，多个节点链接表示字符序列。

这种存储方式需要的是：当字符串特别长时，我们需要考虑存储密度。

$$存储密度 =  \frac{字符串所占存储位} {实际分配的存储位}$$

当每个节点只有一个字符时，运算最简单，但是存储占用过大。


### 字符串的模式匹配

> 子串的定位操作通常称为字符串的模式匹配，其中，被比较的字符串叫做模式串。

java代码：
```java
public int index(IString pattern, int start_index) {
	int i = start_index;
	int j = 0;
	while(i < this.length() && j < pattern.length()){
		if(this.subString(i, 1) == pattern.subString(j, 1)){
			j++;
			i++; 
		}else{
			i = i - j + 1;
			j = 0;
		}
	}
		
	if(j == pattern.length() - 1){
		return i - pattern.length();
	}
		
	return -1;
}
```
代码的逻辑很简单，主串和模式串进行比较，从主串[start_index]全匹配模式串，要是有不匹配的 start_index 累加，继续全匹配。
对于"ABCDEFG" 匹配 "CDEF"这样的效率还可以，但是对于 "0000000001" 匹配 "00001"，最坏情况时间复杂度为O[n*n]。我们可以进行改进。

#### KMP子字符串匹配算法

> KMP算法：每当一趟匹配出现字符不匹配的情况，不直接回溯start_index到 start_index + 1， 而是根据已经得到的部分匹配，尽可能的滑行到 start_index + n。

看定义和含糊，我们看一个例子：
假设主串s是：

|s1|s2|s3|s4|s5|s6|s7|s8|s9|s10|s11|s12|s13|s14|s15|s16|s17|
|- |- |- |- |- |- |- |- |- |-  |-  |-  |-  |-  |-  |-  |-  |
|a|c|a|b|a|a|b|a|a|b|c|a|c|a|a|b|c|

模式串p是：

|p1|p2|p3|p4|p5|p6|p7|p8|
|-|-|-|-|-|-|-|-|
|a|b|a|a|b|c|a|c|

其中一次比较时：

|-|s1|s2|s3|s4|s5|s6|s7|s8|s9|s10|s11|s12|s13|s14|s15|s16|s17|
|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|-|
|s_i|a|c|a|b|a|a|b|a|a|b|c|a|c|a|a|b|c|
|-|-|-|p1|p2|p3|p4|p5|p6|-|-|-|-|-|-|-|-|-|
|p_j|-|-|a|b|a|a|b|c|-|-|-|-|-|-|-|-|-|
|滑|-|-|-|-|-|a|b|a|a|b|c|-|-|-|-|-|-|

可见 i = 8, j = 6 时失配了。要是使用前面讲的方法进行暴力求解，i = 4， j = 1 继续进行。但是，我们经过观察发现：

	k表示当模式中第j个字符与主串相应字符失配时，模式串中需要重新和主串中该字符进行比较的字符的位置。
	
> 我们尝试将p1...p6向右移动n位使得p[1]...p[6-n]与s[3+n]...s8相等，匹配就可以重新开始了。p1...p6向右滑动3位（如图）s6...s8就和p1...p3相等，所有的比较就可以从i = 8，j = (6 - 3) = 3开始比较。
> 有：k = p.next(s_sub, j)。又因为s3...s8  == p1...p6 恒成立，既s_sub = p，所以我们用模式本身就可以求出k，有 k = p.next(j)。

 KMP算法中i一定不回溯，它就为8，需要移动的是模式串，将它向右滑动到适当的位置使得比较从i = 8，k = j = p.next(j)开始。
 
 我们的所有的注意力都在k = p.next(j)的逻辑上:
 - 当 j = 1，k = 0 ：当模式中第一个字符直接不匹配时为0；
 - 当存在p1...p[k-1] == p[j-k+1]...p[j-1]时，k为其最大值：当p1...p[k-1] == s[i-k+1]...s[i-1]存在时，我们只需要主串从i，模式串从k开始比较。而s[i-k+1]...s[i-1] == p1...p[k-1]，故得出；
 - 其他情况，k = 1：没有字符串对齐情况，从第一位开始匹配。


比较时，当出现失配的情况，i不变，k = p.next(j)：
- k = 0 时：i++,j++。即主串的第i个字符和模式串的第1个字符不匹配，主串从第i+1个字符串开始匹配；
- 其他：j = k 继续匹配。

