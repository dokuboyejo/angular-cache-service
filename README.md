The cache service handles client-side caching (almost about any object can be cached on the client). The cache mechanism implemented by this service uses either { indexedDB | webSQL | localStorage | sessionStorage | polyFill } in the specified order of availability.

> To ensure better performance, when used in pagination, only pages navigated by users shoube be cached. For example: in a page 1 to 10 result; if user navigate page 1, 3 and 7; only the mentioned three pages (1, 3 & 7) should be cached....however it's still up to you to determine what's cached.

__Supported Browsers:__

[![browsers](https://img.shields.io/badge/Browser-Chrome%2CFirefox%2CSafari%2COpera%2CIE%209%2B%2CiOS%20Safari%207.1%2B%2CAndroid%20Browser%202.3%2B-green.svg?style=flat-square)](https://github.com/dokuboyejo/angular-cache-service)

### Table of Contents
- [Installation and Usage](#installation-and-usage)
- [API](#api)


### Installation and Usage
__Install from repo__
`npm install --save angular-cache-service`

__Add as dependency and use__
```js
angular.module('myApp', ['angular-cache-service'])
  .controller('myCtrl', function (cacheService) {
    // create cache
    cacheServiceInstance = cacheService.create(); // use cacheService.getNewInstance() for prototype cache
    
    // initialize cache
    cacheServiceInstance.init({
        // name of cacheDB.
        dbName : "myDB",
        // name of cacheTable.
        entityName : "myEntity",
        // cache current page for next 30min
        maxAge : 60000,
        // INDEXED_DB | WEB_SQL | LOCAL_STORAGE | SESSION_STORAGE | POLY_FILL
        cacheType : cacheServiceInstance.cacheType.POLY_FILL,
        // delete the first 5 cached items when storage full .
        deletableCacheItems : 5
    });
    
    var uid = (new Date()).valueOf().toString();
    
    cacheServiceInstance.save(uid, uid).then(function(savedStatus) {
       console.log("savedStatus: " + savedStatus);
    });
    
    cacheServiceInstance.get(uid).then(function(result) {
       console.log("result: " + result);
    });
    cacheServiceInstance.length().then(function(size) {
       console.log("size: " + size);
    });
    
    cacheServiceInstance.remove(uid).then(function() {
       console.log("removed: " + uid);
    });
    
    cacheServiceInstance.clear().then(function() {
       console.log("cleared " + cacheServiceInstance.getStorage().dbName + ' .....');
    });
  });
```

### API
```
// supported cache mechanism
cacheType

// storage handle
getStorage()

// storage availability
storeQuotaExceeded

// check storage availability and usability
storageExist

// configurable options
options

// cache service initialization
init(initData)

// persist cached data
save(key, value

// remove cached data
remove(key)

// retrieve cached data
get(key)

// compute size of cached storage
length()

// clear cache storage
clear()
```
