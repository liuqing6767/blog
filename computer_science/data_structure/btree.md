<!--
author: 刘青
date: 2016-03-19
title:  二叉树
tags: 数据结构 树 二叉树
category: fundation/data_struct
status: publish
summary: 特殊的树——二叉树
-->

### 树的定义
二叉树是一种特殊的树
> 二叉树：每个结点的度<3的有序树。既最多有两棵子树，且子树有左右之分。

### ADT
```java
package tree;

import linear.IHandler;

public abstract class BTree implements ITree {
	@Override
	public abstract ITree init();

	@Override
	public abstract boolean destroy();

	@Override
	public abstract ITree create(ITree[] defines);

	@Override
	public abstract boolean isEmpty();

	@Override
	public abstract boolean clear() ;

	@Override
	public abstract int depath();

	@Override
	public abstract ITree getRoot();

	@Override
	public abstract String getValue();

	@Override
	public abstract boolean assignTree(ITree tree);

	@Override
	public abstract ITree getParent();

	@Override
	public abstract ITree getLeftChild();	
	/**
	 * 获取右孩子
	 * @return
	 */
	public abstract ITree getRightChild();

	/**
	 * 获取左兄弟
	 * @param target
	 * @return
	 */
	public abstract ITree getLeftSibiling();
	@Override
	public abstract ITree getRightSibiling() ;

	@Override
	public abstract boolean insertChild(ITree new_tree, int index) ;
	public abstract boolean insertLeftChild(ITree new_tree);
	public abstract boolean insertRightChild(ITree new_tree);

	@Override
	public abstract boolean deleteChild(int index);

	public abstract boolean deleteLeftChild();
	public abstract boolean deleteRightChild();

	@Override
	public abstract boolean traverse(IHandler handler);
	
	/**
	 * 前序遍历树，每个节点执行操作
	 * @param handler
	 * @return
	 */
	public abstract boolean preOrderTraverse(IHandler handler);	
	
	/**
	 * 中序遍历树，每个节点执行操作
	 * @param handler
	 * @return
	 */
	public abstract boolean inOrderTraverse(IHandler handler);	
	
	/**
	 * 后序遍历树，每个节点执行操作
	 * @param handler
	 * @return
	 */
	public abstract boolean postOrderTraverse(IHandler handler);
	
	/**
	 * 层序遍历树，每个节点执行操作
	 * @param handler
	 * @return
	 */
	public abstract boolean levelOrderTraverse(IHandler handler);
}

```

### 二叉树的性质
1. 在二叉树的第i层最多有2^(i-1)个节点：通过归纳法可以得出。
2. 深度为k的二叉树最多有2^k - 1个节点：由1进行累计可以得出。

> 满二叉树：深度为k切有2^k - 1 个节点的二叉树。
> 完全二叉树：满二叉树进行从左到右从上到下的排序得到的树。

### 二叉树的存储结构
#### 顺序存储结构
使用一组地址连续的存储单元依次自上而下从左到右的存储完全二叉树上的元素。但是这种存储结构仅适用于完全二叉树。

#### 链式存储结构
每个结点的组成至少有={左指针，右指针，数据域}，这种结点结构组成的二叉树存储结构叫二叉链表。还可以加一个父指针，叫三叉链表。

### 二叉树的遍历
> 遍历二叉树：按照某条搜索路径巡访树中的每一个结点，每个结点访问有且只有一次。（以一定规则将二叉树中结点排列成一个线性序列。）

每个结点由根结点，左子树，右子树。若能依次遍历这三部分，整棵树就被遍历了。限定先左后右，则存在三种遍历方案：
- 先序遍历DLR：先根结点，再左右子结点；
- 中序遍历LDR：先左子结点，再根结点，再右结点；
- 后序遍历LRD：先左子结点，再右子结点，再根结点。

