# commonJS 规范

## 2018-10-31

### commonJS 规范

- 一个单独的文件就是一个模块。每一个模块都是一个单独的作用域，也就是说，在该模块内部定义的变量，无法被其他模块读取，除非定义为 `global` 对象的属性
- 输出模块变量的最好方法是使用 `module.exports` 对象
- 加载模块使用 `require` 方法，该方法读取一个文件并执行，返回文件内部的 `module.exports` 对象

**注：** `require` 是同步的。模块系统需要同步读取模块文件内容，并编译执行以得到模块接口。

### 1. module 对象

`Node` 内部提供一个 `Module` 构建函数。所有模块都是 `Module` 的实例

每个模块内部，都有一个 `module` 对象，代表当前模块。它有以下属性

> - `module.id` 模块的识别符，通常是带有绝对路径的模块文件名。
> - `module.filename` 模块的文件名，带有绝对路径。
> - `module.loaded` 返回一个布尔值，表示模块是否已经完成加载。
> - `module.parent` 返回一个对象，表示调用该模块的模块。
> - `module.children` 返回一个数组，表示该模块要用到的其他模块。
> - `module.exports` 表示模块对外输出的值。

#### 1.1 module.exports 属性

`module.exports` 属性表示当前模块对外输出的接口，其他文件加载该模块，实际上就是读取 `module.exports` 变量

#### 1.2 exports 变量

`Node` 为每个模块提供一个 `exports` 变量，指向 `module.exports`。这等同在每个模块头部，有一行这样的命令

```javascript
var exports = module.exports;
```

因此，可以给 `exports` 上添加方法

```javascript
exports.area = function (r) {
  return Math.PI * r * r;
};

exports.circumference = function (r) {
  return 2 * Math.PI * r;
};
```

**注：** 不能直接将 `exports` 变量指向一个值，因为这样等于切断了 `exports` 与 `module.exports` 的联系

### 2. require 命令

#### 2.1 基本用法

`require` 命令的基本功能是，读入并执行一个 `JavaScript` 文件，然后返回该模块的 `exports` 对象。如果没有发现指定模块，会报错

#### 2.2 加载规则

`require` 命令用于加载文件，后缀名默认为 `.js`

```javascript
var foo = require('foo');
//  等同于
var foo = require('foo.js');
```
根据参数的不同格式，`require` 命令去不同路径寻找模块文件

- 如果参数字符串以 `"/"` 开头，则表示加载的是一个位于绝对路径的模块文件。比如，`require('/home/marco/foo.js')` 将加载 `/home/marco/foo.js`
- 如果参数字符串以 `"./"` 开头，则表示加载的是一个位于相对路径（跟当前执行脚本的位置相比）的模块文件。比如，`require('./circle')` 将加载当前脚本同一目录的 `circle.js`
- 如果参数字符串不以 `"./"` 或 `"/"` 开头，则表示加载的是一个默认提供的核心模块（位于 `Node` 的系统安装目录中），或者一个位于各级 `node_modules` 目录的已安装模块（全局安装或局部安装）

举例来说，脚本 `/home/user/projects/foo.js` 执行了 `require('bar.js')` 命令，`Node` 会依次搜索以下文件

> - /usr/local/lib/node/bar.js
> - /home/user/projects/node_modules/bar.js
> - /home/user/node_modules/bar.js
> - /home/node_modules/bar.js
> - /node_modules/bar.js

这样设计的目的是，使得不同的模块可以将所依赖的模块本地化

- 如果参数字符串不以 `"./"` 或 `"/"` 开头，而且是一个路径，比如 `require('example-module/path/to/file')` ，则将先找到 `example-module` 的位置，然后再以它为参数，找到后续路径
- 如果指定的模块文件没有发现，`Node` 会尝试为文件名添加 `.js、.json、.node` 后，再去搜索。`.js` 件会以文本格式的 `JavaScript` 脚本文件解析，`.json` 文件会以 `JSON` 格式的文本文件解析，`.node` 文件会以编译后的二进制文件解析
- 如果想得到 `require` 命令加载的确切文件名，使用 `require.resolve()` 方法

#### 2.3 目录的加载规则

通常，我们会把相关的文件会放在一个目录里面，便于组织。这时，最好为该目录设置一个入口文件，让 `require` 方法可以通过这个入口文件，加载整个目录

在目录中放置一个 `package.json` 文件，并且将入口文件写入 `main` 字段。下面是一个例子

```javascript
// package.json
{
  "name" : "some-library",
  "main" : "./lib/some-library.js"
}
```

`require` 发现参数字符串指向一个目录以后，会自动查看该目录的 `package.json` 文件，然后加载 `main` 字段指定的入口文件。如果 `package.json` 文件没有 `main` 字段，或者根本就没有 `package.json` 文件，则会加载该目录下的 `index.js` 文件或 `index.node` 文件


#### 2.4 模块的缓存

第一次加载某个模块时，`Node` 会缓存该模块。以后再加载该模块，就直接从缓存取出该模块的 `module.exports` 属性

```javascript
require('./example.js');
require('./example.js').message = "hello";
require('./example.js').message
// "hello"
```

