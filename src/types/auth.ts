import { AxiosResponse } from 'axios';

export type AuthHeaderRequest = { token: string; remember?: boolean };

export interface AuthLoginRequest {
  username: string | null;
  password: string | null;
  remember?: boolean;
}
export interface AuthLoginResponse extends AxiosResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
export interface AuthUserData {
  id: number;
  email: string;
  mobile: string;
  ability: string[];
}
