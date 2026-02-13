import { AggregateRoot } from '@/shared/kernel';
import type { DomainEvent } from '@/shared/domain-events/DomainEvent';

export interface CategoryProps {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category aggregate root
 * Manages product categorization hierarchy
 */
export class Category extends AggregateRoot<CategoryProps> {
  private constructor(props: CategoryProps, id: string) {
    super(props, id);
  }

  static create(data: Omit<CategoryProps, 'createdAt' | 'updatedAt'>): Category {
    const now = new Date();
    const category = new Category(
      {
        ...data,
        createdAt: now,
        updatedAt: now,
      },
      crypto.randomUUID()
    );

    category.addDomainEvent({
      aggregateId: category.id,
      aggregateType: 'Category',
      eventType: 'CategoryCreated',
      eventData: JSON.stringify({ name: data.name, slug: data.slug }),
      occurredAt: new Date(),
    });

    return category;
  }

  static fromData(props: CategoryProps, id: string): Category {
    return new Category(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): string {
    return this.props.slug;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get parentId(): string | undefined {
    return this.props.parentId;
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
      aggregateType: 'Category',
      eventType: 'CategoryUpdated',
      eventData: JSON.stringify({ name }),
      occurredAt: new Date(),
    });
  }

  updateDescription(description: string): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
  }
}
