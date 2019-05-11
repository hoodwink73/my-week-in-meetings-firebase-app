# My Week In Meetings

This repo hosts the firebase cloud functions for the project.

This is the repro for the [UI](https://github.com/hoodwink73/my-week-in-meetings).

Maybe later, we can start using a monorepo and use Firebase Hosting for our deployment.

## Managing Environments

We have to use Firebase alias to switch between our environments.

You can do that by
`firebase use development`

Here `development` is our alias for our dev version hosted at `http://my-week-in-meetings.now.sh`

The default environment is meant for local development (localhost).
Note: The app client used for Google Sign-In will only allow `localhost:3000` – the google sign in script will only load on this web address.

But you have get the

- `client_id`
- `client_secret`
- `javascript_origins`

set up as your [environment configuration](https://firebase.google.com/docs/functions/config-env?authuser=1) for the cloud functions.

The `env.sh` automates it for you when deploy your cloud functions.

But what if you want to run your [functions locally](https://firebase.google.com/docs/functions/local-emulator#serve_http_functions_from_the_command_line) using the firebase shell.

We have created a `.runtimeconfig.json`. It contains the oAuth client for Google Sign In used to develop our firebase application locally.

## Creating New Environments

There are quite a few things to be done when you have to create a new environment.

- A new firebase project

  - you need to create different firebase projects for different environments.
    it is necessary to isolate the data and the services for each environment

- Create [Google Sign In OAuth Client](https://developers.google.com/identity/sign-in/web/server-side-flow)

  - **Important**: The oAuth Client needs to be associated with the firebase project you created above.
    Otherwise during sign up, you will receive an error like

  - Invalid Idp Response: the Google id_token is not allowed to be used with this application. Its audience (OAuth 2.0 client ID) is XXXXX-XXXXX.apps.googleusercontent.com, which is not authorized to be used in the project with project_number: XXXXX.

- Make sure you have turned on Google as an allowed sign in option in your Firebase project's Authentication

- TODO: Note down how to verify and add url on which the calendar webhook will post