上面代码中，连续三次使用 `require` 命令，加载同一个模块。第二次加载的时候，为输出的对象添加了一个 `message` 属性。但是第三次加载的时候，这个 `message` 属性依然存在，这就证明 `require` 命令并没有重新加载模块文件，而是输出了缓存

所有缓存的模块保存在 `require.cache` 之中，如果想删除模块的缓存，可以像下面这样写

```javascript
// 删除指定模块的缓存
delete require.cache[moduleName];

// 删除所有模块的缓存
Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
})
```

**注:** 缓存是根据绝对路径识别模块的，如果同样的模块名，但是保存在不同的路径，`require` 命令还是会重新加载该模块

#### 2.5 环境变量 NODE_PATH

`Node` 执行一个脚本时，会先查看环境变量 `NODE_PATH`。它是一组以冒号分隔的绝对路径。在其他位置找不到指定模块时，`Node` 会去这些路径查找。

可以将 `NODE_PATH` 添加到 `.bashrc`。

`NODE_PATH` 是历史遗留下来的一个路径解决方案，通常不应该使用，而应该使用 `node_modules` 目录机制。

#### 2.6 模块的循环加载

如果发生模块的循环加载，即A加载B，B又加载A，则B将加载A的不完整版本。

```javascript
// a.js
exports.x = 'a1';
console.log('a.js ', require('./b.js').x);
exports.x = 'a2';

// b.js
exports.x = 'b1';
console.log('b.js ', require('./a.js').x);
exports.x = 'b2';

// main.js
console.log('main.js ', require('./a.js').x);
console.log('main.js ', require('./b.js').x);
// console.log()
// $ node main.js
// b.js  a1
// a.js  b2
// main.js  a2
// main.js  b2

// 修改 main.js
console.log('main.js ', require('./a.js').x);
console.log('main.js ', require('./b.js').x);
console.log('main.js ', require('./a.js').x);
console.log('main.js ', require('./b.js').x);
// console.log()
// $ node main.js
// b.js  a1
// a.js  b2
// main.js  a2
// main.js  b2
// main.js  a2
// main.js  b2
```

上面代码中，第二次加载 `a.js` 和 `b.js` 时，会直接从缓存读取 `exports` 属性，所以 `a.js` 和 `b.js` 内部的 `console.log` 语句都不会执行了。


#### 2.7 require.main

`require` 方法有一个 `main` 属性，可以用来判断模块是直接执行，还是被调用执行。

直接执行的时候`（node module.js）`，`require.main`属性指向模块本身。

```javascript
require.main === module
// true
```

调用执行的时候（通过 `require` 加载该脚本执行），上面的表达式返回 `false`。

### 3. 模块的加载机制

`CommonJS` 模块的加载机制是，输入的是被输出的值的拷贝。也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。

#### 3.1 require 的内部处理流程

`require` 命令是 `CommonJS` 规范之中，用来加载其他模块的命令。它其实不是一个全局命令，而是指向当前模块的 `module.require` 命令，而后者又调用 `Node` 的内部命令 `Module._load`。

```javascript
Module._load = function(request, parent, isMain) {
  // 1. 检查 Module._cache，是否缓存之中有指定模块
  // 2. 如果缓存之中没有，就创建一个新的Module实例
  // 3. 将它保存到缓存
  // 4. 使用 module.load() 加载指定的模块文件，
  //    读取文件内容之后，使用 module.compile() 执行文件代码
  // 5. 如果加载/解析过程报错，就从缓存删除该模块
  // 6. 返回该模块的 module.exports
};

Module.prototype._compile = function(content, filename) {
  // 1. 生成一个require函数，指向module.require
  // 2. 加载其他辅助方法到require
  // 3. 将文件内容放到一个函数之中，该函数可调用 require
  // 4. 执行该函数
};
```

一旦 `require` 函数准备完毕，整个所要加载的脚本内容，就被放到一个新的函数之中，这样可以避免污染全局环境。该函数的参数包括 `require`、`module`、`exports`，以及其他一些参数。

```javascript
(function (exports, require, module, __filename, __dirname) {
  // YOUR CODE INJECTED HERE!
});
```

`Module._compile` 方法是同步执行的，所以 `Module._load` 要等它执行完成，才会向用户返回 `module.exports` 的值。

**`Module._onload` 源码如下：**

```javascript
Module._load = function(request, parent, isMain) {

  //  计算绝对路径
  var filename = Module._resolveFilename(request, parent);

  //  第一步：如果有缓存，取出缓存
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    return cachedModule.exports;

  // 第二步：是否为内置模块
  if (NativeModule.exists(filename)) {
    return NativeModule.require(filename);
  }

  // 第三步：生成模块实例，存入缓存
  var module = new Module(filename, parent);
  Module._cache[filename] = module;

  // 第四步：加载模块
  try {
    module.load(filename);
    hadException = false;
  } finally {
    if (hadException) {
      delete Module._cache[filename];
    }
  }

  // 第五步：输出模块的exports属性
  return module.exports;
};
```

**`Module._onload` 流程图如下：**

<div align=center>

![](https://image-static.segmentfault.com/327/020/3270203601-58ad22173618f_articlex)

</div>
