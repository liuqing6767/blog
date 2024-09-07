# Rust vs. Go

本文主要讨论 rust语言和Go语言在执行并发逻辑的底层实现的gap，试图来评估两个语言在作为proxy场景下（IO密集型）的性能表现。



才疏学浅，一知半解，故诚惶诚恐。
## 操作系统计算资源调度
### 基本概念
一台计算机会有一到多个CPU，每个CPU上会有一到多个物理Core（，如果开启了超线程，每个物理Core 可能被虚化为多个虚拟核）。最简化的硬件为：

[流程图]
上图的服务器只有一个CPU，这个CPU只有一个核，也没有超线程。



操作系统管理程序的概念叫进程，每个进程至少有一个主线程，主线程中可以创建更多的线程。



操作系统的调度发生在线程上。操作系统层面，资源调度要做的事情就是决定每个核上面要运行哪个线程。基本的调度策略有：

* 基于优先级：任务先到达的优先、任务执行时间短的优先、任务执行完成时间早的优先
* 时间片轮转：每个任务都执行一段时间
操作系统的调度策略有不同的实现，也更复杂。但是核心指标都是 低调度开销 和 高调度效果（公平性、吞吐量）。



抢占式、协作式

调度的两个理念：协作式调度与抢占式调度：

* 协作式调度依靠被调度方主动弃权；
* 抢占式调度则依靠调度器强制将被调度方被动中断。
### 为什么要尽量避免线程切换
线程切换是CPU从一个线程切换到另一个线程的过程，调度器将Executing线程从核心中拉出并替换为Runnable线程。在这个过程中，需要保存当前线程的上下文信息，包括寄存器的状态、内存数据等，并加载下一个线程的相应信息。这些操作需要消耗一定的计算资源，从而增加了系统的开销。

### 线程API
操作系统提供了线程相关的API，Pthread API 的核心接口为：
```
// 创建一个线程，开始执行 start_routine
int pthread_create (pthread_t *thread,
                    const pthread_attr_t *attr,
                    void *(*start_routine) (void *),
                    void *arg)

// 得到线程ID
pthread_t pthread_self(void)

// 终止线程
// 自杀
void pthread_exit(void *retval)
// 他杀
int pthread_cancel(pthread_t thread)

// 加入其他线程：当其他线程结束，本线程开始运行（主线程等其他线程的方式）
int pthread_join(pthread_t thread, void **retval)
// 分离其他线程，让线程不可join
int pthread_detach (pthread_t thread)
```

## Go的调度模型：GMP
本节的内容主要来源：Scheduling In Go : Part II - Go Scheduler。



不同的语言有不同的调度机制。比如C#用的是实例池的机制。Go的调度模型叫GMP。

### 基本流程
先简单的感受一下Go异步的代码：

```
func main() {
    go func() {
        println("hello world")
    }
    
    time.Sleep(time.Second)
}
```
其底层的调度模型如下：


图片来源：https://godev.me/2023/08/01/golang-gmp-scheduling-model/



简单说明如下：

* M 就是操作系统线程。Go程序进程启动后默认会创建 GOMaxProc 个线程，每个（物理/虚拟）核一个。也就是说基本上没有线程切换；
* P 为逻辑 Logic Processor。它对下对应一个M，对上关联了一个G的队列，叫  Local Run Queue（LRQ）；
* G 就是 Goroutine。代码 `go func(){...}()` 会创建一个G。它首先会被放入P的本地队列中。如果本地队列已满或P的数量小于 GOMAXPROCS，新的Goroutine会被放入Global Run Queue（GRQ）中。如果此时有空闲的M，那么运行时系统会唤醒或创建一个M来执行这个新的Goroutine
在运行时，P会把G交给M执行。也就是把任务交给线程执行。可能出现：

* G1因为异步系统调用而阻塞：将G1挂到 Net Pooler（网络轮询器） 上，然后执行LRQ其他的G。当异步网络调用完成再将G1移回LRQ
* G1以为同步系统调用而阻塞：G1继续在M1上执行。P找到其他空闲的M或者新建一个M继续执行。G1执行完成后M1空闲等待类似的情况发生
* G执行完成：执行LRQ其他的G
上述 “执行LRQ其他的G”的确切算法为：

runtime.schedule() {
    // only 1/61 of the time, check the global runnable queue for a G.
    // if not found, check the local queue.
    // if not found,
    //     try to steal from other Ps.
    //     if not, check the global runnable queue.
    //     if not found, poll network.
}


