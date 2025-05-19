export interface Environment {
  production: boolean;
  spotify: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    authUrl: string;
  };
}
