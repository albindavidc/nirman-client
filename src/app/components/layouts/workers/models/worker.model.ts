export interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  userStatus: string;
  // Professional fields
  professionalTitle?: string;
  experienceYears?: number;
  skills?: string[];
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerState {
  workers: Worker[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

export interface WorkerListResponse {
  data: Worker[];
  total: number;
  page: number;
  limit: number;
}
