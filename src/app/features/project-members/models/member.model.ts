export interface Member {
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

export interface MemberState {
  members: Member[];
  loading: boolean;
  error: any;
  total: number;
  page: number;
  limit: number;
}
