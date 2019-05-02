# My Week In Meetings

This repo hosts the firebase cloud functions for the project.

This is the repro for the [UI]().

Maybe later, we can start using a monorepo and use Firebase Hosting for our deployment.

## Managing Environments

We have to use Firebase alias to switch between our environments.

You can do that by
`firebase use development`

Here `development` is our alias for our dev version hosted at `http://my-week-in-meetings.now.sh`

The default environment is meant for local development (localhost).
Note: The app used for Google Sign-In will only allow `localhost:3000`
