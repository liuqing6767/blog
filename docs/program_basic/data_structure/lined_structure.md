<!--
author: 刘青
date: 2016-03-14
title: 线性表
tags: 数据结构 线性表 线性结构
category: fundation/data_struct
status: publish
summary: 最简单的数据结构：线性结构
-->
### 什么是线性结构
在数据元素的非空有限集中：
- 只有一个被称为『第一个』的数据元素
- 只有一个被称为『最后一个』的数据元素
- 除第一个元素，所有元素有且只有一个前驱元素；除最后一个元素，所有有且只有一个后驱元素

想想一支队伍，它就是线性结构，每个排队的人是一个数据项。

它的java代码为：
``` java
package linear;

public interface IList {
	/** 
	 * 创建一个线性表
	 * @return 返回线性表
	 */
	IList create();
	
	/**
	 * 销毁一个线性表
	 * @return 
	 */
	boolean destory();
	 
	/**
	 * 清空线性表
	 * @return 成功返回true，否则false
	 */
	boolean clear();
	
	/** 
	 * 是否有成员
	 * @return 成员数大于1为true，不然false
	 */
	boolean isEmpty();
	
	/**
	 * 获取成员数量
	 * @return 线性表的长度
	 */
	int getLength();
	
	/**
	 * 获取指定位置的元素
	 * @param index
	 * @return 指定位置的元素|null
	 */
	IElement getElement(int index);
	
	
	/**
	 * 获取和element匹配的元素
	 * @param element
	 * @return 第一个匹配元素的下标或者-1
	 */
	int locateElem(IElement element);
	
	/**
	 * 获取前驱元素
	 * @return 前驱元素|null
	 */
	IElement getPrev(IElement element);
	
	
	/**
	 * 获取后继元素
	 * @return 后继元素|null
	 */
	IElement getNext(IElement element);
	
	/**
	 * 在指定位置插入元素
	 * @param element
	 * @param index
	 * @return true|false
	 */
	boolean insert(IElement element, int index);
	
	
	/** 
	 * 删除指定位置的元素
	 * @param index
	 * @return 被删除的元素|null
	 */
	IElement delete(int index);
	
	/**
	 * 对所有元素遍历执行handler的handle函数
	 * @return true| false
	 */
	boolean traverse(IHandler handler);
}


/*-----------------*/
public interface IHandler {
	void handle();
}

/*-----------------*/
public interface IHandler {
	void handle(IElement element);
}
```
在计算机中，它的实现有={顺序, 链式}。

### 线性表的顺序表示和实现
*用一组地址连续的存储单元依次存储线性表的数据元素*

各元素在内存位置关系满足：

	LOC( a[i+1] ) = LOC( a[i] ) + l
		l是一个元素占用的存储单元数

它的java代码为：
``` java
package linear;

public class ArrayList implements IList {

	//初始长度
	private int init_length = 20;
	//每次增加长度
	private int incre_length = 20;
	//数组成员
	private IElement[] members;
	//当前的长度
	private int actual_length;
	
	private void init(){
		this.members = new IElement[this.init_length];
		this.actual_length = 0;
	}
	
	@Override
	public IList create() {
		this.init();
		return this;
	}

	@Override
	public boolean destory() {
		this.destory();
		return true;
	}

	@Override
	public boolean clear() {
		this.init();
		return false;
	}

	@Override
	public boolean isEmpty() {
		return this.actual_length == 0;
	}

	@Override
	public int getLength() {
		return this.actual_length;
	}

	@Override
	public IElement getElement(int index) {
		if(this.actual_length <= index){
			return null;
		}
		
		return this.members[index];
	}

	@Override
	public int locateElem(IElement element) {
		for(int i = 0; i < this.actual_length; i++){
			if(element.equals(this.members[i])){
				return i;
			}
		}
		return -1;
	}

	@Override
	public IElement getPrev(IElement element) {
		 int index = this.locateElem(element);
		 return index < 1 ? null : this.members[index - 1];
	}

	@Override
	public IElement getNext(IElement element) {
		 int index = this.locateElem(element);
		 return (index < 0 || index ==  this.actual_length - 1) ? null : this.members[index + 1];
	}

	//TODO 要是长度超过了初始化的值要扩容
	@Override
	public boolean insert(IElement element, int index) {
		if(this.actual_length < index || index < 0){
			return false;
		}
		this.members[index] = element;
		this.actual_length++;
		return true;
	}

	@Override
	public IElement delete(int index) {
		IElement element = this.getElement(index);
		if(element != null){
			for(int i = index; i < this.actual_length - 1; i++){
				this.members[i] = this.members[i+1];
			}
			this.actual_length--;
		}
		
		return element;
	}

	@Override
	public boolean traverse(IHandler handler) {
		for(int i = 0; i< this.actual_length; i++){
			handler.handle(this.members[i]);
		}
		
		return true;
	}
	
}

```

