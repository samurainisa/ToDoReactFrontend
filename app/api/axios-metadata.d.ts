import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    metadata?: { loading?: boolean };
  }

  export interface InternalAxiosRequestConfig {
    metadata?: { loading?: boolean };
  }
}

