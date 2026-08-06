export type CompanyImageType = 'logo' | 'banner';

export interface CompanyImage {
  id: number;
  type: CompanyImageType;
  url: string;
}

export interface ColorPalette {
  primary: string | null;
  secondary: string | null;
}

export interface Company {
  id: number;
  name: string;
  plan_id: number | null;
  color_palette: ColorPalette | null;
  logo: CompanyImage | null;
  banner: CompanyImage | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCompanyIdentityPayload {
  logo?: File;
  banner?: File;
  primary_color?: string;
  secondary_color?: string;
}
