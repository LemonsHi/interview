# 常见前端面试 - ES6 篇

## 2018-10-28

1. let 和 const

- let 特性

  - 不存在变量提升
  - 暂时性死区
  - 不允许重复声明

- const

  - 不存在变量提升
  - 暂时性死区
  - 不允许重复声明
  - 不允许修改

2. Symbol

`ES6` 引入了一种新的原始数据类型 `Symbol`，表示独一无二的值。它是 `JavaScript` 语言的第七种数据类型，前六种是：`undefined`、`null`、`布尔值（Boolean）`、`字符串（String）`、`数值（Number）`、`对象（Object）`

**注:** `Symbol` 函数前不能使用 `new` 命令，否则会报错。这是因为生成的 `Symbol` 是一个原始类型的值，不是对象。也就是说，由于 `Symbol` 值不是对象，所以不能添加属性。基本上，它是一种类似于字符串的数据类型

`Symbol` 函数可以接受一个字符串作为参数，表示对 `Symbol` 实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分

```javascript
let s1 = Symbol('foo');
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"
```

如果 `Symbol` 的参数是一个对象，就会调用该对象的 `toString` 方法，将其转为字符串，然后才生成一个 `Symbol` 值

```javascript
const obj = {
  toString() {
    return 'abc';
  }
};
const sym = Symbol(obj);
sym // Symbol(abc)
```

*Symbol 特点*

- `Symbol` 值不能与其他类型的值进行运算，会报错
- `Symbol` 值可以显式转为字符串
- `Symbol` 值也可以转为布尔值，但是不能转为数值

*Symbol 遍历*

**属性名的遍历:** 它也不是私有属性，有一个 `Object.getOwnPropertySymbols` 方法，可以获取指定对象的所有 `Symbol` 属性名。`Reflect.ownKeys` 方法可以返回所有类型的键名，包括常规键名和 `Symbol` 键名

*Symbol 应用*

- **作为属性名的 `Symbol`:** 由于每一个 `Symbol` 值都是不相等的，这意味着 `Symbol` 值可以作为标识符，用于对象的属性名，就能保证不会出现同名的属性

  **注:** `Symbol` 值作为对象属性名时，不能用点运算符

  ```javascript
  let s = Symbol();
  let obj = {
    [s]: function (arg) { ... }
  };
  obj[s](123);
  ```

- **私有化:** 由于以 `Symbol` 值作为名称的属性，不会被常规方法遍历得到。我们可以利用这个特性，为对象定义一些非私有的、但又希望只用于内部的方法

  ```javascript
  let size = Symbol('size');

  class Collection {
    constructor() {
      this[size] = 0;
    }

    add(item) {
      this[this[size]] = item;
      this[size]++;
    }

    static sizeOf(instance) {
      return instance[size];
    }
  }

  let x = new Collection();
  Collection.sizeOf(x) // 0

  x.add('foo');
  Collection.sizeOf(x) // 1

  Object.keys(x) // ['0']
  Object.getOwnPropertyNames(x) // ['0']
  Object.getOwnPropertySymbols(x) // [Symbol(size)]
  ```

  上面代码中，对象 `x` 的 `size` 属性是一个 `Symbol` 值，所以 `Object.keys(x)` 、`Object.getOwnPropertyNames(x)` 都无法获取它。这就造成了一种非私有的内部方法的效果

