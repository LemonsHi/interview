// TypeScript 里的类型注解是一种轻量级的为函数或变量添加约束的方式
// function greeter(person: string) {
//     return "Hello, " + person;
// }
//
// let user = "Jane User";
//
// //let user = [0, 1, 2];
// //greeter.ts(7,26): error TS2345: Argument of type 'number[]' is not assignable to parameter of type 'string'.
//
//
// document.body.innerHTML = greeter(user);
// 接口
// interface Person {
//     firstName: string;
//     lastName: string;
// }
//
// function greeter(person: Person) {
//     return "Hello, " + person.firstName + " " + person.lastName;
// }
//
// let user = { firstName: "Jane", lastName: "User" };
//
// document.body.innerHTML = greeter(user);
// 类
var Student = /** @class */ (function () {
    // 在 constructor 中将 firstName、middleInitial、lastName 绑定到 this 上面
    // 所以在后续 greeter 中可以将 Student 的实例传递进去
    // new Student('...', '...', '...') 是满足 Person 这个接口的
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
    return Student;
}());
function greeter(person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
var user = new Student("Jane", "M.", "User");
document.body.innerHTML = greeter(user);
