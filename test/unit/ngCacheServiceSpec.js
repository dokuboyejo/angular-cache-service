/* jasmine specs for services go here */

describe("angular-cache-service", function() {
	"use strict";
	this.timeout(5000);
	
	describe("cacheService", function() {
		var cacheService, $timeout;
			
		beforeEach(module("angularCacheServiceModule"));
		beforeEach(inject(function(_cacheService_, _$timeout_) {
			cacheService = _cacheService_;
			$timeout = _$timeout_;
		}));
		
		describe("save", function() {			
			it("validates ability to cache data", function(done) {
				cacheService.init({
					// name of cacheDB. this is applicable to INDEXED_DB | WEB_SQL
					dbName: "bookAnalysisDB",
					// name of cacheTable. this is applicable to INDEXED_DB | WEB_SQL
					entityName: "bookEntity",
					// cache current page for next 30min
					maxAge: 60000,
					// INDEXED_DB | WEB_SQL | LOCAL_STORAGE | SESSION_STORAGE | POLY_FILL
					cacheType: cacheService.cacheType.LOCAL_STORAGE,
					// delete the first 5 cached items when storage full . this is applicable to LOCAL_STORAGE | SESSION_STORAGE 
					deletableCacheItems: 5
				});
				$timeout.flush();
				var uid = (new Date()).valueOf().toString();			
				cacheService.localStorageDB.save(uid, uid).then(function(savedStatus) {
					console.log("savedStatus: " + savedStatus);
					//expect(savedStatus).to.be(false);
				});
				done();
			});
		});
		
		describe.skip("length", function() {	
			it("validates current cache size", function(done) {
				var uid1 = (new Date()).valueOf().toString();	
				cacheService.localStorageDB.clear().then(function() {
					//$timeout.flush();
					done();
					cacheService.localStorageDB.save(uid1, uid1).then(function(savedStatus) {
						//$timeout.flush();
						expect(savedStatus).toBe(false);
						console.log("savedStatus: " + savedStatus);
						done();
						var uid2 = (new Date()).valueOf().toString();			
						cacheService.localStorageDB.save(uid2, uid2).then(function(savedStatus) {
							expect(savedStatus).toBe(true);
							//$timeout.flush();
							done();
							cacheService.localStorageDB.length().then(function(size) {
								expect(size).toBe(3);
								console.log("size: " + size);
								//$timeout.flush();
								done();
							});
						});
					});
				});
				$timeout.flush();
				done();
			});
		});
		
		describe.skip("get", function() {			
			it("validates ability to retrieve data from cache", function() {			
				expect(cacheService.get(uid2)).toBe(uid2);			
			});
		});
		
		describe.skip("remove", function() {			
			it("validates ability to delete a cached data", function() {			
				cacheService.remove(uid1);
				expect(cacheService.get(uid1)).toBe(null);
			});
		});
		
		describe.skip("clear", function() {			
			it("validates ability to delete a cached data", function() {			
				cacheService.clear();
				expect(cacheService.length()).toBe(0);
			});
		});
	});
});
