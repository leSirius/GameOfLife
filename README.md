
# 性能优化
计算量来源：矩阵计算；矩阵拷贝成本；
在稀疏矩阵上，矩阵拷贝成本不可忽略（在template配合1000x1000扩展地图，这两个成本比较接近）；在稠密矩阵上，性能开销主要在矩阵计算，计算量与活跃点数（或者邻居map）的规模成线性关系，而1000x1000的复制基本1ms以内。

1. 合并循环。每次执行每次重新计算状态并绘制时，从三个循环合并成两个或一个。这个优化没有明显效果，合并循环有可能提升缓存命中率，但几乎不会节省计算量。
2. 移除react渲染。在一个小测试集上，每次update执行的脚本时间达到了10毫秒左右，经过排查原因是setState导致了react渲染。特别是，左侧控制栏上方的几个input和button组合（这里使用了NextUi库的组件），使用useMemo和memo优化（或者删除）这些组件可以使脚本时间减少到3毫秒左右。但把setState改为使用useRef追踪状态更好一些，这样用时0.5ms左右。(此外，在初始化时，这里面number类型的输入框会导致nav-bar组件重复渲染；更新时正常）
3. 并行。这个矩阵计算除了邻居以外没有数据依赖，比较适合并行优化。因为worker线程需要切分、合并矩阵，收发消息导致了额外的成本，这让该版本在稀疏矩阵或者活跃点较少时没有明显优势。
在稠密矩阵上，并行版本的优势明显。因为随着计算的执行，矩阵会逐渐变稀疏，数据是前5次以内的执行情况。在500x500，稠密度0.5的地图上，并行版本每次计算主线程总执行时间在80-130ms之间，worker线程大约16-30ms左右。而串行版本从接近300ms向150ms递减之间，后续会更低（这个串行版本还针对稀疏矩阵减少过矩阵复制，不过在稠密情况下，性能受到矩阵复制影响不明显）。
4. 稀疏矩阵。在稀疏矩阵上，矩阵的复制成本相对于活跃点计算变得难以忽视。在使用template但扩容地图到1000x1000时，遍历的串行版本需要10ms左右，经过liveList记录活跃点列表与使用map记录邻居数量，优化版本用时在2到3毫秒左右，而创建一个空的1000x1000矩阵或者同规模深拷贝大约0.5-1ms左右，原本useRef使用了深拷贝，在这里不稳妥地改为了浅拷贝，减少了一次调用。

imageData对象转移

# SSR与动态导入
## 需求
canvas的绘制需要客户端的`window.devicePixelRatio`，与SSR冲突。框架默认的SSR需要用动态导入禁用。在服务端通过处理`undefined`设置默认值1以后，浏览器显示canvas的情况可以反映当前呈现的是哪里的绘制结果。
测试中的父组件是page组件，子组件是GameOfLife组件，页面主要元素在子组件。为了禁用SSR可以使用动态导入，这个子组件是初始渲染必须的，所以动态加载节省初始渲染成本的用途不适用。

现在的实现把`devicePixelRatio`的state放到`canvas.js`组件中，侧边栏使用一个参与缩放比计算的参数state，可以被预渲染了。

```
page.js  ->  GameOfLife.js  ->  canvas.js
                            ->  nav-bar.js
```
**动态导出**

动态导出是个随便起的描述，从StackOverflow看到的一个看起来意思的写法。在动态导入本文件包含的代码再导出，然后在做导入的文件写静态导入。
```
export default dynamic(() => Promise.resolve(Canvas), { ssr: false });
function Canvas(){...}
```

## 使用静态导入：
1. 浏览器呈现的是服务端预渲染的结果。报错服务端与客户端渲染结果（canvas的样式宽度）不匹配。刷新页面开启节流时才会察觉闪烁（除了蓝色背景外所有的内容消失重绘一下）。

: 浏览器收到的一个预渲染完成的html，然后客户端react组件在浏览器执行并水合。react-dom会报错提示渲染服务端与服务端渲染结果不同。因为页面是直接解析html渲染的，不用等待JS加载与执行，这种呈现方式是最快的.

2. 当在子组件中未处理`undefined`就使用依赖浏览器环境的值时，浏览器会呈现本地渲染的页面结果，刷新会闪白屏。错误码`500`。

: 在使用window对象等依赖浏览器的变量时，子组件的预渲染因为undefined导致渲染失败，收到的html是空的（成功html会有蓝色背景），服务端会报错渲染失败的错误。页面内容全由js加载和解析提供，所以空白时间明显增加。服务端环境与客户端对undefined的处理不同。

## 使用动态导入
显式禁用ssr，浏览器总是得到一个几乎为空的HTML，初始呈现速度较SSR慢：

1. 如果父组件是客户端组件，导入方式为动态导入。GameOfLife在一个单独的js文件中，对这个js的请求由page.js发起。

: 浏览器收到html文件，从`<header>`里请求page.js文件（async属性），然后等page.js加载完执行时请求game-of-life组件文件。
 preload scanner可以优化`<header>`里的请求，不（该）优化对game-of-life组件的请求，所以请求很迟，请求发起时间在600ms-800ms之间，有时比`<header>`中的ico文件还晚。（懒加载典型情况）

2. 如果父组件是客户端组件，导入方式为在子组件动态导出。GameOfLife组件打包进page.js，没有分包传输。

: 父组件静态导入，子组件编译时被打包进了page.js，当page.js执行到相应位置的时候可以从本文件获取导入的组件，不再发起请求。在只想要禁用SSR的需求下，这种设置比前一个效率高。

3. 如果父组件是服务端组件，导入方式为在子组件动态导出。GameOfLife组件打包进page.js，没有分包传输。

4. 如果父组件是服务端组件，导入方式为在父组件动态导入。GameOfLife组件打包进page.js，没有分包传输。

父组件是服务端组件的情况下，浏览器上的执行情况没有发现或想到明显区别。


