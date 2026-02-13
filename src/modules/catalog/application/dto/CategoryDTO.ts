export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}
