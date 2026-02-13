import { ValueObject } from '@/shared/kernel';

interface EmailProps {
  value: string;
}

/**
 * Email value object
 * Ensures email validity
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new Error(`Invalid email: ${email}`);
    }

    return new Email({ value: email.toLowerCase().trim() });
  }

  get value(): string {
    return this.props.value;
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
