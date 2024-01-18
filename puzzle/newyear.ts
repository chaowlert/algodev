function* permute<T>(list: T[]): Generator<T[]> {
  if (list.length === 1) {
    return yield list
  }

  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const nextList = list.slice(0, i).concat(list.slice(i + 1))
    for (const permuted of permute(nextList)) {
      yield [item, ...permuted]
    }
  }
}

function* binaryBracketing<T>(list: T[], op: (a: T, b: T) => T): Generator<T> {
  if (list.length === 1) {
    return yield list[0]
  }

  for (let i = 1; i < list.length; i++) {
    for (const left of binaryBracketing(list.slice(0, i), op)) {
      for (const right of binaryBracketing(list.slice(i), op)) {
        yield op(left, right)
      }
    }
  }
}

interface Expression {
  toString(): string
  valueOf(): number
  rank(): number
  precedence: number
}

abstract class UnaryExpression implements Expression {
  constructor(protected node: Expression) {}
  abstract toString(): string
  abstract valueOf(): number
  abstract rankValue: number
  precedence = 0

  rank(): number {
    return Math.max(this.node.rank(), this.rankValue)
  }
}

abstract class BinaryExpression implements Expression {
  constructor(protected left: Expression, protected right: Expression) {}
  abstract toString(): string
  abstract valueOf(): number
  abstract rankValue: number
  abstract precedence: number

  rank(): number {
    return Math.max(this.left.rank(), this.right.rank(), this.rankValue)
  }

  protected format(node: Expression, minPrecedence: number) {
    return node.precedence >= minPrecedence ? `(${node})` : node
  }
}

class ConstantExpression implements Expression {
  constructor(public num: number) {}

  toString(): string {
    return this.num.toString()
  }
  valueOf(): number {
    return this.num
  }
  rank(): number {
    return 0
  }
  precedence = 0
}

// + - => 3
// * / => 2
// ^ => 1

// 8!
// (2^3)!

class FactorialExpression extends UnaryExpression {
  toString(): string {
    return this.node.precedence >= 1 ? `(${this.node})!` : `${this.node}!`
  }

  private fact(n: number) {
    return n <= 1 ? 1 : n * this.fact(n - 1)
  }

  valueOf(): number {
    const val = +this.node
    return val < 0 || val >= 10 || ~~val !== val ? NaN : this.fact(val)
  }

  rankValue = 4
}

class SqrtExpression extends UnaryExpression {
  toString(): string {
    return `sqrt(${this.node})`
  }
  valueOf(): number {
    return Math.sqrt(+this.node)
  }
  rankValue = 3
}

class AddExpression extends BinaryExpression {
  toString(): string {
    return `${this.left} + ${this.right}`
  }
  valueOf(): number {
    return +this.left + +this.right
  }
  rankValue = 1
  precedence = 3
}

// 2 - (5 + 7)
// 2 - 5 * 7

class SubtractExpression extends BinaryExpression {
  toString(): string {
    return `${this.left} - ${this.format(this.right, 3)}`
  }
  valueOf(): number {
    return +this.left - +this.right
  }
  rankValue = 1
  precedence = 3
}

class MultiplyExpression extends BinaryExpression {
  toString(): string {
    return `${this.format(this.left, 3)} * ${this.format(this.right, 3)}`
  }
  valueOf(): number {
    return +this.left * +this.right
  }
  rankValue = 1
  precedence = 2
}

// 7 / (5 * 2)
// 7 / 5^2

class DivideExpression extends BinaryExpression {
  toString(): string {
    return `${this.format(this.left, 3)} / ${this.format(this.right, 2)}`
  }
  valueOf(): number {
    return +this.left / +this.right
  }
  rankValue = 1
  precedence = 2
}

// 5 ^ (2^6)

class PowerExpression extends BinaryExpression {
  toString(): string {
    return `${this.format(this.left, 2)}^${this.format(this.right, 1)}`
  }
  valueOf(): number {
    return (+this.left) ** +this.right
  }
  rankValue = 2
  precedence = 1
}

class ConcatExpression extends ConstantExpression {
  constructor(left: ConstantExpression, right: ConstantExpression) {
    super(+`${left}${right}`)
  }

  rank(): number {
    return 5
  }
}

class SingletonIterable implements Iterable<Expression> {
  constructor(private num: number) {}

  *[Symbol.iterator](): Iterator<Expression> {
    yield new ConstantExpression(this.num)
  }
}

class UnaryIterable implements Iterable<Expression> {
  constructor(private iterator: Iterable<Expression>) {}
  
  *[Symbol.iterator](): Iterator<Expression> {
    for (const node of this.iterator) {
      yield node
      yield new SqrtExpression(node)
      if (node instanceof ConstantExpression) {
        yield new FactorialExpression(node)
      }
    }
  }
}

class BinaryIterable implements Iterable<Expression> {
  constructor(private left: Iterable<Expression>, private right: Iterable<Expression>) {}
  
  *[Symbol.iterator](): Iterator<Expression> {
    for (const a of this.left) {
      for (const b of this.right) {
        yield new AddExpression(a, b)
        yield new SubtractExpression(a, b)
        yield new MultiplyExpression(a, b)
        yield new DivideExpression(a, b)
        yield new PowerExpression(a, b)
        if (a instanceof ConstantExpression && b instanceof ConstantExpression) {
          yield new ConcatExpression(a, b)
        }
      }
    }
  }
}

type Answer = {
  rank: number
  solution: string
}
function newyear(num: number[]) {
  const result: Answer[] = []
  const numExpr = num.map(it => new UnaryIterable(new SingletonIterable(it)))
  for (const nums of permute(numExpr)) {
    for (const iter of binaryBracketing(nums, (a, b) => new UnaryIterable(new BinaryIterable(a, b)))) {
      for (const expr of iter) {
        const ans = +expr
        if (ans < 0 || ans > 100 || ~~ans !== ans || !isFinite(ans)) {
          continue
        }
        const old = result[ans]
        const rank = expr.rank()
        if (old?.rank <= rank) {
          continue
        }
        const solution = expr.toString()
        result[ans] = { rank, solution }
      }
    }
  }
  return result
}

const result = newyear([2, 5, 6, 7])
console.table(result)