需要特别注意的是：如果 LRQ为空，它会尝试去 steal 其他的 P 的 LRQ。

### 调度模式[copy from]
Go 的运行时并不具备操作系统内核级的硬件中断能力，基于工作窃取的调度器实现，本质上属于 先来先服务的协作式调度，为了解决响应时间可能较高的问题，目前运行时实现了两种不同的调度策略、 每种策略各两个形式。保证在大部分情况下，不同的 G 能够获得均匀的时间片：

* 同步协作式调度
  a. 主动用户让权：通过runtime.Gosched调用主动让出执行机会；
  b. 主动调度弃权：当发生执行栈分段时，检查自身的抢占标记，决定是否继续执行；
* 异步抢占式调度
  a. 被动监控抢占：当 G 阻塞在 M 上时（系统调用、channel 等），系统监控会将 P 从 M 上抢夺并分配给其他的 M 来执行其他的 G，而位于被抢夺 P 的 M 本地调度队列中 的 G 则可能会被偷取到其他 M 中。
  b. 被动 GC 抢占：当需要进行垃圾回收时，为了保证不具备主动抢占处理的函数执行时间过长，导致 导致垃圾回收迟迟不得执行而导致的高延迟，而强制停止 G 并转为执行垃圾回收。

### 小结
个人认为，GMP模型：

- 通过P和M一比一的绑定，避免了线程池实现带来的上下文切换开销；
- 通过P和G队列的绑定，实现低成本的任务调度，同时尽可能避免线程空闲。

## Rust的调度模型
本章的内容来自：

* tokio crate文档 / tokio 运行时crate文档
* tokio tutorial
* Async: What is blocking?
* 《Rust程序设计》


### Rust异步编程的基本概念
核心概念包括：

* Future：表示通过使用async获得的异步计算。是一个可能还没有完成计算的值。这种“异步值”使线程可以在等待值可用时继续进行有用的工作。
* 异步函数 和 await表达式：用于计算 Future的最终的值。是一个内置语法

```
use async_std::io::prelude::*;
use async_std::net;

// 1 异步函数以 async 关键字开头
// 2 调用会回立刻返回一个Future
async fn cheapo_request(host: &str, port: u16, path: &str)
                         -> std::io::Result<String>
{
    // 3 connect 会返回一个 Future
    // 4 await 关键字是Rust语法，表示计算Future的最终的值
    let mut socket = net::TcpStream::connect((host, port)).await?;
     
    let request = format!("GET {} HTTP/1.1\r\nHost: {}\r\n\r\n",path, host);
    socket.write_all(request.as_bytes()).await?;
    socket.shutdown(net::Shutdown::Write)?;
    let mut response = String::new();
    socket.read_to_string(&mut response).await?;
 
    Ok(response)
}
* task 和 block_on执行器：完成异步函数最终值的计算
fn main() -> std::io::Result<()> {
    use async_std::task;

    // 程序阻塞执行，轮询结果
    let response = task::block_on(cheapo_request("example.com", 80, "/"))?;
    println!("{}", response);
    Ok(())
}
* spawn_local执行器：并发的执行任务
pub async fn many_requests(requests: Vec<(String, u16, String)>)
                             -> Vec<std::io::Result<String>>
{
    use async_std::task;
 
    let mut handles = vec![];
    for (host, port, path) in requests {
        // 将多个异步任务同时启动
        handles.push(task::spawn_local(cheapo_request(&host, port, &path)));
    }
 
    let mut results = vec![];
    for handle in handles {
        results.push(handle.await);
    }

    results
}

// 伪代码
* spawn执行器：spawn_local 会在调用了block_on 才开始执行（适用IO密集型的程序），但是spawn只要有空闲线程就会执行（适用CPU密集型的程序）。
use async_std::task;
let mut handles = vec![];
for (host, port, path) in requests {
    handles.push(task::spawn(async move {
        cheapo_request(&host, port, &path).await
    }));
}
```


在实现层面，Rust提供了好几个类库：

* 系统库：async_std、std:thread
* rayon类库：基于系统库的二次封装
* Tokio运行时(类库)
其适用场景为：



| | CPU-bound computation | Synchronous IO | Running forever |
| - | - | - | - |
| spawn_blocking/Tokio | 次优 | OK | No |
| rayon |OK | No | No |
| 专用线程 | OK | OK | OK |

### tokio
Tokio是Rust的异步运行时，是一个事件驱动、非阻塞I/O平台。主要组件有：

