export interface MasterMaterial {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMasterMaterialDto {
  name: string;
  code: string;
  category: string;
  description?: string;
  unit: string;
}

export interface UpdateMasterMaterialDto {
  name?: string;
  category?: string;
  description?: string;
  unit?: string;
}
