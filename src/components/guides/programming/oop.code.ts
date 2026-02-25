/**
 * Code snippets for OopGuide.tsx
 * Imported by src/app/guides/[id]/page.tsx → passed to <CodeBlock> (Shiki)
 *
 * Convention: export one const per code block, named [GUIDE]_CODE_[SECTION]
 * For single-snippet guides a plain OOP_CODE export is fine.
 */

export const OOP_CODE = `\
// 🔒 Encapsulation
class BankAccount {
  private balance: number = 0;
  getBalance() { return this.balance; }
  deposit(amount: number) { if (amount > 0) this.balance += amount; }
  withdraw(amount: number) { if (amount <= this.balance) this.balance -= amount; }
}

// 🎭 Abstraction
abstract class Shape { abstract area(): number; }
class Circle extends Shape {
  constructor(private radius: number) { super(); }
  area() { return Math.PI * this.radius ** 2; }
}
class Rectangle extends Shape {
  constructor(private w: number, private h: number) { super(); }
  area() { return this.w * this.h; }
}

// 🧬 Inheritance + 🔄 Polymorphism
class Animal { speak(): string { return '...'; } }
class Dog extends Animal { speak() { return 'Woof!'; } }
class Cat extends Animal { speak() { return 'Meow!'; } }

const animals: Animal[] = [new Dog(), new Cat()];
animals.forEach(a => console.log(a.speak())); // Woof! Meow!
`;
