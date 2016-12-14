# ZoomSphere API

## Install

1. clone git repo
```
git clone git@github.com:zoomsphere/zoomsphere2-api.git
```

2. install modules
```
npm install
```

3. run project
```
npm start
```
## Latest version

``v1``

## Access to API

HTTP requests GET|POST|PUT|DELETE to:
```
http://localhost:3000/{version}
https://zs2api.herokuapp.com/{version}
```

## Public APIs
* ### Login
    * login by password (POST to /auth/zoomsphere) returns **_apikey_**
    * login by facebook (GET to /auth/facebook) returns **_apikey_**
    * login callback from facebook (GET to /auth/facebook/callback) returns **_apikey_**
    * login by google (GET to /auth/google) returns **_apikey_**
    * login callback from google (GET to /auth/google/callback) returns **_apikey_**
    
* ### Sign-up
    * sign up by username and password (POST /sign-up)  returns **_apikey_**
    
* ### Others
    * send contact form (POST /contact-form) returns 201 or 404
    
## Secured APIs
use **_apikey_** in header 'apikey'
Example:
```
curl -X GET -H "apikey: my.secret.apikey" -H "Content-Type: application/json" -H "Cache-Control: no-cache" 'http://localhost:3000/v1/users/'
```

* ### Users
    * logged in user detail - me (GET to /users/me)
    * detail (GET to /users/:id)
    * create (POST to /users) TODO
    * delete (DELETE to /users/:id) TODO
    * update (PUT to /users/:id) TODO


## Generate schemas
```
node ./node_modules/.bin/sequelize-auto -o "./app/v1/schemas" -d ZoomSphere -u user -x password -h localhost
```
