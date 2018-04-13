let redirectURL
    , loginURL
    , baseURL
    , webConsoleURLPrefix
    , redirect_uri = encodeURIComponent(location.origin + '');

console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'development') {
    redirectURL = 'http://localhost:8080/cm/login.html?redirectUrl=' + redirect_uri + '';
    loginURL = 'http://localhost:8080/cm/login.html?redirectUrl=';
    // baseURL = 'http://localhost:8080/static/mock_json/'
    webConsoleURLPrefix = 'http://10.25.81.230';
    baseURL = 'http://localhost:8080/api'
} else {
    redirectURL = 'http://bip.pab.com.cn/cm/login.html?redirectUrl=' + redirect_uri + '';
    loginURL = 'http://localhost:8080/cm/login.html?redirectUrl=';
    webConsoleURLPrefix = 'http://10.25.81.230';
    baseURL = 'http://10.25.83.76:8088/api'
}

export {redirectURL, loginURL, baseURL, webConsoleURLPrefix}
