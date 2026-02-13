export interface ProductDTO {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDTO {
  sku: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId?: string;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  status?: 'active' | 'inactive' | 'out_of_stock';
}

export interface ProductListDTO {
  products: ProductDTO[];
  total: number;
  page: number;
  pageSize: number;
}
