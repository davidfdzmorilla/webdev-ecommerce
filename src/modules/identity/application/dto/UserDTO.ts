export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  role?: 'customer' | 'admin';
}

export interface UpdateUserDTO {
  name?: string;
}
