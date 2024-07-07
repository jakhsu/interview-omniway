## Toggle backend api

please clone the backend repo and run it locally: https://github.com/jakhsu/interview-omniway-backend

In axios.js

```
const axiosInstance = axios.create({ baseURL: HOST_API, withCredentials: true });
```

change HOST_API to TEST_API to test the token refresh flow:

First, login in to the app, then wait 2 minutes (access token expiration time), when it expired, there will be an alert.

Then go to page 2, click on the button which will fetch data from an protected endpoint (need valid access token).

At this point you'll see invalid network request in devtool, then the app will automatically refresh the token and retry the request.

Notice that to make this flow work, I've commented out the auto logout feature, otherwise the app will just logout after access token expired.
