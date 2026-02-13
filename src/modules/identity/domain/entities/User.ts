import { AggregateRoot } from '@/shared/kernel';
import type { Email } from '../value-objects/Email';

export type UserRole = 'customer' | 'admin';

export interface UserProps {
  email: Email;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User aggregate root
 * Manages user identity and profile
 */
export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id: string) {
    super(props, id);
  }

  static create(email: Email, name: string, role: UserRole = 'customer'): User {
    const now = new Date();
    const user = new User(
      {
        email,
        name,
        role,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );

    user.addDomainEvent({
      aggregateId: user.id,
      aggregateType: 'User',
      eventType: 'UserRegistered',
      eventData: JSON.stringify({ email: email.value, name, role }),
      occurredAt: new Date(),
    });

    return user;
  }

  static fromData(props: UserProps, id: string): User {
    return new User(props, id);
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'User',
      eventType: 'UserProfileUpdated',
      eventData: JSON.stringify({ name }),
      occurredAt: new Date(),
    });
  }

  promoteToAdmin(): void {
    if (this.props.role === 'admin') {
      throw new Error('User is already an admin');
    }

    this.props.role = 'admin';
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'User',
      eventType: 'UserRoleChanged',
      eventData: JSON.stringify({ role: 'admin' }),
      occurredAt: new Date(),
    });
  }

  isAdmin(): boolean {
    return this.props.role === 'admin';
  }
}
