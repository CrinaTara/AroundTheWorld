// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase : {
    apiKey: "AIzaSyAE3TUjCi9GIpcUjqdiqIU2iXdxKUNRQjA",
    authDomain: "around-the-world-a2bcc.firebaseapp.com",
    databaseURL: "https://around-the-world-a2bcc.firebaseio.com",
    projectId: "around-the-world-a2bcc",
    storageBucket: "around-the-world-a2bcc.appspot.com",
    messagingSenderId: "1040668606191"
  }
};
