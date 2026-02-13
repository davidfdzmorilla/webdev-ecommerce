import { User } from '../../domain/entities/User';
import { Email } from '../../domain/value-objects/Email';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { IEventBus } from '@/shared/domain-events/IEventBus';
import { Result, Ok, Err } from '@/shared/kernel';
import type { CreateUserDTO, UserDTO } from '../dto/UserDTO';

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private eventBus: IEventBus
  ) {}

  async execute(dto: CreateUserDTO): Promise<Result<UserDTO, Error>> {
    try {
      // Check if user already exists
      const existingResult = await this.userRepository.findByEmail(dto.email);
      
      if (!existingResult.success) {
        return Err(existingResult.error);
      }

      if (existingResult.data) {
        return Err(new Error('User with this email already exists'));
      }

      // Create email value object
      const email = Email.create(dto.email);

      // Create user aggregate
      const user = User.create(email, dto.name, dto.role);

      // Save user
      const saveResult = await this.userRepository.save(user);
      if (!saveResult.success) {
        return Err(saveResult.error);
      }

      // Publish domain events
      const events = user.getDomainEvents();
      await this.eventBus.publishAll(events);
      user.clearDomainEvents();

      return Ok(this.toDTO(user));
    } catch (error) {
      return Err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private toDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
