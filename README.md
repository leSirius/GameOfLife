This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 动态导入
服务端预渲染与导入方式测试：
canvas的绘制需要window.devicePixelRatio条件样式宽度与宽度属性的比例。
window.devicePixelRatio只可以在浏览器获取，在服务端通过处理undefined赋值为1，所以浏览器显示canvas的情况可以反映当前呈现的是哪里的绘制结果。
window.devicePixelRatio被用于设置一个ratio的state。
动态导入开启意味着按需导入，只有客户端组件会被动态导入，即使动态导入一个服务端组件，也只有它的客户端子组件是动态导入的。
动态导入意味着按需导入，在这个测试里总是会立即导入的。


使用静态导入：
1. 没有行为会导致浏览器和服务端差异的时，浏览器呈现的是服务端预渲染的结果，即使浏览器可以打印出1.75的正确缩放比：它们并不匹配。一个优点是刷新不闪白屏，使用slow 3G节流时会白屏
2. 当在react渲染过程中打印window对象、window.devicePixelRatio这样的值时，浏览器会呈现本地渲染的页面结果，刷新会闪白屏。控制台会报错。（但打印state值，不会造成这个结果，即使它不同， checkhere）

%% 动态导出是一个瞎起的名字，指在game-of-life文件内动态导入GameOfLife组件（期约），然后导出这个动态导入的结果。父组件导入的时候则是静态的。父组件时page组件，子组件时GameOfLife组件 %%
当使用动态导入时，显式禁用ssr，浏览器得到的是（预）渲染完父组件的HTML，所以canvas显示浏览器渲染的结果： 
1. 如果父组件是客户端组件，导入方式为在父组件动态导入。GameOfLife在一个单独的js文件中，对这个js的请求由page.js发起，不能被preload scanner优化。
2. 如果父组件是客户端组件，导入方式为在子组件动态导出。GameOfLife组件打包进page.js，没有分包传输。
3. 如果父组件是服务端组件，导入方式为在父组件动态导入。GameOfLife组件打包进page.js，没有分包传输。
4. 如果父组件是服务端组件，导入方式为在子组件动态导出。GameOfLife组件打包进page.js，没有分包传输。

对客户端组件来说，可以考虑一下导入方式，根据禁用ssr或异步加载的需求进行选择。

当使用动态导入，启用ssr时，浏览器得到一个预渲染的HTML：
1. 父组件是客户端组件，导入方式为父组件动态导入时。页面先显示预渲染的HTML页面，canvas没有绘制，然后变成浏览器渲染页面，nav-bar闪烁（GameOfLife预渲染了一次，然后请求的回来的组件代码又整个重新渲染了一次）。GameOfLife组件被分包传输，这里的情况有些类似FOUC，page.js是`async`的。
2. 父组件是客户端组件，导入方式为子组件动态导出时。页面先显示预渲染的HTML页面，canvas没有绘制，然后变成浏览器渲染页面，nav-bar不闪烁。
3. 父组件是服务端组件，导入方式为子组件动态导出时。页面先显示预渲染的HTML页面，但canvas没有绘制，然后变成浏览器渲染的页面。
4. 父组件是服务端组件，导入方式为父组件动态导入时。页面显示预渲染的HTML，不再发生变化。

# 行为解释
静态导入
1. 预渲染的存在，让浏览器收到的一个已经渲染完成的html，而客户端react组件仍会在浏览器渲染。react-dom会报错提示渲染服务端与服务端渲染结果不同，这里可能与react-dom的比较和选择策略有关。因为得到的是渲染完成html，这时的刷新体验是比较好的，不用等待js加载与执行来渲染页面。（虚拟DOM的比较和选择是怎么做的？浏览器白屏时间是在什么时候？）
2. 

hydrate只对客户端组件存在的。

next.js默认为客户端组件提供服务端预渲染，除非显式跳过ssr；服务端组件会在服务端渲染一次，而客户端组件会在服务端预渲染一次，浏览器一次。
ssr开启意味着html中会有被动态导入的组件渲染完的对应内容，一般会要求浏览器与服务端渲染匹配。ssr关闭意味着html中组件对应部分为空白，等待js填充。

如果父组件是一个服务端组件，被动态导入的组件事实上没有分包单独传输，在GameOfLife子组件仍会会被打包进page.js。这时候，得到HTML与之前不同，
动态导入的组件没有被预渲染，HTML文件事实上是空的，它的内容需要浏览器运行js注入。这样canvas显示当然会一直正确，刷新会白屏。

想要分包需要父组件也是一个客户端组件，这样动态导入的组件会被分包传输，GameOfLife会被打包进一个单独的js传输。

next.js提供了服务端预渲染。只有静态导入时，浏览器请求网页，除了react代码，它也得到了预渲染渲染之后的HTML文件。
浏览器随后执行React渲染，对于这两次渲染，如果它们的结果（或者行为？）一样的话，浏览器会直接呈现预渲染的结果。
测试中，渲染结果是哪一个可以根据window.devicePixelInfo判别，服务端因为没有window对象
当父组件是一个服务端组件时，子组件事实上在服务端预渲染时导入。跟静态导入不同的是，这里导入的是js代码，不会执行得到HTML。
next.js对于动态导入的处理，根据组件类型有一定区别。

客户端浏览器得到响应，再执行这部分js代码来渲染页面。

