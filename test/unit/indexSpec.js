/* jasmine specs for services go here */

describe("angular-cache-service", function() {
   "use strict";
   this.timeout(5000);

   describe("cacheService", function() {
      var cacheService, cacheServiceInstance, cacheServiceInstance2, $timeout;

      beforeEach(module("a2o4.storage"));
      beforeEach(inject(function(_cacheService_, _$timeout_) {
         cacheService = _cacheService_;
         cacheServiceInstance = cacheService.create();
         $timeout = _$timeout_;

         cacheServiceInstance.init({
            // name of cacheDB.
            dbName : "bookAnalysisDB1",
            // name of cacheTable.
            entityName : "bookEntity1",
            // cache current page for next 30min
            maxAge : 60000,
            // INDEXED_DB | WEB_SQL | LOCAL_STORAGE | SESSION_STORAGE | POLY_FILL
            cacheType : cacheServiceInstance.cacheType.POLY_FILL,
            // delete the first 5 cached items when storage full.
            deletableCacheItems : 5
         });
         // flush all timeout for 'init' call stack
         $timeout.flush();
      }));

      describe("singleton service", function() {
         it("checks that service was created using singleton pattern", function(done) {
            cacheServiceInstance2 = cacheService.getNewInstance(); // getNewInstance();// create();
            cacheServiceInstance2.init({
               // name of cacheDB. this is applicable to INDEXED_DB | WEB_SQL
               dbName : "bookAnalysisDB2",
               // name of cacheTable. this is applicable to INDEXED_DB | WEB_SQL
               entityName : "bookEntity2",
               // cache current page for next 30min
               maxAge : 60000,
               // INDEXED_DB | WEB_SQL | LOCAL_STORAGE | SESSION_STORAGE | POLY_FILL
               cacheType : cacheServiceInstance2.cacheType.LOCAL_STORAGE,
               // delete the first 5 cached items when storage full . this is applicable to LOCAL_STORAGE | SESSION_STORAGE
               deletableCacheItems : 5
            });
            // flush all timeout for 'init' call stack
            $timeout.flush();
            assert.typeOf(cacheServiceInstance2.getStorage().dbName, 'string');
            assert.equal(cacheServiceInstance2.getStorage().dbName, 'bookAnalysisDB2');
            assert.equal(cacheServiceInstance2.getStorage().entityName, 'bookEntity2');
            expect(cacheServiceInstance.getStorage().dbName).to.not.equal(cacheServiceInstance2.getStorage().dbName);
            done();
         });
      });
      
      describe("multipleton service", function() {
         it("checks that service was created using prototype", function(done) {
            cacheServiceInstance2 = cacheService.create();
            assert.equal(cacheServiceInstance2.getStorage().dbName, 'bookAnalysisDB1');
            assert.equal(cacheServiceInstance2.getStorage().entityName, 'bookEntity1');
            expect(cacheServiceInstance.getStorage().dbName).to.equal(cacheServiceInstance2.getStorage().dbName);
            done();
         });
      });

      describe("save", function() {
         it("validates ability to cache data", function(done) {
            var uid = (new Date()).valueOf().toString() + 'S';
            cacheServiceInstance.save(uid, uid).then(function(savedStatus) {
               console.log("savedStatus: " + savedStatus);
               expect(savedStatus).to.be.ok;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
         });
      });

      describe("length", function() {
         it("validates current cache size", function(done) {
            var uid1 = (new Date()).valueOf().toString() + 'L1';
            cacheServiceInstance.save(uid1, uid1).then(function(savedStatus) {
               console.log("savedStatus:x " + savedStatus);
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            var uid2 = (new Date()).valueOf().toString() + 'L2';
            cacheServiceInstance.save(uid2, uid2).then(function(savedStatus) {
               console.log("savedStatus:y " + savedStatus);
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.length().then(function(size) {
               console.log("size: " + size);
               expect(size).to.equal(2);
            });
            // flush all timeout for 'length' call stack
            $timeout.flush();
            done();
         });
      });

      describe("get", function() {
         it("validates ability to retrieve data from cache", function(done) {
            var uid = (new Date()).valueOf().toString() + 'G';
            cacheServiceInstance.save(uid, uid).then(function(savedStatus) {
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.get(uid).then(function(result) {
               console.log("result: " + result);
               expect(uid.to.equal(result));
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
         });
      });

      describe("remove", function() {
         it("validates ability to delete a cached data", function(done) {
            var uid = (new Date()).valueOf().toString() + 'R';
            cacheServiceInstance.save(uid, uid).then(function(savedStatus) {
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.remove(uid).then(function() {
               console.log("removed: " + uid);
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.get(uid).then(function(result) {
               console.log("result: " + result);
               expect(result.to.be.null);
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
         });
      });

      describe("clear", function() {
         it("validates ability to delete a cached data", function(done) {
            var uid1 = (new Date()).valueOf().toString() + 'C1';
            cacheServiceInstance.save(uid1, uid1).then(function(savedStatus) {
               console.log("savedStatus:x " + savedStatus);
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            var uid2 = (new Date()).valueOf().toString() + 'C2';
            cacheServiceInstance.save(uid2, uid2).then(function(savedStatus) {
               console.log("savedStatus:y " + savedStatus);
               expect(savedStatus).to.be.true;
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.clear().then(function() {
               console.log("clearing " + cacheServiceInstance2.getStorage().dbName + ' .....');
            });
            // flush all timeout for 'save' call stack
            $timeout.flush();
            done();
            
            cacheServiceInstance.length().then(function(size) {
               console.log("size: " + size);
               expect(size).to.equal(0);
            });
            // flush all timeout for 'length' call stack
            $timeout.flush();
            done();
         });
      });
   });
});
