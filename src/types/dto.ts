export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  success: boolean;
  message: string;
  accessToken?: string;
  data?: Record<string, any>;
}