* 异步任务的工具。包括：异步原语和管道、timeouts、sleeps、intervals
* 执行异步I/O的API。包括：TCP/UPD sockets、文件系统操作、进程和信号管理
* 运行异步代码的运行时。包括：任务调度器、操作系统的事件队列支撑的I/O驱动、高性能timer
本文主要讨论的就是任务调度器。



先感受一下代码：

```
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};

##[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let listener = TcpListener::bind("127.0.0.1:8080").await?;

    loop {
        let (mut socket, _) = listener.accept().await?;

        tokio::spawn(async move {
            let mut buf = [0; 1024];

            // In a loop, read data from the socket and write the data back.
            loop {
                let n = match socket.read(&mut buf).await {
                    // socket closed
                    Ok(n) if n == 0 => return,
                    Ok(n) => n,
                    Err(e) => {
                        println!("failed to read from socket; err = {:?}", e);
                        return;
                    }
                };

                // Write the data back
                if let Err(e) = socket.write_all(&buf[0..n]).await {
                    println!("failed to write to socket; err = {:?}", e);
                    return;
                }
            }
        });
    }
}
```

上面的代码会被编译器翻译为下面的代码

```
use tokio::net::TcpListener;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::runtime::Runtime;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create the runtime
    let rt  = Runtime::new()?;

    // Spawn the root task
    rt.block_on(async {
        let listener = TcpListener::bind("127.0.0.1:8080").await?;

        loop {
            let (mut socket, _) = listener.accept().await?;

            tokio::spawn(async move {
                let mut buf = [0; 1024];

                // In a loop, read data from the socket and write the data back.
                loop {
                    let n = match socket.read(&mut buf).await {
                        // socket closed
                        Ok(n) if n == 0 => return,
                        Ok(n) => n,
                        Err(e) => {
                            println!("failed to read from socket; err = {:?}", e);
                            return;
                        }
                    };

                    // Write the data back
                    if let Err(e) = socket.write_all(&buf[0..n]).await {
                        println!("failed to write to socket; err = {:?}", e);
                        return;
                    }
                }
            });
        }
    })
}
```

#### 线程类型
Tokio能够通过重复交换每个线程上当前运行的任务，在几个线程上同时运行许多任务。然而，这种交换只能发生在 .await点，因此长时间运行都未到达.await的代码将阻止其他任务运行。为了解决这个问题，Tokio提供了两种线程：核心线程和阻塞线程。



**核心线程**

核心线程是所有异步代码运行的地方，默认情况下，Tokio将为每个CPU核心生成一个线程。可以使用环境变量TOKIO_WORKER_THREADS来覆盖默认值。

```
##[tokio::main]
async fn main() {
    let handle = tokio::spawn(async {
        // Do some async work
        "return value"
    });

    // Do some other work

    let out = handle.await.unwrap();
    println!("GOT {}", out);
}
```

**阻塞线程**

阻塞线程是按需生成的，可用于运行阻塞代码，否则会阻止其他任务运行，并且在一定时间内不使用时保持活动状态，可以使用thread_keep_alive进行配置。由于Tokio不可能像使用异步代码那样交换阻塞任务，因此阻塞线程数的上限非常大。这些限制可以在Builder上配置。

```
##[tokio::main]
async fn main() {
    // This is running on Tokio. We may not block here.

    let blocking_task = tokio::task::spawn_blocking(|| {
        // This is running on a thread where blocking is fine.
        println!("Inside spawn_blocking");
    });

    // We can wait for the blocking task like this:
    // If the blocking task panics, the unwrap below will propagate the
    // panic.
    blocking_task.await.unwrap();
}
```

技术选型

如果代码是CPU密集型的，并且希望限制用于运行它的线程数，则应该使用专门用于CPU绑定任务的单独线程池。例如，可以考虑使用rayon类库用于CPU密集型任务。也可以创建一个额外的Tokio运行时，专门用于CPU密集型的任务，但如果这样做，则应注意该额外的运行时仅运行CPU密集型任务，因为该运行时上的IO密集型任务会表现不佳。

#### 运行时配置
无论时什么线程类型，其都需要运行时支持（个人理解）。

异步应用程序需要运行时支持。特别需要以下运行时服务[copy from]：

* 一个称为驱动程序的I/O事件循环，它驱动I/O资源并将I/O事件分派给依赖它们的任务。
* 用于执行使用这些I/O资源的任务的调度程序。
* 一种计时器，用于安排工作在一段时间后运行。
在运行时的上下文中，使用tokio::spawn函数派生额外的任务。使用此函数派生的Future将在运行时使用的同一线程池上执行。



