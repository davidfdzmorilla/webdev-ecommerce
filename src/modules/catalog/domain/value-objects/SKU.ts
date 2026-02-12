export class SKU {
  private constructor(public readonly value: string) {}

  static create(value: string): SKU {
    if (!value || value.trim().length === 0) {
      throw new Error('SKU cannot be empty');
    }
    if (value.length > 50) {
      throw new Error('SKU cannot exceed 50 characters');
    }
    if (!/^[A-Z0-9-]+$/.test(value)) {
      throw new Error('SKU must contain only uppercase letters, numbers, and hyphens');
    }
    return new SKU(value.toUpperCase().trim());
  }

  equals(other: SKU): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
