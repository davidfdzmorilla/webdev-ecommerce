import { Entity } from '@/shared/kernel';

export interface AddressProps {
  userId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2 code (e.g., 'US', 'ES')
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Address entity
 * Represents a shipping/billing address for a user
 */
export class Address extends Entity<AddressProps> {
  private constructor(props: AddressProps, id: string) {
    super(props, id);
  }

  static create(
    userId: string,
    street: string,
    city: string,
    postalCode: string,
    country: string,
    isDefault: boolean = false
  ): Address {
    if (country.length !== 2) {
      throw new Error('Country must be ISO 3166-1 alpha-2 code (2 characters)');
    }

    const now = new Date();
    return new Address(
      {
        userId,
        street,
        city,
        postalCode,
        country: country.toUpperCase(),
        isDefault,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );
  }

  static fromData(props: AddressProps, id: string): Address {
    return new Address(props, id);
  }

  get userId(): string {
    return this.props.userId;
  }

  get street(): string {
    return this.props.street;
  }

  get city(): string {
    return this.props.city;
  }

  get postalCode(): string {
    return this.props.postalCode;
  }

  get country(): string {
    return this.props.country;
  }

  get isDefault(): boolean {
    return this.props.isDefault;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  setAsDefault(): void {
    this.props.isDefault = true;
    this.props.updatedAt = new Date();
  }

  unsetAsDefault(): void {
    this.props.isDefault = false;
    this.props.updatedAt = new Date();
  }

  update(
    street?: string,
    city?: string,
    postalCode?: string,
    country?: string
  ): void {
    if (street) this.props.street = street;
    if (city) this.props.city = city;
    if (postalCode) this.props.postalCode = postalCode;
    if (country) {
      if (country.length !== 2) {
        throw new Error('Country must be ISO 3166-1 alpha-2 code (2 characters)');
      }
      this.props.country = country.toUpperCase();
    }
    this.props.updatedAt = new Date();
  }
}
