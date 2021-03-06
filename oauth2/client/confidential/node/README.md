# Node.js Sample OAuth2 Confidential Client

This project contains sample code for signing in users with OAuth2 in Node.js.
The code implements the OAuth2 authorization code flow, with the Node.js web
server acting as a confidential client. This flow allows the authorization
server to authenticate both the resource owner and the client.

The code in the project works with Facebook, Google and LinkIn; and should be
easy to  adapt to other OUAth2 providers. The main caveat being the "UserInfo"
endpoint, used to fetch information about the authenticated user, which is
neither mandated nor specified by the OAuth2 standard.

## Pre-requisites

Before you can sign in with an external OAuth2 authorization server you need to
register your client. For the supported social login providers this is
accomplished by registering an app with them. We will need to perform this
procedure for each social login provider we want to integrate with.

We will also need to register a redirect URI for our client, which is the
address the authorization will redirect the browser to after authenticating the
resource owner.

### Facebook

Registering a new app with Facebook can be done at [developers.facebook.com]
(https://developers.facebook.com/apps/).

* Click `Add a New App` to begin.
* Select the web platform when prompted, enter a name for the app, and click
  `Create New Facebook App ID`.
* Select a category from the dropdown box and click `Create App ID`.
* After the app has been created, enter website and mobile site addresses and
  click `Next` to finish. Your app has now been created.

Once you have done this, your app should now be selectable in the `My Apps`
menu, and in the listing at [developers.facebook.com]
(https://developers.facebook.com/apps/). Follow either of those links in order
to get to the dashboard of the app.

On the app dashboard, the registration values you will need to get the sample
code working are `App ID` and `App Secret`. These are the values you will use
for `clientId` and `clientSecret` respectively in the Setup phase below.

From the app dashboard, click `Settings` from the sidebar menu, and then open
the `Advanced` pane. Make sure `Client OAuth Login` is enabled, and then add
a redirect URI for the client to the `Valid OAuth redirect URIs` text box.

With all settings at their default, the redirect URI would be
`http://localhost:3000/redirect/facebook`, but if you change the hostname or
the port you will need to update the redirect URI to match. Finally, click
`Save Changes` to complete the registration process.

The Facebook documentation for manually building a Facebook sign in flow is
available [here]
(https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/v2.2).

### Google

Registering a new app with Google can be done at the
[Google Developers Console](https://console.developers.google.com/project).

* Click `Create Project` to begin.
* Enter a project name and ID and click `CREATE`.
* Wait for the operation to complete and then click `APIs & auth` and then
  `Credentials` from the sidebar menu.
* Click `Create new Client ID` under the `OAuth` heading, make sure
  `Web application` is selected in the displayed modal window, and click
  `Configure consent screen`.
* Select an e-mail address and enter a product name for your consent page and
  click `Save`.
* Replace the default value of `https://www.example.com/oauth2callback` for
  Authorized Redirect URIs with the redirect URI for the client.

With all settings at their default, the redirect URI would be
`http://localhost:3000/redirect/google`, but if you change the hostname or
the port you will need to update the redirect URI to match. Finally, click
`Create Client ID` to complete the registration process.

The `Client ID` and `Client Secret` will now be displayed on the `Credentials`
page. These are the values you will use for `clientId` and `clientSecret`
respectively in the Setup phase below.

For Google sign in to work, we also need to enable the Google+ API. In order to
do this, click  `APIs & auth` and then `APIs` from the sidebar menu. Scroll
down to the `Google+ API` row and click the `Off` button to enable the API.

The Google documentation for manually building a Google sign in flow is
available [here](https://developers.google.com/accounts/docs/OAuth2WebServer).

### LinkedIn

Registering a new app with LinkedIn can be done at the
[LinkedIn Developer Network](https://www.linkedin.com/secure/developer).

* Click `Add New Application` to begin.
* Fill in the required fields under the Company Info, Application Info, and
  Contact Info fields as appropriate. These do not directly affect the sample
  code.
* Make sure both `r_basicprofile` and `r_emailaddress` are checked under the
  OAuth User Agreement heading, and enter the redirect URI for the client as
  the `OAuth 2.0 Redirect URLs`.

With all settings at their default, the redirect URI would be
`http://localhost:3000/redirect/linkedin`, but if you change the hostname or
the port you will need to update the redirect URI to match. Finally, check the
box indicating that you agree with the terms of use and click `Add Application`
to complete the registration process.

The `API Key` and `Secret Key` will now be displayed on the confirmation
page. These are the values you will use for `clientId` and `clientSecret`
respectively in the Setup phase below.

The LinkedIn documentation for manually building a LinkedIn sign in flow is
available [here](https://developer.linkedin.com/docs/signin-with-linkedin) and
[here](https://developer.linkedin.com/docs/oauth2).

## Setup

* Clone the repository and copy `config.json.sample` to `config.json`.
* Edit `config.json`, supplying `clientId`s and `clientSecret`s for those
  OAuth2 providers you have successfully registered with and set their `enabled`
  flags to `true` in order to enable them on the test web page.
* If you need to change the port the sample web server runs at, edit
  `config.json` and set `port` to the desired port. You will need to update the
  redirect URIs you have already registered with any authorization servers

## Use

* Start the server with the `npm start` command.
* Point your web browser at `http://localhost:3000`. Please note that this URI
  will change if you change the server hostname or port in the configuration.
* Click the sign in button of any of the OAuth2 providers you have configured
  and enabled during setup.
* NB: The first time you sign a resource owner in with a provider, a consent
  screen will be displayed, informing the resource owner that you are signing
  them in using your registered app. This screen will not be displayed on
  subsequent signing ins.
* NB: The sample code doesn't save the login state in any way, so you simply
  need to reload the main page in order to retry.