运行时是可以的配置的，其提供了多种任务调度策略。

Multi-Thread Scheduler

use tokio::runtime;

let threaded_rt = runtime::Runtime::new()?;
多线程调度使用工作窃取策略在线程池上执行Future。默认情况下，它将为系统上可用的每个CPU内核启动一个工作线程。这往往是大多数应用程序的理想配置。在默认情况下被选中。

多线程调度生成用于调度任务和spawn_blocking调用的线程。



Current-Thread Scheduler

当前线程调度程序提供了一个单线程的未来执行器。所有任务都将在当前线程上创建和执行。
```
use tokio::runtime;

let rt = runtime::Builder::new_current_thread().build()?;
```

#### 调度实现细节
Tokio只给了很少的承诺：

如果任务总数在没有绑定的情况下不会增长，并且没有任务阻塞线程，则可以保证任务得到公平调度。
更细节的是：

* 运行时在任何特定时间点上的任务总数永远不会超过MAX_TASKS。
* 对运行时上生成的任何任务调用轮询都会在MAX_SCHEDULE时间单位内返回。
如上两个配置可以用户指定，运行时就可以保证当任务被唤醒时，它将由运行时在MAX_DELAY时间单位（和任务数以及单次运行时长相关）内进行调度。



Multi-Thread Scheduler runtime 当前的实现 [from]

* 多线程运行时具有固定数量的工作线程，这些工作线程都是在启动时创建的。多线程运行时为每个工作线程维护一个全局队列和一个本地队列。工作线程的本地队列最多可容纳256个任务。如果向本地队列中添加了256个以上的任务，则其中一半会移动到全局队列中以腾出空间。
* 运行时将倾向于从本地队列中选择下一个要调度的任务，并且仅当本地队列为空时，或者如果它已连续从本地队列global_queue_interval次取任务时，才会从全局队列中取任务。如果没有使用运行时生成器显式设置global_queue_interval的值，则运行时将使用启发式方法动态计算该值，该启发式方法针对全局队列的每次检查之间的10ms间隔（基于worker_mean_poll_time度量）。
* 如果本地队列和全局队列都为空，则工作线程将尝试从另一个工作线程的本地队列中窃取任务。窃取是通过将一个本地队列中的一半任务移动到另一本地队列来完成的。
* 每当没有可调度的任务时，或者当运行时已连续调度61个任务时，运行时将检查新的IO或计时器事件。可以使用event_interval设置来改变数字61。
* 多线程运行时使用lifo-slot优化：每当一个任务唤醒另一个任务时，该任务就会被添加到工作线程的lifo-slok中，而不是添加到队列中。如果发生这种情况时lifo槽中已经有一个任务，那么lifo槽将被替换，并且过去位于lifo槽的任务将被放置在线程的本地队列中。当运行时完成对任务的调度时，它将立即调度lifo插槽中的任务（如果有的话）。使用lifo插槽时，协作预算不会重置。此外，如果一个工作线程连续三次使用lifo槽，它将被暂时禁用，直到该工作线程调度了一个不是来自lifo槽的任务。可以使用disable_lifo_slot设置禁用lifo插槽。lifo槽与本地队列是分开的，因此其他工作线程无法窃取lifo槽中的任务。
* 当任务从非工作线程的线程中唤醒时，该任务将被放置在全局队列中。


Current-Thread Scheduler  runtime 当前的实现 [from]

* 运行时维护两个已准备好调度的任务的FIFO队列：全局队列和本地队列。运行时将倾向于从本地队列中选择下一个要调度的任务，并且仅在本地队列为空或已连续31次从本地队列选择任务的情况下才从全局队列中选择任务。可以使用global_queue_interval设置更改数字31。
* 每当没有可调度的任务时，或者当运行时已连续调度61个任务时，运行时将检查新的IO或计时器事件。可以使用event_interval设置来改变数字61。
* 当任务从运行时上运行的任务中被唤醒时，被唤醒的任务将直接添加到本地队列中。否则，该任务将添加到全局队列中。
* 未使用lifo插槽优化。


#### 调度模型
当前看，Tokio是基于协作模式的，实现方案为 “资源预算控制”。

Tokio底层的实现的部分细节可以查看 https://tokio.rs/blog/2020-04-preemption。



## 对比总结
rust的多线程调度 和 Go GMP 相似度非常高。在IO密集型场景下都是比较适用的。