### 线性表的链式表示和实现

*用随机的内存地址存储元素，而元素与元素之间用指针联系*


它的java代码为：
``` java
package linear;

public class LinkList implements IList {

	private LinkElement header;
	
	@Override
	public IList create() {
		return this;
	}

	@Override
	public boolean destory() {
		return this.destory();
	}

	@Override
	public boolean clear() {
		this.header.setNext(null);
		return true;
	}

	@Override
	public boolean isEmpty() {
		return this.header.getNext() == null;
	}

	@Override
	public int getLength() {
		int i = 0;
		LinkElement next = this.header.getNext();
		while(next != null){
			next = next.getNext();
			i++;
		}

		return i;
	}

	@Override
	public IElement getElement(int index) {
		int i = 0;
		LinkElement next = this.header.getNext();
		while(next != null){
			if(i == index){
				return next;
			}
			i++;
		}
		
		return null;
	}

	@Override
	public int locateElem(IElement element) {
		int i = 0;
		LinkElement next = this.header.getNext();
		while(next != null){
			if(next.equals(element)){
				return i;
			}
			i++;
		}
		
		return -1;
	}

	@Override
	public IElement getPrev(IElement element) {
		if(element == null){
			return null;
		}
		
		LinkElement next = this.header.getNext();
		if(next == element){
			return null;
		}
		
		while(next != null){
			if(next.getNext().equals(element)){
				return next;
			}
		}
		
		return null;
	}

	@Override
	public IElement getNext(IElement element) {
		if(element == null){
			return null;
		}
		
		return ((LinkElement)element).getNext();
	}

	@Override
	public boolean insert(IElement element, int index) {
		LinkElement target_prev = null;
		
		if(index == 0){
			target_prev = this.header;
		}else{
			target_prev = (LinkElement)this.getElement(index - 1);
		}

		if(target_prev == null){
			return false;
		}

		((LinkElement)element).setNext(target_prev.getNext());
		target_prev.setNext((LinkElement)element);
		
		return true;
	}

	@Override
	public IElement delete(int index) {
		LinkElement target_prev = null;
		
		if(index == 0){
			target_prev = this.header;
		}else{
			target_prev = (LinkElement)this.getElement(index - 1);
		}
		
		if(target_prev == null){
			return null;
		}
		LinkElement target = target_prev.getNext();
		if(target != null){
			target_prev.setNext(target.getNext());
		}
		return target;
	}

	@Override
	public boolean traverse(IHandler handler) {
		LinkElement next = this.header.getNext();
		while(next != null){
			handler.handle(next);
		}
		
		return true;
	}

}
```

### 顺序存储和链式存储对比

| 项目		| 顺序存储	| 链式存储 |
| :-------- | :---------| :----  |
|	查找|快，直接查找|慢，需要遍历|
|插入\|删除		|查找快，但是需要移动其他元素|查找慢，不需要移动其他元素|


