export interface AddressDTO {
  id: string;
  userId: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDTO {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}
