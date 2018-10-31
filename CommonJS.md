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