### 应用：一元多项式的表示和相加

一元多项式的定义为：
$$P_m (x)  = p_0 + p_1x + p_2x^2 + p_3x^3 + ... + p_mx^m$$

而一元多项式相加的表达式为：
$$R_m(x) = Q_m(x) + P_m(x)$$

那么，两个一元多项式的相加就是先将同幂项相加得到R(x)，再加各个R(x)累加。
如果使用x做下标进行顺序存储会因为很多幂不存在而造成很大的浪费，所以我们采用链式存储。

Java代码：
``` java
package linear;

/**
 * 一元多项式的一项 n * x^m
 */
public class PolynomialElement extends LinkElement {
	public PolynomialElement(double multiple, double base, double power) {
		this.setMultiple(multiple);
		this.setBase(base);
		this.setPower(power);
	}
	public PolynomialElement() {	}
	
	//n
	private double power = 0;
	public double getPower() {
		return power;
	}
	public void setPower(double power) {
		this.power = power;
	}
	//m
	private double multiple = 1;
	public double getMultiple() {
		return multiple;
	}
	public void setMultiple(double multiple) {
		this.multiple = multiple;
	}
	//x
	private double base;
	
	public double getBase() {
		return base;
	}
	public void setBase(double base) {
		this.base = base;
	}
	
	public double getValue(){
		return Math.pow(this.getBase(), this.getPower()) * this.getMultiple();
	}
	
	
	/**
	 * 添加另外一项到自身
	 * @param e
	 * @return
	 */
	public boolean addOneItem(PolynomialElement e){
		if(e.getPower() != this.getPower()){
			return false;
		}
		
		this.setMultiple(this.getMultiple() + e.getMultiple());
		
		return true;
	}
}

/**
 * 
 */
package linear;

/**
 * 一元多项式
 *
 */
public class Polynomial extends LinkList {
	public Polynomial() {
		this.header = new PolynomialElement();
	}
	
	/**
	 * 将一元多项式的一个元素加入表达式。如果同幂的已经存在进行累加，不然添加
	 * 保证元素的幂是递增的
	 * @param new_item
	 * @return
	 */
	public boolean addElement(PolynomialElement new_item){
		PolynomialElement next = (PolynomialElement) this.header;
		while(next != null){
			PolynomialElement try_next = (PolynomialElement) next.getNext();
			if(try_next == null){
				next.setNext(new_item);
				return true;
			}else if(try_next.getPower() == new_item.getPower()){
				try_next.addOneItem(new_item);
				return true;
			}else if(try_next.getPower() > new_item.getPower()){
				new_item.setNext(try_next);
				next.setNext(new_item);
				return true;
			}
			
			next = (PolynomialElement) next.getNext();
		}
		
		next.setNext(new_item);
		return true;
	}
	
	public double add(Polynomial p){
		PolynomialElement pe_a = (PolynomialElement) this.header.getNext();
		PolynomialElement pe_b = (PolynomialElement) p.header.getNext();
		
		double sum = 0;
		
		while(pe_a != null && pe_b != null){
			if(pe_a.getPower() > pe_b.getPower()){
				sum += pe_b.getValue();
				pe_b = (PolynomialElement) pe_b.getNext();
			}else if(pe_a.getPower() < pe_b.getPower()){
				sum += pe_a.getValue();
				pe_a = (PolynomialElement) pe_a.getNext();
				
			}else{
				sum += pe_a.getValue();
				pe_a = (PolynomialElement) pe_a.getNext();
				sum += pe_b.getValue();
				pe_b = (PolynomialElement) pe_b.getNext();
			}
		}

		while(pe_a != null){
			sum += pe_a.getValue();
			pe_a = (PolynomialElement) pe_a.getNext();
		}
		while(pe_b != null){
			sum += pe_b.getValue();
			pe_b = (PolynomialElement) pe_b.getNext();
		}
		return sum;
	}
	
	public void print(){}
	
}
```
