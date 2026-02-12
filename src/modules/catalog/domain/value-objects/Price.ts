export class Price {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static create(amount: number, currency: string = 'EUR'): Price {
    if (amount < 0) {
      throw new Error('Price amount cannot be negative');
    }
    if (!['EUR', 'USD', 'GBP'].includes(currency)) {
      throw new Error(`Invalid currency: ${currency}`);
    }
    return new Price(amount, currency);
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Price): Price {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add prices with different currencies');
    }
    return new Price(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Price {
    return new Price(this.amount * factor, this.currency);
  }

  toNumber(): number {
    return this.amount;
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }
}