我们看代码递归方式的实现：
```java
package tree;

import linear.IElement;
import linear.IHandler;

public class LinkBTree extends BTree implements IElement {
	private LinkBTree root;
	
	public void setRoot(LinkBTree root) {
		this.root = root;
	}
	@Override
	public ITree getRoot() {
		return this.getRoot();
	}

	private LinkBTree leftChild;
	public void setLeftChild(LinkBTree leftChild) {
		this.leftChild = leftChild;
	}
	@Override
	public ITree getLeftChild() {
		return this.leftChild;
	}

	private LinkBTree rightChild;
	public void setRightChild(LinkBTree rightChild) {
		this.rightChild = rightChild;
	}
	@Override
	public ITree getRightChild() {
		return this.rightChild;
	}
	
	private boolean isRoot;
	public boolean isRoot() {
		return isRoot;
	}
	public void isRoot(boolean isRoot) {
		this.isRoot = isRoot;
	}

	private String value;
	public void setValue(String value) {
		this.value = value;
	}
	@Override
	public String getValue() {
		return this.value;
	}

	public LinkBTree(String value, LinkBTree left, LinkBTree right, boolean isRoot) {
		this.doInit(value, left, right, isRoot);
	}
	public LinkBTree(String value, LinkBTree left, LinkBTree right) {
		this.doInit(value, left, right, false);
	}
	public LinkBTree(String value) {
		this.doInit(value, null, null, false);
	}
	
	/**
	 * 创建一颗空树
	 */
	public LinkBTree() {
		this.doInit(null, null, null, true);
	}
	
	private void doInit(String value, LinkBTree left, LinkBTree right, boolean isRoot){
		this.setValue(value);
		this.setLeftChild(left);
		this.setRightChild(right);
		this.isRoot(isRoot);
	}
	
	@Override
	public ITree init() {
		this.setRoot(new LinkBTree());
		return this;
	}

	@Override
	public boolean destroy() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public ITree create(ITree[] defines) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean isEmpty() {
		return this.getLeftChild() == null && this.getRightChild() == null; 
	}

	@Override
	public boolean clear() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public int depath() {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public boolean assignTree(ITree tree) {
		this.setValue(tree.getValue());
		
		return true;
	}

	@Override
	public ITree getParent() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ITree getLeftSibiling() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public ITree getRightSibiling() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean insertChild(ITree new_tree, int index) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean insertLeftChild(ITree new_tree) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean insertRightChild(ITree new_tree) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean deleteChild(int index) {
		if(index == 0){
			return this.deleteLeftChild();
		}
		
		if(index == 1){
			return this.deleteRightChild();
		}
		
		return false;
	}

	@Override
	public boolean deleteLeftChild() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean deleteRightChild() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean traverse(IHandler handler) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public boolean preOrderTraverse(IHandler handler) {
		boolean reuslt = handler.handle(this);
		if(!reuslt){
			return false;
		}

		LinkBTree leftChild = (LinkBTree) this.getLeftChild();
		if(leftChild != null){
			leftChild.preOrderTraverse(handler);
		}
		
		LinkBTree rightChild = (LinkBTree) this.getRightChild();
		if(rightChild != null){
			rightChild.preOrderTraverse(handler);
		}
		
		return true;
	}

	@Override
	public boolean inOrderTraverse(IHandler handler) {
		LinkBTree leftChild = (LinkBTree) this.getLeftChild();
		if(leftChild != null){
			leftChild.inOrderTraverse(handler);
		}
		
		boolean reuslt = handler.handle(this);
		if(!reuslt){
			return false;
		}
		
		LinkBTree rightChild = (LinkBTree) this.getRightChild();
		if(rightChild != null){
			rightChild.inOrderTraverse(handler);
		}
		
		return true;
	}

	@Override
	public boolean postOrderTraverse(IHandler handler) {
		LinkBTree leftChild = (LinkBTree) this.getLeftChild();
		if(leftChild != null){
			leftChild.postOrderTraverse(handler);
		}
		
		LinkBTree rightChild = (LinkBTree) this.getRightChild();
		if(rightChild != null){
			rightChild.postOrderTraverse(handler);
		}
		
		boolean reuslt = handler.handle(this);
		if(!reuslt){
			return false;
		}

		return true;
	}

	@Override
	public boolean levelOrderTraverse(IHandler handler) {
		// TODO Auto-generated method stub
		return false;
	}
	
}
```
对于树：

![enter image description here | center | 400*500](http://7nliuximu.liuximu.com/data_structure_%E4%BA%8C%E5%8F%89%E6%A0%91.jpg)

前序遍历的结果是：- + a * b - c d / e f 
中序遍历的结果是：a + b * c - d - e / f 
后序遍历的结果是：a b c d - * + e f / - 
```java
    @Test
	public void test() {
		LinkBTree root, 
		t_2_1, t_2_2, 
		t_2_1_1, t_2_1_2, t_2_2_1, t_2_2_2, 
		t_2_1_2_1, t_2_1_2_2, 
		t_2_1_2_2_1, t_2_1_2_2_2;

		t_2_1_2_2_1 = new LinkBTree("c");
		t_2_1_2_2_2 = new LinkBTree("d");
		
		t_2_1_2_1 = new LinkBTree("b");
		t_2_1_2_2 = new LinkBTree("-", t_2_1_2_2_1, t_2_1_2_2_2);
		
		t_2_1_1 = new LinkBTree("a"); 
		t_2_1_2 = new LinkBTree("*", t_2_1_2_1, t_2_1_2_2); 
		t_2_2_1 = new LinkBTree("e"); 
		t_2_2_2 = new LinkBTree("f");
		
		t_2_1 = new LinkBTree("+", t_2_1_1, t_2_1_2);  
		t_2_2= new LinkBTree("/", t_2_2_1, t_2_2_2); 
		
		root = new LinkBTree("-", t_2_1, t_2_2, true);

		root.preOrderTraverse(new PrintHandler());
		//root.inOrderTraverse(new PrintHandler());
		//root.postOrderTraverse(new PrintHandler());
	}
```

### 线索二叉树
遍历二叉树的将得到一个线性结构，每个结点（除首尾）有且仅有一个直接前驱和直接后继。而用二叉树存储二叉树时，我们只能得到结点的左右孩子的信息，而没有前驱和后继信息。
我们能想到的最简单的方法是在每个结点上加前驱和后继的指针，但是存储密度就下来了。另外一方面，一棵n结点的二叉树有n+1个结点是空着的，我们利用起来。

| lchild | LT | data |lchild  |  RT |  rchild |
| - | - | - | - | - | - |


>线索链表：给二叉链表添加两个标识LT和RT。当该结点有左子树，LT为0，lchild指向左子结点，不然LT为1，lchild指向前驱。右边同理。得到 的存储结构。
>线索：指向前驱和后继的的指针。
> 线索二叉树：加上线索的二叉树。
> 线索化：对二叉树以某种次序遍历使其变为线索二叉树的过程。

具体线索化我们不展开讨论。

