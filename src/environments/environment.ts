// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

interface Environment {
  production: boolean;
  spotify: {
    clientId: string;
    clientSecret: string;
    apiUrl: string;
    authUrl: string;
  };
}

export const environment: Environment = {
  production: false,
  spotify: {
    clientId: 'f5d7bb53ec6e48f7ad4d2ca98fdc145e',
    clientSecret: '871f035b41204e26b8e8372a6c2ced81',
    apiUrl: 'https://api.spotify.com/v1',
    authUrl: 'https://accounts.spotify.com/api/token'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
