<!--
author: 刘青
date: 2016-06-27
title: [译]控制容器反转和依赖注入模式
tags: 
category: fundation
status: publish
summary: 
type: translate
source: http://martinfowler.com/articles/injection.html
-->

[原文](http://martinfowler.com/articles/injection.html)

创建一个将不同项目的组件整合到一个混合项目的轻量级的容器在Java社区中十分急迫。这些容器的背后是一个公共 的模式：如何将各个组件拼接——常常被称为`控制反转`。在这篇文章中我深入探讨这个模式的内部原理，重点在`依赖注入`，并和`服务定位器`进行对比。比起到底选谁，使用时单独配置的原则更重要。

-------------

在企业级Java世界中一件令人欣慰的事情就是，在主流J2EE技术以外，你有大量的构建选择，它们的大多数来着开源。它们中有许多的出现是因为主流的J2EE太笨重和复杂了，当然J2EE也在探索替代方案、提出创造性的想法。一个公共的问题是如何将将不同的元素拼接：你如何将不同的互不了解的团队开发的web的控制器架构和数据库接口整合起来。一些框架对这个问题进行了攻坚，其中一部分派生为将不同层的组件进行整合。它们存储被当做轻量级的容器被引用，例子有 [PicoContainer](http://picocontainer.com/)，[Spring](http://www.springsource.org/)。

这些容器背后是一系列有趣的、不局限于特定容器的和Java平台的设计原则。我打算讨论这些原则。例子用的是Java语言，，但是大多数原则对于其他面向对象环境都是等价的，特别是 .NET。

### 组件和服务
将元素拼接到一起的话题马上将我拉入了棘手的术语问题：`服务（service）`，`组件（component）`。在这些名词的定义上，你可以发现又长又对立的文章，而我之所以提出来这个，是因为我大量的使用这些术语。

我说的组件，是一系列打算被使用的软件，它的作者是无法控制的，代码不会改变。我说的不会改变是指应用不改变组件的源代码，虽然在作者的同意下你可以通过继承的方式改变组件的行为。

服务被外部应用使用，比组件更简单。主要的不同，我希望一个组件可以被本地的使用（想想 jar 文件，编译文件， dll 或者源代码引入），而服务可以通过一些远端接口或异步或同步的被远程调用（比如web服务，消息服务，RPC，还有socket）。

大多数情况下我在本文中使用服务但是大多数逻辑也可以被应用到组件。很多时候你学哟一些本地的组件框架来更容易的范围远端服务，但是写『组件或服务』只是尝试去读或者写，这个时候，使用『服务』就更时髦一些。

### 一个简单的例子
我使用一个列子来让我们讨论的东西具体化。这个例子和我其他的例子一样都极其的简单。列子不切实际的简单，但是可以在不陷入真实列子的复杂性的前提下关注我们真正需要关注的点。

在这个例子中，我写了一个提供一系列由指定导演导演的电影。一个函数就可以实现了：
```java
class MovieLister 
{
	public Movie[] moviesDirectedBy(String arg) {
		List allMovies = finder.findAll();
		for (Iterator it = allMovies.iterator(); it.hasNext();) {
			Movie movie = (Movie) it.next();
			if (!movie.getDirector().equals(arg)) it.remove();
		}
		return (Movie[]) allMovies.toArray(new Movie[allMovies.size()]);
	}
}
```
这个方法的实现极其的简单，它向 finder 对象请求所有的影片列表，然后返回列表中指定导演导演的电影。我不打算去处理其筛选逻辑，这个列子只是这篇文章的真实出发点的一个演示物。

我们真正关注的是 finder 对象，或者说将 lister 对象和 指定的 finder 对象联系起来的方式。我想让moviesDirectedBy 函数和电影的存储方式完全独立开来，那么所有的函数引用一个finder对象，所有的finder对象都知道如何响应findAll函数。我可以通过对finder定义一个接口而将其提炼出来。
```java
public interface MovieFinder {
	List findAll();
}
```

到现在为止一切都很解耦，但是我生成一个具体的MovieFinder类。在这个案例中我把这个代码放到 lister 类的构造器中。
```java
class MovieLister 
{
	private MovieFinder finder;

	public MovieLister() {
		finder = new ColonDelimitdMovieFinder("movies1.txt");
	}
	
}
```
我从一个冒号分割的的文本文件中得到列表，所以取这个名字。我不考虑具体的实现细节。

如果我自己使用这个类，这一切都很好。但是如果我的朋友看到了这么好的功能想要使用我的程序的副本呢？如果他们依旧将电影存储在冒号分割的命名为『movies1.txt』的文本文件中，一切都好。但如果文件名不一样呢？我们可以将文件名放入属性文件中解决这个问题。但是如果他们存储列表的形式完全不一样呢：比如SQL数据库，比如XML文件，或者web服务，又或者另外一种格式的文档。这种情况下我们需要另外一个类来获取文件。因为我已经定义了一个MovieFinder接口，moviesDirectedBy函数不会被影响。但是我依旧需要一些方法将正确的 finder 实例创建出来。

![Figure 1: The dependencies using a simple creation in the lister class|600*0](http://martinfowler.com/articles/naive.gif)

Figure 1: The dependencies using a simple creation in the lister class

上图展示了这种情况的依赖。 MovieLister 类同时依赖 MovieFinder 接口和其实现。我们更喜欢其只依赖接口，但问题是如何生成一个实例。

在我的 [P of EAA](http://martinfowler.com/books/eaa.html) 这本书中，我们将这种解决方案描述为 [插件](http://martinfowler.com/eaaCatalog/plugin.html) 。finder的实现类不是在编译时期和程序关联，因为我不知道我的朋友打算如何使用它。换言之我们想让 lister 和任何 finder 的实现正常工作，实现方式是在更晚的一些时间点将其『插』进去。所以问题变成：我如何建立中央的链接：lister 类不关心 finder 的实现类，但是依旧可以和该实例良好的协助以完成工作。

让我们延伸到真实系统，我们也许有很多服务和组件。在每种情况中我们可以通过一个接口（要是组件没有目标中的接口可以使用适配器）来和组件进行交流。如果我们想通过不同的方式部署这个系统，我们需要使用插件来集成这些服务，在不同的部署下有不同的实现。

所以问题的核心是**如何将插件集成进系统**。这是新出来的轻量级容器面对的一个重要的问题，他们通常都使用控制反转来处理这个问题。

### 控制反转
当容器说他们因为实现了『依赖注入』而变得多么有用时我通常会迷惑不解。[依赖注入](http://martinfowler.com/bliki/InversionOfControl.html) 是框架的公共特征，所以说一个轻量级容器因为使用了依赖注入而变得特别就好像说汽车因为有了轮子而变得特别。

问题是：哪些方面的控制会被反转？我第一次接触控制反转时是用户界面的控制权。早期用户交互被应用程序控制。你会有一系列像『输入姓名』的命令，程序本身会进行提示和对每次的输入做出响应。后来图形界面和UI框架出现了，它们有一个主循环，而你的程序开始为屏幕上的各个字段提供事件处理。程序的主控制被反转了，从你被转移到框架了。

现在新种类的容器将寻找创建的实现进行了反转。在简单例子中 lister 通过直接实例化来寻找 finder 的实现。这让finder不能成为一个插件。

### 依赖注入的形式
依赖注入会有一个独立的对象（待注入），一个装配器，在被注入类中预留一个字段用来存放待注入对象。他们的依赖关系为：

![Figure 1: The dependencies using a simple creation in the lister class|600*0](http://martinfowler.com/articles/injector.gif)

依赖注入主要有三种样式：
- Constructor Injection
- Setter Injection
- Interface Injection

#### 使用 PicoContainier 进行构造器注入
我使用一个名为『[PicoContainer](http://picocontainer.com/)』的容器来展示构造器注入的。
PicoContainer使用构造器来确定如何将一个finder的实现注入lister类。为了实现这个，movie lister 需要定义一个包含所有需要被注入对象信息的构造器。

```
class MovieLister...
	public MovieLister(MovieFinder finder) {
		this.finder = finder;
	}
```

而 finder 本身也由pico容器管理，它的构造器为：
```
class ColonMovieFinder...

	public ColonMovieFinder(String fileName){
		this.fileName = fileName;
	}
```

pico 容器需要被告知响应的接口的实现类到顶是哪个，这样它才知道如何实例化：

```
private MutablePicoContainer configureContainer() {
    MutablePicoContainer pico = new DefaultPicoContainer();
    Parameter[] finderParams =  {new ConstantParameter("movies1.txt")};
    pico.registerComponentImplementation(MovieFinder.class, ColonMovieFinder.class, finderParams);
    pico.registerComponentImplementation(MovieLister.class);
    return pico;
}
```

上面的配置的代码就可以参见不同的类了。当我的一个朋友想要使用我的lister，他只需要在他的类中写适当的配置代码就可以得到他需要的对象。当然，将这些配置信息放置到一个单独的文件中是更通用的做法。你可以写一个读取配置文件的类，然后用适当的方式启动容器。Pico本身不包括这个功能，但是NanoContainer却支持用XML配置。

#### 使用Spring进行 Setter 注入
[Spring 框架](http://www.springsource.org/) 是在企业级Java开发中被广泛的使用。它包括事务的抽象层，持久化，web引用开发和JDBC。它倾向于提供setter注入。

为了让lister接受注入，需要先定义一个setting方法：
```
class MovieLister...
	private MovieFinder finder;
	public void setFinder(MovieFinder finder){
		this.finder = finder;
	}
```

对于Finder也是：
```
class ColonMovieFinder...
  public void setFilename(String filename) {
      this.filename = filename;
  }
```

然后就是要设置配置文件。Spring同时支持XML和代码：
```
<beans>
    <bean id="MovieLister" class="spring.MovieLister">
        <property name="finder">
            <ref local="MovieFinder"/>
        </property>
    </bean>
    <bean id="MovieFinder" class="spring.ColonMovieFinder">
        <property name="filename">
            <value>movies1.txt</value>
        </property>
    </bean>
</beans>
```

我们可以测试一下：
```
public void testWithSpring() throws Exception {
    ApplicationContext ctx = new FileSystemXmlApplicationContext("spring.xml");
    MovieLister lister = (MovieLister) ctx.getBean("MovieLister");
    Movie[] movies = lister.moviesDirectedBy("Sergio Leone");
    assertEquals("Once Upon a Time in the West", movies[0].getTitle());
}
```

#### 接口注入
第三种技术是通过定义并使用接口来实现注入。[Avalon](http://avalon.apache.org/) 就是一个使用这样技术的框架。

首先，要为被注入的对象定义一个接口。对于finder：
```
public interface InjectFinder {
	void injectFinder(MovieFinder finder) {
		this.finder = finder;	
	}
}
```

对于ColonMovieFinder的 fileName 也是同理的：
```
public interface InjectFinderFilename {
    void injectFilename (String filename);
}

class ColonMovieFinder implements MovieFinder, InjectFinderFilename...
  public void injectFilename(String filename) {
      this.filename = filename;
  }
```

然后，用配置代码来表示真正的实现：
```
class Tester...

  private Container container;

   private void configureContainer() {
     container = new Container();
     registerComponents();
     registerInjectors();
     container.start();
  }
  
  private void registerComponents() {
    container.registerComponent("MovieLister", MovieLister.class);
    container.registerComponent("MovieFinder", ColonMovieFinder.class);
  }

  private void registerInjectors() {
    container.registerInjector(InjectFinder.class, container.lookup("MovieFinder"));
    container.registerInjector(InjectFinderFilename.class, new FinderFilenameInjector());
  }
```

接口注入其实是将注入的依赖从具体的业务类移动到注入接口的具体实现类中。

### 使用服务定位器
使用依赖注入的关键的好处是：它移除了MovieList类对MovieFinder的确切的实现的依赖。这让我可以将lister给其他人而他们只需要更加他们自己的环境使用相应的MovieFinder实现。

> 注入是打破依赖的一直方式，另外一种是服务定位。

服务定位的基本思想是：存在这么一个对象，它知道如何得到一个应用需要的所有的服务。所以这个应用的服务定位器应该有一个可以方法movie finder 的函数。它们的依赖关系为：

![Figure 1: The dependencies using a simple creation in the lister class|600*0](http://martinfowler.com/articles/locator.gif)

我们看具体的例子：
```
class MovieLister...
	//lister 使用服务定位器得到 finder
	MovieFinder finder = ServiceLocator.movieFinder();

class ServiceLocator...
  public static MovieFinder movieFinder() {
      return soleInstance.movieFinder;
  }
  private static ServiceLocator soleInstance;
  private MovieFinder movieFinder;
```

当然，上面的定位服务器需要配置。演示使用代码，当然也可以使用配置文件：
```
class ServiceLocator...
  public static void load(ServiceLocator arg) {
      soleInstance = arg;
  }

  public ServiceLocator(MovieFinder movieFinder) {
      this.movieFinder = movieFinder;
  }


class Tester...
  private void configure() {
      ServiceLocator.load(new ServiceLocator(new ColonMovieFinder("movies1.txt")));
  }
  
  public void testSimple() {
      configure();
      MovieLister lister = new MovieLister();
      Movie[] movies = lister.moviesDirectedBy("Sergio Leone");
      assertEquals("Once Upon a Time in the West", movies[0].getTitle());
  }
```

我常常听到有人抱怨服务定位器不好，因为不能将它们的实现进行替代，导致不能测试。你其实可以避免将它们设计成这么糟糕。在示例中访问定位器就是一个简单的数据数据处理者。我可以轻易的创建一个服务定位器的测试实现。

对于更复杂的定位器我可以创建服务定位器的子类，将子类传入到被注入的类中。我可以改变改变静态函数来调用实例函数而不用直接去访问实例变量。我可以通过使用指定线程存储来指定线程定位器。在不改变服务定位器的客户端的情况下，这些都可以实现。

产生这样的看法的一个原因是服务定位器是一个注册而非单列。单列提供了实现注册的简单且容易修改的方式。

#### 为定位器使用独立的接口
MovieLister依赖这个服务加载类，即便在只使用一个服务是，这是个争议。我们可以通过使用`角色接口`来建设这种情况，也就是不使用整个服务定位器，lister可以只定义一些它们需要的接口：

在当前情况下，lister的提供者同时提供一个需要处理finder的定位器接口：
```
public interface MovieFinderLocator {
    public MovieFinder movieFinder();
```

定位器需要实现这个接口来提供一个finder：
```
MovieFinderLocator locator = ServiceLocator.locator();
MovieFinder finder = locator.movieFinder();
public static ServiceLocator locator() {
     return soleInstance;
 }
 public MovieFinder movieFinder() {
     return movieFinder;
 }
 private static ServiceLocator soleInstance;
 private MovieFinder movieFinder;
```

你会注意到，自从我们使用了接口，我们再也不能通过具体方法直接访问服务了。我们必须使用一个类来获取一个服务定位器，然后去获取我们需要的服务。

#### 一个动态的访问定位器
上面的例子中，每一个服务在服务定位器中都有一个方法与之对应。还有另外的方法来实现这个，你可以使用动态服务定位器来存如何你需要的服务，在运行时再取出来。
这种情况下，访问定位器使用一个map，而不是一个字段来单独的存放每个服务，还会提供通用的函数来获取和加载服务：
```
class ServiceLocator...
  private static ServiceLocator soleInstance;
  public static void load(ServiceLocator arg) {
      soleInstance = arg;
  }
  private Map services = new HashMap();
  public static Object getService(String key){
      return soleInstance.services.get(key);
  }
  public void loadService (String key, Object service) {
      services.put(key, service);
  }
```

对每个服务使用一个对应的key：
```
class Tester...
  private void configure() {
      ServiceLocator locator = new ServiceLocator();
      locator.loadService("MovieFinder", new ColonMovieFinder("movies1.txt"));
      ServiceLocator.load(locator);
  }
```

这样调用方式就是：
```
class MovieLister...
  MovieFinder finder = (MovieFinder) ServiceLocator.getService("MovieFinder");
```

我其实不喜欢这种方式虽然它确实很灵活，但是不明确。我找出一个服务的方法是一个文本字符串。我更喜欢明确的函数，张我可以通过实例的定义就容易的找到他们。

#### 同时使用定位器和注入
依赖注入和服务定位器其实不是互斥的。Avalon框架就同时使用他们：它使用一个服务定位器，但使用注入来告诉组件如何找到定位器。
```
public class MyMovieLister implements MovieLister, Serviceable {
    private MovieFinder finder;

    public void service( ServiceManager manager ) throws ServiceException {
        finder = (MovieFinder)manager.lookup("finder");
    } 
```
服务器方法使用了接口注入，允许容器注入服务管理者到MyMovieLister。服务管理者就是一个服务定位器。listers不将manager保存下来，而是直接使用它来查找finder。


### 到底用哪个？
我们已经讨论了各种模式以及它们的变种。现在开始讨论它们的优缺点，这样确定在何时用哪个比较合适。

#### 服务定位器 vs 依赖注入
最基本的选择是确定到底使用服务定位器还是依赖注入。他们都实现解耦功能，上面的例子都讲具体的实现和服务接口独立开来。两个模式最重要的不同是如何将实现提供给应用的类：服务定位器是通过应用类发送消息来得到指定的类，而依赖注入是控制反转了，服务创先在应用类中。

控制反转是框架的公共特性，但也造成了一下代价：它更不好理解和调试。所以在万不得已我尽量不去用它。当然这不是说它是一个不好的东西，展示我认为它需要自我改良来让事情更加的明晰。

服务定位器的用户都会依赖定位器，这个是关键的不同。定位器可以将其他的实现的依赖隐藏，但是你必须面对定位器本身。所以是靠用来是不是个问题来决定使用的是定位器还是注入器。

使用依赖注入可以让查看组件依赖什么更加的容易。使用依赖注入器你可以通过查看注入机制，比如构造器来查看依赖。当使用服务定位器时，你就不得不来搜索源代码了。有查找引用功能的现代IDE虽然会让事情简单一些，但是这个仍然没有通过查看构造器或者Setter函数来得方便。
当然这很大程度上使用服务的用户的情况。如果你使用一个服务来构建有多个类的应用，使用服务定位器就不是太大的问题。在我给的例子中，服务定位器就工作良好。我的朋友需要做的事情就是使用配置代码或者配置文件配置定位器去获取正确的服务的实现。这种情况下我不觉得注入器的反转有太多的优势。

要是lister是一个别人写的、我提供给应用的组件，情况就有所不同了。这种情况下我对我的客户将要使用的服务的API并不了解。每个客户可能都有自己的服务定位器，它们互不兼容。我可以使用独立的接口来处理这个事情：每个客户可以写一个匹配我的接口的适配器给它们的定位器。但无论如何，我的接口都要和定位器见面，定位器早晚要来查找我的接口。一旦适配器出现，联系到定位器的简洁就大打折扣了。
当使用组件不依赖的注入器，注入器一旦被配置，组件就不能扩展服务了。

入门更喜欢依赖注入的一个公共的原因就是测试会更容易。当你做测试时，你需要能方便的使用替换对象来替换真正的服务。但实际上，依赖注入和服务定位器在这点上真的没有什么差别：使用替换对象都很容易。我怀疑这样的观点是从哪些开发人员不让他们的服务定位器便于被替换的团队传出来的。如果你不能在测试中轻易的替换服务对象，那么你的设计就有一系列的问题。
当然测试问题会由于组件环境非常侵入而变得更严重，比如Java的 EJB 框架。我个人的看法是，这类框架应该对应用的上层代码影响越小越好，尤其不要做会让编辑-执行周期变慢的事情。使用插件来代替重量级的组件可以让这个过程好很多，对于像测试驱动开发（Test Driven Development）的实践尤其关键。

所以主要的问题都给了编写将会运行在非自己控制的应用的代码的人员身上。这种情况下，每一个对服务定位器的小小的假设都会成为问题。

#### 构造器注入 vs Setter注入
在组合服务时总是要做一些转换。只需要非常简单的转换是注入的主要好处——至少对构造器注入和Setter注入。你不需要对你的组件做奇怪的事情，配置好它们非常的简单。

接口注入过于侵入，你需要些许多接口，还要好好归类它们。对于少数接口，这个还不是太坏。但是拼接组件和依赖太费事了，这也是当前大多数轻量级容器使用Setter注入和构造器注入的原因。

到底是选择Setter注入还是构造器注入是一个有趣的话题，它反射出面向对象中更普遍的话题：你应该通过构造器还是Setter函数进行字段填充。

我一直让对象在构造时期有尽可能多的默认状态。这个建议来着 Kent Beck 的 Smalltalk [佳实践模式](https://www.amazon.com/gp/product/013476904X?ie=UTF8&tag=martinfowlerc-20&linkCode=as2&camp=1789&creative=9325&creativeASIN=013476904X)：构造器函数和构造器参数函数。有参数的构造器让你清楚的知道在构建游戏哦啊对象是发生了什么。如果有不止一种方式来创建对象，那就创建多个构造器提供不同的组合。

使用构造器初始化的另外一个好处就是它允许你通过不通过Setter函数来隐藏字段。我觉得这很重要：如果一些东西不应该被改变，不提供Setter函数就非常的好。如果使用Setter来初始化就会有问题了。（在这种情况下我避免使用常规的设置方式，我会使用比如initFoo这样的函数来强调只有在初始化时才去设置它）

但是凡事都有例外。如果构造器的参数太多，它就会看起来很凌乱，尤其是在没有没有关键参数的语言中。当构造函数过多时通常代表着对象有过多的职责，需要被分离，但是也有可能你确实需要。

如果你有多个方式来创建一个对象，通过构造器来展示就比较困难了，因为构造器只能通过参数的数量和类型来区别。展示工厂方法就可以上场了，可以通过组合使用构造器和Setter来实现它们的工作。经典的工厂方法对组件的组合的问题在于它们通常是静态方法，你不能让它们出现在接口里面。你可以创建一个工厂类，但是它其实就是另外一个服务的实例。一个工厂服务常常有好的组织，但是你让人需要使用这里的某个技术来实例化这个工厂。

构造器对于简单的字符串参数也是广受诟病。Setter注入可以指明是哪个参数，但是构造函数就只能通过位置来区分了。

如果你有多个构造器和继承，事情就特别的尴尬了。为了初始化每个变量你必须为每个父类提供构造器，也添加你自己的参数。这个真的会让构造器越来越庞大。

忽略那先缺点我会先有构造器注入开始，一点遇到上述问题马上切换到Setter注入。

这个讨论引出了各个将依赖注入作为框架一部分的的开发小组之间争论。然而这些框架的开发人员意识到了同时支持这两种机制的重要性，即便最后会对其中一个会更侧重。

#### 代码 vs 配置文件
将API封装成服务时，使用配置文件还是代码是一个问题。对于大多数汇报不是到多个地方的应用来说，一个单独的文件更合适，大多数时候是个XML文件。但是这也要看是否通过编码集成会更方便。一种情况就是你只有一个简单的项目，没有太多的部署变量，这时候代码就比配置文件简洁。
一个对比鲜明的场景就是：装配很复杂，有许多可选的步骤。一旦你开始程序单XML崩溃了，你最好使用代码来写清除的程序。然后你会写一个构建类来做这个装配。当你有不同的装配场景，你可以写几个装配类，然后通过简单的配置文件来决定选哪个。

我常常觉得大家过度使用配置文件。编程语言一般都简洁有力的配置机制。显得永远可以方便的编译小的组件，在线组件可以作为大系统的创建。如果编译很复杂，脚本语言其实也可以运行良好。

常常有人说配置文件不应该有编程性，因为非编程人员会修改它。但是这个的频率多大呢？人吗真的希望非编程人员修改一个复杂的服务端应用的事务隔离等级吗？非编程型的文件只有在起足够简单时才会工作良好。要是它们很复杂，应该考虑属性编程语言。

在Java中，我们看见一个现象就是：每个组件都有自己的配置文件，每个人对于每个组件的配置还不一样。如果你有十个组件，你很快发现你不能讲这个十个配置文件保存同步。
我的建议是提供一个见面来配置所有的配置，同时听过一个单独的配置文件作为默认项。你可以很容易通过界面创建配置文件。如果你写了一个组件就可以将界面留给你的用户。

#### 将使用和配置分离
这一切的要点是：将服务的配置和使用分离开来。将接口和实现分离是基本的设计原则。在面向对象编程中，控制逻辑会确定实例化哪个类，而进一步的条件逻辑会通过多态而非明确的条件代码来实现。

如果在单代码中进行分离是有效的，在使用像组件和服务这样的外部服务时则是至关重要的。你是否希望将具体实现的选择推迟到特别的不是中呢？如果是你需要使用一些插件的实现。一旦你使用了插件，将插件和程序的其他部分分离就变得至关重要，这样你才能通过不同的配置进行不同的部署。至于你怎么实现这个反而是次要的。这个配置机制的实现既可以通过配置服务定位器，也可以使用注入直接配置对象。


### 总结
当前轻量级容器实现服务的插拔都有相同的模式——依赖注入。依赖注入是服务定位器的可替换的选择。构建应用时两者基本上是等价的，但我认为服务定位器因为其更简单的行为而略胜一筹。但如果你构建将在多个应用中被使用的类，依赖注入更合适一点。

如果你使用依赖注入，你可以选择形式。要是你没有特别的问题，我建议你使用构造器注入，不然就用Setter注入。如果你选择构建或者获取一个容器，要找同时可以注册构造器注入和Setting注入的那种。

而到底是选择服务定位器还是依赖注入，这个反倒没有在应用内部将服务的配置和服务的使用分离来得重要。