- **`11` 个内置的 `Symbol` 值**
  - Symbol.hasInstance

  ```javascript
  class MyClass {
    [Symbol.hasInstance](foo) {
      return foo instanceof Array;
    }
  }

  // 实际调用的是 [Symbol.hasInstance] 方法
  [1, 2, 3] instanceof new MyClass() // true
  ```

  - Symbol.isConcatSpreadable

  ```javascript
  let arr1 = ['c', 'd'];
  ['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
  arr1[Symbol.isConcatSpreadable] // undefined

  let arr2 = ['c', 'd'];
  arr2[Symbol.isConcatSpreadable] = false;
  ['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c','d'], 'e']
  ```

  对象的 `Symbol.isConcatSpreadable` 属性等于一个布尔值，表示该对象用于 `Array.prototype.concat()` 时，是否可以展开

  - Symbol.toStringTag

  ```javascript
  // 例一
  (
    {
      [Symbol.toStringTag]: 'Foo'
    }.toString()
  )
  // "[object Foo]"

  // 例二
  class Collection {
    get [Symbol.toStringTag]() {
      return 'xxx';
    }
  }
  let x = new Collection();
  Object.prototype.toString.call(x) // "[object xxx]"
  ```

  - Symbol.toPrimitive

  ```javascript
  let obj = {
    [Symbol.toPrimitive](hint) {
      switch (hint) {
        case 'number':
          return 123;
        case 'string':
          return 'str';
        case 'default':
          return 'default';
        default:
          throw new Error();
       }
     }
  };

  2 * obj // 246
  3 + obj // '3default'
  obj == 'default' // true
  String(obj) // 'str'
  ```

  `Symbol.toPrimitive` 被调用时，会接受一个字符串参数，表示当前运算的模式

  - Symbol.iterator

  ```javascript
  class Collection {
    *[Symbol.iterator]() {
      let i = 0;
      while(this[i] !== undefined) {
        yield this[i];
        ++i;
      }
    }
  }

  let myCollection = new Collection();
  myCollection[0] = 1;
  myCollection[1] = 2;

  for(let value of myCollection) {
    console.log(value);
  }
  // 1
  // 2
  ```

  对象的 `Symbol.iterator` 属性，指向该对象的默认遍历器方法

  - Symbol.split

  ```javascript
  class MySplitter {
    constructor(value) {
      this.value = value;
    }
    [Symbol.split](string) {
      let index = string.indexOf(this.value);
      if (index === -1) {
        return string;
      }
      return [
        string.substr(0, index),
        string.substr(index + this.value.length)
      ];
    }
  }

  'foobar'.split(new MySplitter('foo'))
  // ['', 'bar']

  'foobar'.split(new MySplitter('bar'))
  // ['foo', '']

  'foobar'.split(new MySplitter('baz'))
  // 'foobar'
  ```

  对象的 `Symbol.split` 属性，指向一个方法，当该对象被 `String.prototype.split` 方法调用时，会返回该方法的返回值

  - Symbol.search

  对象的Symbol.search属性，指向一个方法，当该对象被String.prototype.search方法调用时，会返回该方法的返回值

  - Symbol.replace

  对象的Symbol.replace属性，指向一个方法，当该对象被String.prototype.replace方法调用时，会返回该方法的返回值

  - Symbol.match

  对象的Symbol.match属性，指向一个函数。当执行str.match(myObject)时，如果该属性存在，会调用它，返回该方法的返回值

  - Symbol.unscopables

  对象的 `Symbol.unscopables` 属性，指向一个对象。该对象指定了使用 `with` 关键字时，哪些属性会被 `with` 环境排除

  ```javascript
  // 没有 unscopables 时
  class MyClass {
    foo() { return 1; }
  }

  var foo = function () { return 2; };

  with (MyClass.prototype) {
    foo(); // 1
  }

  // 有 unscopables 时
  class MyClass {
    foo() { return 1; }
    get [Symbol.unscopables]() {
      return { foo: true };
    }
  }

  var foo = function () { return 2; };

  with (MyClass.prototype) {
    foo(); // 2
  }
  ```

  - Symbol.species

  `Symbol.species` 的作用在于，实例对象在运行过程中，需要再次调用自身的构造函数时，会调用该属性指定的构造函数。它主要的用途是，有些类库是在基类的基础上修改的，那么子类使用继承的方法时，作者可能希望返回基类的实例，而不是子类的实例

  ```javascript
  class T1 extends Promise {}

  class T2 extends Promise {
    static get [Symbol.species]() {
      return Promise;
    }
  }

  new T1(r => r()).then(v => v) instanceof T1 // true
  new T2(r => r()).then(v => v) instanceof T2 // false
  ```

3. Set 和 Map

- Set 数据结构

ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。

数据去重：

```javascript
[...new Set([1, 2, 3, 4, 4, 5, 5])]
```

4. 箭头函数

箭头函数有几个使用注意点。

- 函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象
- 不可以当作构造函数，也就是说，不可以使用new命令，否则会抛出一个错误
- 不可以使用arguments对象，该对象在函数体内不存在。如果要用，可以用 rest 参数代替
- 不可以使用yield命令，因此箭头函数不能用作 Generator 函数
