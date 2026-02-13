/**
 * Base Entity class for DDD entities
 * Entities have identity and are compared by ID, not by value
 */
export abstract class Entity<T> {
  protected readonly props: T;
  protected readonly _id: string;

  constructor(props: T, id: string) {
    this.props = props;
    this._id = id;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Entities are equal if they have the same ID
   */
  equals(entity?: Entity<T>): boolean {
    if (!entity) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this._id === entity._id;
  }
}
