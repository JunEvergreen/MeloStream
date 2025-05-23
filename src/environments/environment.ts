interface Environment {
  production: boolean;
  jamendo: {
    clientId: string;
    baseUrl: string;
    version: string;
  };
}

export const environment: Environment = {
  production: false,
  jamendo: {
    clientId: '12676b1d',
    baseUrl: 'https://api.jamendo.com',
    version: 'v3.0'
  }
};

