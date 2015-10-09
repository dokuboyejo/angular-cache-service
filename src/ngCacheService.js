/**
 * version: 0.0.1
 * 10-09-2015 
 * The cache service handles client-side caching (almost about any object can
 * be cached on the client). The cache mechanism implemented by this service
 * uses either { indexedDB | webSQL | localStorage | sessionStorage | polyFill }
 * in the specified order of availability. To ensure better performance, when
 * used in pagination, only pages navigated by users shoube be cached. For example: in
 * a page 1 to 10 result; if user navigate page 1, 3 and 7; only the mentioned
 * three pages (1, 3 & 7) should be cached....however it's still up to you to determine what's cached.
 */
angular.module("a2o4.storage", [])
/**
 * @param {$window} The window object.
 * @param {$q} The deferred object.
 * @param {$q} The timeout object.
 */
.factory("cacheService", ["$window", "$q", "$timeout", function($window, $q, $timeout){
	/**
     * This POLY_FILL serves as an extension of browser storage capability. It
     * would automatically be used should any of the following not be available { indexedDB | webSQL | localStorage | sessionStorage }
     */
	var POLY_FILL = {};
		// marker for POLY_FILL
		POLY_FILL.name = "POLY_FILL";
		// database name
		POLY_FILL.dbName = "cacheDB";
		// entity name
		POLY_FILL.entityName = "cacheTable";
		// poly fill options
		POLY_FILL.options = {};
		
	    // return reference to poly fill 
		POLY_FILL.open = function() {
	        var deferred = $q.defer();
	        // update dbName and entityName on DB open
	        POLY_FILL.dbName = POLY_FILL.options.dbName;
	        POLY_FILL.entityName = POLY_FILL.options.entityName;
	        $timeout(function() {
	           deferred.resolve(POLY_FILL);
	        });
	        return deferred.promise;
        };
	    /** 
	     * Function for caching a data. 
	     * key must be truthy -> not (null | undefined | NaN | "" | 0 | false)
	     * @param {key} the key for data to be cached
	     * @param {value} the actual data to cache
	     */
	    POLY_FILL.save = POLY_FILL.setItem = function(key, value) {
	    	var deferred = $q.defer(),
	    	   savedStatus = false;
	    	
	    	if (key) {
	    		POLY_FILL[key] = value;
	    		savedStatus = true;
	    		
	    		// invalidate current cached page after specified max period
	        	$timeout(function() {
	        		POLY_FILL.removeItem(key);
	        	}, POLY_FILL.options.maxAge);
	    	} else {
	    	   console.warn("key should be a valid truthy");
	    	}
	    	
	    	$timeout(function() {
            deferred.resolve(savedStatus);
         });
	    	
	    	return deferred.promise;
	   };
	   /** 
	    * Function to retrieve existing cache data
	    * key must be defined
	    * @param {key} the key for data to be retrieved
	    */
	   POLY_FILL.get = POLY_FILL.getItem = function(key) {
	    	var deferred = $q.defer();
	    	var data = POLY_FILL[key];
	    	
	    	if (data) {
	    		$timeout(function() {
               deferred.resolve(data);
            });
	    	} else {
	    		$timeout(function() {
	    		  deferred.resolve(null);
            });
	    	}
	    	
	    	return deferred.promise;
	   };
	   /** 
	    * Function to delete an existing cache data
	    * key must be defined and part of exisiting keys
	    * @param {key} the key for data to be deleted
	    */
	   POLY_FILL.remove = POLY_FILL.removeItem = function(key) {
	    	var deferred = $q.defer();
	    	
	    	if (POLY_FILL.hasOwnProperty(key)) {
	    		delete POLY_FILL[key];
	    		$timeout(function() {
               deferred.resolve();
            });
	    	} else {
	    		deferred.reject();
	    	}
	    	
	    	return deferred.promise;
	   };
	   /** 
	    * Function to compute current size of cache, as per number of cache items
	    */
	   POLY_FILL.length = function() {
	    	var deferred = $q.defer(),
	    	   size = 0,
	    	   key;
	            
	        for (key in POLY_FILL) {
	           // exclude function properties from size counting
	           if (POLY_FILL.hasOwnProperty(key) && key !== 'name' && key !== 'dbName' && key !== 'entityName' && key !== 'options' && key !== 'open' && key !== 'save' && key !== 'setItem' && key !== 'get' && key !== 'getItem' && key !== 'remove' && key !== 'removeItem' && key !== 'length' && key !== 'clear') {
	        	      size++;
	        	  }
	        }
	        
	        $timeout(function() {
              deferred.resolve(size);
           });
	        
	        return deferred.promise;
	    };
	    /** 
	     * Function to clear entire cache space
	     */
	    POLY_FILL.clear = function() {
	    	var deferred = $q.defer(),
	    	   key;
	    	
	    	// POLY_FILL = {};
	    	try {
	    	   for (key in POLY_FILL) {
               // exclude function properties as keys for data removal
               if (POLY_FILL.hasOwnProperty(key) && key !== 'name' && key !== 'dbName' && key !== 'entityName' && key !== 'options' && key !== 'open' && key !== 'save' && key !== 'setItem' && key !== 'get' && key !== 'getItem' && key !== 'remove' && key !== 'removeItem' && key !== 'length' && key !== 'clear') {
                   delete POLY_FILL[key];
               }
	    	   }
	    	   
	    	   console.log("POLY_FILL data cleared");
	         $timeout(function() {
	            deferred.resolve();
	         });
	    	} catch (e) {
	    	  $timeout(function() {
	    	     deferred.reject();
           });
	    	}
	    	
	    	return deferred.promise;
	    };
	 
	/**
     * Utiltiy function for verifying whether client storage ($window.localStorage | $window.sessionStorage) space is filled to
     * capacity
     *
     * @param {e} error thrown
     */
	var storeQuotaExceeded = function(e) {
		var quotaExceeded = false;
		if (e) {
		    if (e.code) {
		      switch (e.code) {
		        case 22:
		          quotaExceeded = true;
		          break;
		        case 1014:
		          // Firefox
		          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
		            quotaExceeded = true;
		          }
		          break;
		      }
		    } else if (e.number === -2147024882) {
		      // Internet Explorer 8
		      quotaExceeded = true;
		    }
		}
		return quotaExceeded;
	};
	
	/**
	 * Handles save request for localStorage and sessionStorage
	 * @param {storeType} the storage type {localStorage | localSessionStorage}
	 * @param {key} the key for caching data
	 * @param {value} the data to cache
	 */
	var saveHandle = function(storeType, key, value) {
		var clearCache;
		try {
			storeType.db.setItem(key, value);
		} catch (e1) {
			if (storeType.storeQuotaExceeded(e1)) {
				/* delete first n-cached items as specified by value of deletableCacheItems */
				var deletedCacheCount = 0;
				for (var storeKey in storeType.db) {
					if (storeType.db.getItem(storeKey)) {
					  if (deletedCacheCount === storeType.options.deletableCacheItems) {
						  break;
					  }
					  // clear timer if previously set
					  if (clearCache) {
						  $timeout.cancel(clearCache);
					  }
					  // delete cache data
					  storeType.removeItem(storeKey).then(incrementDeletedCache);
					}
				}
				
				var incrementDeletedCache = function(){
					deletedCacheCount++;
				};							
			}
			try {
				// perform a second attempt to cache current page
				storeType.db.setItem(key, value);
			} catch (e2) {
				/*
				 * looks like data might be too big or something weird happened....ignore caching of current page
				 */
				console.error("error persisting data: " + e2);
				return false;
			}
		}
		
		// invalidate current cached page after specified max period
    	clearCache = $timeout(function() {
    		storeType.removeItem(key);
    	}, storeType.options.maxAge);
    	
    	return true;
	};
	
	/**
	 * This storage object help abstract the basic functionalities of localStorage.
	 */
	var localStorageDB = {};
		// marker for localStorage
		localStorageDB.name = "localStorage";
		// database name
		localStorageDB.dbName = "cacheDB";
      // entity name
		localStorageDB.entityName = "cacheTable";
		// db handle
		localStorageDB.db = $window.localStorage;
		// storage capacity check
		localStorageDB.storeQuotaExceeded = storeQuotaExceeded;
		// database options
		localStorageDB.options = {};
		
		// return reference to localStorageDB.db 
		localStorageDB.open = function() {
         var deferred = $q.defer();
         // update dbName and entityName on DB open
         localStorageDB.dbName = localStorageDB.options.dbName;
         localStorageDB.entityName = localStorageDB.options.entityName;
         $timeout(function() {
            deferred.resolve(localStorageDB.db);
         });
         return deferred.promise;
      };
		/** 
       * Function for caching a data. 
       * key must be truthy -> not (null | undefined | NaN | "" | 0 | false)
       * @param {key} the key for data to be cached
       * @param {value} the actual data to cache
       */
	   localStorageDB.save = localStorageDB.setItem = function(key, value) {
	    	var deferred = $q.defer();
	    	
	    	if (key) {
	    		var savedStatus = saveHandle(localStorageDB, key, value);
	    		deferred.resolve(savedStatus);
	    	} else {
	    		deferred.reject();
	    	}
	    	
	    	return deferred.promise;
	    };
	    /** 
        * Function to retrieve existing cache data
        * key must be defined
        * @param {key} the key for data to be retrieved
        */
	    localStorageDB.get = localStorageDB.getItem = function(key) {
	    	var deferred = $q.defer();
	    	
    		data = localStorageDB.db.getItem(key);
    		deferred.resolve(data);
	    	
	    	return deferred.promise;
	    };
	    /** 
        * Function to delete an existing cache data
        * key must be defined and part of exisiting keys
        * @param {key} the key for data to be deleted
        */
	    localStorageDB.remove = localStorageDB.removeItem = function(key) {
	    	var deferred = $q.defer();
	    	
    		localStorageDB.db.removeItem(key);
    		deferred.resolve();
	    	
	    	return deferred.promise;
	    };
	    /** 
        * Function to compute current size of cache, as per number of cache items
        */
	    localStorageDB.length = function() {
	    	var deferred = $q.defer(),
	    	    size = 0;
	            
	        size = localStorageDB.db.length;
	        deferred.resolve(size);
	        
	        return deferred.promise;
	    };
	    /** 
        * Function to clear entire cache space
        */
	    localStorageDB.clear = function() {
	    	var deferred = $q.defer();
	    	
	    	localStorageDB.db.clear();
	    	deferred.resolve();
	    	console.log("localStorageDB data cleared");
	    	
	    	return deferred.promise;
	    };
	    
	/**
	 * This storage object help abstract the basic functionalities of sessionStorage.
	 */
	var localSessionStorage = {};
	   // marker for localStorage
		localSessionStorage.name = "sessionStorage";
		// database name
		localSessionStorage.dbName = "cacheDB";
		// entity name
		localSessionStorage.entityName = "cacheTable";
		// db handle
		localSessionStorage.db = $window.sessionStorage;
		// storage capacity check
		localSessionStorage.storeQuotaExceeded = storeQuotaExceeded;
		// database options
		localSessionStorage.options = {};
		
		// return reference to localSessionStorage.db 
		localSessionStorage.open = function() {
         var deferred = $q.defer();
         // update dbName and entityName on DB open
         localSessionStorage.dbName = localSessionStorage.options.dbName;
         localSessionStorage.entityName = localSessionStorage.options.entityName;
         $timeout(function() {
            deferred.resolve(localSessionStorage.db);
         });
         return deferred.promise;
      };
		/** 
       * Function for caching a data. 
       * key must be truthy -> not (null | undefined | NaN | "" | 0 | false)
       * @param {key} the key for data to be cached
       * @param {value} the actual data to cache
       */
	   localSessionStorage.save = localSessionStorage.setItem = function(key, value) {
	      var deferred = $q.defer();
	    	
	    	if (key) {
	    		var savedStatus = saveHandle(localSessionStorage, key, value);
	    		deferred.resolve(savedStatus);
	    	} else {
	    		deferred.reject();
	    	}
	    	
	    	return deferred.promise;
	   };
	   /** 
       * Function to retrieve existing cache data
       * key must be defined
       * @param {key} the key for data to be retrieved
       */
	   localSessionStorage.get = localSessionStorage.getItem = function(key) {
	      var deferred = $q.defer();
	    	
    		data = localSessionStorage.db.getItem(key);
    		deferred.resolve(data);
	    	
	    	return deferred.promise;
	   };
	   /** 
       * Function to delete an existing cache data
       * key must be defined and part of exisiting keys
       * @param {key} the key for data to be deleted
       */
	   localSessionStorage.remove = localSessionStorage.removeItem = function(key) {
	      var deferred = $q.defer();
	    	
	      localSessionStorage.db.removeItem(key);
    		deferred.resolve();
    		console.log("localSessionStorage data cleared");
    		
	    	return deferred.promise;
	   };
	   /** 
       * Function to compute current size of cache, as per number of cache items
       */
	   localSessionStorage.length = function() {
	      var deferred = $q.defer(),
	    	    size = 0;
	            
	      size = localSessionStorage.db.length;
	      deferred.resolve(size);
	        
	      return deferred.promise;
	   };
	   /** 
       * Function to clear entire cache space
       */
	   localSessionStorage.clear = function() {
	      var deferred = $q.defer();
	    	
	    	localSessionStorage.db.clear();
	    	deferred.resolve();
	        
	    	return deferred.promise;
	   };

      /**
       * This storage object help abstract the basic functionalities of IndexDB.
       */
	   var localIndexedDB = {};
		// database version
		localIndexedDB.version = 1;
		// marker for localIndexedDB
		localIndexedDB.name = "indexedDB";
		// database name
		localIndexedDB.dbName = "cacheDB";
		// entity name
		localIndexedDB.entityName = "cacheTable";
		// database options
		localIndexedDB.options = {};

		// open the database and configure it appropraitely
		localIndexedDB.open = function() {
			var deferred = $q.defer();
			// update dbName and entityName on DB open
			localIndexedDB.dbName = localIndexedDB.options.dbName;
			localIndexedDB.entityName = localIndexedDB.options.entityName;
			
			if (localIndexedDB.db) {
				$timeout(function() {
			    	deferred.resolve(localIndexedDB.db);
		    	});
		    	
				return deferred.promise;
			}
			
			if (!($window.indexedDB = $window.IndexedDB || $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB)) {
		    	var errorMessage = "indexedDB not supported on this device";
		    	console.warn(errorMessage);
		    	$timeout(function() {
		    	  deferred.resolve(null);
		    	});
		    	return deferred.promise;
		    }
			// use appropriate browser prefix
			if ('webkitIndexedDB' in $window) {
				$window.IDBTransaction = $window.IDBTransaction || $window.webkitIDBTransaction || $window.msIDBTransaction;
				$window.IDBKeyRange = $window.IDBKeyRange || $window.webkitIDBKeyRange || $window.msIDBKeyRange;
			}
			
			var request = $window.indexedDB.open(localIndexedDB.dbName, localIndexedDB.version);

			/* this is called once for when creating/upgrading localIndexedDB.db we can only create Object stores in a version-change transaction. */
			request.onupgradeneeded = function(e) {
				var db = e.target.result;
				// handle for the actual indexedDB database
				localIndexedDB.db = db;

				e.target.transaction.onerror = $window.indexedDB.onerror;

				if (db.objectStoreNames.contains(localIndexedDB.entityName)) {
					db.deleteObjectStore(localIndexedDB.entityName);
				}

				db.createObjectStore(localIndexedDB.entityName);
				console.log(localIndexedDB.dbName + " indexedDB database created with store: " + localIndexedDB.entityName);
			};

			/* invoked when after localIndexedDB.db has opened and all version-changes completed */
			request.onsuccess = function(e) {
				localIndexedDB.db = e.target.result;
			   $timeout(function() {
			    	deferred.resolve(localIndexedDB.db);
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage = "device might be operating incognito. localIndexedDB couldn't be created/opened. error: " + e.message;
			    console.warn(errorMessage);
				
			    $timeout(function() {
			       deferred.resolve(null);
		    	});
			};

			return deferred.promise;
		};
	   /** 
       * Function for caching a data. 
       * key must be truthy -> not (null | undefined | NaN | "" | 0 | false)
       * @param {key} the key for data to be cached
       * @param {value} the actual data to cache
       */
		localIndexedDB.save = localIndexedDB.setItem = function(key, value) {
			var deferred = $q.defer();
			if (!key) {
				deferred.reject("invalid key");
				return deferred.promise;
			}

			var db = localIndexedDB.db;
			if (!db) {
			    var errorMessage = "localIndexedDB is not available";
			    console.warn(errorMessage);
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
				return deferred.promise;
			}

			// use entity object store in read-write manner
			var trans = db.transaction([localIndexedDB.entityName], "readwrite");
			var objectStore = trans.objectStore(localIndexedDB.entityName);
			var request = objectStore.put(value, key);
			var savedStatus = false;
			
			request.onsuccess = function(e) {
				if (e.target.result) {
				   savedStatus = true;
					// invalidate current cached page after specified max period
					$timeout(function() {
						localIndexedDB.removeItem(key);
			    	}, localIndexedDB.options.maxAge);
				}
				
			   $timeout(function() {
			    	deferred.resolve(savedStatus);
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage = value + " couldn't be saved. error: " + e.message;
			    console.warn(errorMessage);
			    
			    var storageRequestSuccess = function(used, remaining) {
					console.log("used quota: " + used + ", remaining quota: " + remaining);
				 };
			    var storageRequestFailure = function(e) {
					console.log('error requesting storage space: ' + e.message); 
				 };
			    
			    // check if error is due to quota limit
			    if ($window.navigator.webkitTemporaryStorage) {
			    	$window.navigator.queryUsageAndQuota(storageRequestSuccess, storageRequestFailure);
			    } else {
			    	 $window.webkitStorageInfo.queryUsageAndQuota($window.webkitStorageInfo.TEMPORARY, storageRequestSuccess, storageRequestFailure);
			    }
			    
			    $timeout(function() {
			       deferred.resolve(savedStatus);
             });
			};

			return deferred.promise;
		};
		/** 
       * Function to retrieve existing cache data
       * key must be defined
       * @param {key} the key for data to be retrieved
       */
		localIndexedDB.get = localIndexedDB.getItem = function(key) {
			var deferred = $q.defer();
			var db = localIndexedDB.db;
			if (!db) {
			    var errorMessage = "localIndexedDB is not available";
			    console.warn(errorMessage);
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
				return deferred.promise;
			}

			// use entity object store in read-write manner
			var trans = db.transaction([localIndexedDB.entityName], "readonly");
			var objectStore = trans.objectStore(localIndexedDB.entityName);

			var request = objectStore.get(key);
			var data = null;

			request.onsuccess = function(e) {
				if (e.target.result) {
					data = e.target.result;
				}
				
			   $timeout(function() {
			    	deferred.resolve(data);
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage =  "couldn't retrieved value for key: " + key + ". error: " + e.message;
			    console.warn(errorMessage);
				
			    $timeout(function() {
			       deferred.resolve(data);
	          });
			};

			return deferred.promise;
		};
		/** 
       * Function to delete an existing cache data
       * key must be defined and part of exisiting keys
       * @param {key} the key for data to be deleted
       */
		localIndexedDB.remove = localIndexedDB.removeItem = function(key) {
			var deferred = $q.defer();
			var db = localIndexedDB.db;
			if (!db) {
			    var errorMessage = "localIndexedDB is not available";
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
		    	
				return deferred.promise;
			}

			// use entity object store in read-write manner
			var trans = db.transaction([localIndexedDB.entityName], "readwrite");
			var objectStore = trans.objectStore(localIndexedDB.entityName);

			// yui compressor is not happy with objectStore.delete.key
			var request = objectStore["delete"](key);

			request.onsuccess = function() {
			    $timeout(function() {
			    	deferred.resolve();
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage = "couldn't remove value for key: " + key + ". error: " + e.message;
				console.warn(errorMessage);
				
				$timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			return deferred.promise;
		};
		/** 
       * Function to clear entire cache space
       */
		localIndexedDB.clear = function() {
			var deferred = $q.defer();
			var db = localIndexedDB.db;
			if (!db) {
			    var errorMessage = "localIndexedDB is not available";
			    console.warn(errorMessage);

			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
		    	
				return deferred.promise;
			}

			// use entity object store in read-write manner
			var trans = db.transaction([localIndexedDB.entityName], "readwrite");
			var objectStore = trans.objectStore(localIndexedDB.entityName);
			var request = objectStore.clear();

			request.onsuccess = function () {
			    console.log(localIndexedDB.dbName + " indexedDB data cleared");

			    $timeout(function() {
			    	deferred.resolve();
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage = "couldn't clear content of indexedDB: " + localIndexedDB.dbName + ". error: " + e.message;
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			request.onblocked = function (e) {
			    var errorMessage = "couldn't clear content of indexedDB: " + localIndexedDB.dbName + " due to operation being blocked. error: " + e.message;
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			return deferred.promise;
		};
		/** 
       * Function to compute current size of cache, as per number of cache items
       */
		localIndexedDB.length = function() {
			var deferred = $q.defer();
			var db = localIndexedDB.db;
			if (!db) {
			    var errorMessage = "localIndexedDB is not available";
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			}

			// use entity object store in read-write manner
			var trans = db.transaction([localIndexedDB.entityName], "readwrite");
			var objectStore = trans.objectStore(localIndexedDB.entityName);
			var request = objectStore.count();

			request.onsuccess = function () {
			    $timeout(function() {
			    	deferred.resolve(request.result);
		    	});
			};

			request.onerror = function(e) {
			    var errorMessage = "couldn't clear compute size of indexedDB: " + localIndexedDB.dbName + ". error: " + e.message;
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			return deferred.promise;
		};

    /**
	 * This storage object help abstract the basic functionalities of WebSQL.
	 */
	var localWebSQL = {};
		// database version
		localWebSQL.version = "1.0";
		// marker for localIndexedDB
		localWebSQL.name = "webSQL";
		// database name
		localWebSQL.dbName = "cacheDB";
      // entity name
		localWebSQL.entityName = "cacheTable";
		// database description
		localWebSQL.dbDescription = localWebSQL.dbName;
		// database size
		localWebSQL.dbSize = 5 * 1024 * 1024;
		// entity size
		localWebSQL.entitySize = 0;
		// database options
		localWebSQL.options = {};

		// open the database and configure it appropraitely
		localWebSQL.open = function() {
		   var deferred = $q.defer();
		   // update dbName and entityName on DB open
		   localWebSQL.dbName = localWebSQL.options.dbName;
		   localWebSQL.entityName = localWebSQL.options.entityName;
         
			try {
			    if (localWebSQL.db) {
			    	$timeout(function() {
			            deferred.resolve();
				    });
			        return deferred.promise;
			    }

			    // check for webSQL support
			    if (!$window.openDatabase) {
			    	var errorMessage = "webSQL not supported on this device";
			    	console.warn(errorMessage);
			    	$timeout(function() {
			    	  deferred.resolve(null);
			    	});
			    	return deferred.promise;
			    }
			    
			    // handle for the actual webSQL database
				localWebSQL.db = $window.openDatabase(localWebSQL.dbName, localWebSQL.version, localWebSQL.dbDescription, localWebSQL.dbSize);

				localWebSQL.db.transaction(function (tx) {
				   var createTable = 'CREATE TABLE IF NOT EXISTS ' + localWebSQL.entityName + ' (cacheKey TEXT PRIMARY KEY, cacheValue TEXT)';
				   tx.executeSql(createTable, [], onsuccess, onfailure);
				});

				var onsuccess = function() {
				   $timeout(function() {
				    	deferred.resolve(localWebSQL.db);
			    	});
				};

				var onfailure = function(tx, e) {
				    var errorMessage = "";
				    switch (e.code) 
				    {
				       case e.SYNTAX_ERR:
				    	   errorMessage = "syntax error has occurred. " + e.message;
				    	   console.warn(errorMessage);
				           break;
				       default:
				    	   errorMessage = "error creating webSQL table " + localWebSQL.entityName + ". error: " + e;
				    }
				    console.warn(errorMessage);
				    
				    $timeout(function() {
				       deferred.resolve(null);
			    	});
				};
			} catch (e) {
			    var errorMessage = "error creating webSQL database/table. error: " + e;
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			       deferred.resolve(null);
		    	});
			}

			return deferred.promise;
		};
		/** 
       * Function for caching a data. 
       * key must be truthy -> not (null | undefined | NaN | "" | 0 | false)
       * @param {key} the key for data to be cached
       * @param {value} the actual data to cache
       */
		localWebSQL.save = localWebSQL.setItem = function(key, value) {
		   var deferred = $q.defer();
		   var errorMessage = "";
		   if (!key) {
		       errorMessage = "invalid key";
			    console.warn(errorMessage);
			    
			   $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			}

		   if (!localWebSQL.db) {
		       errorMessage = "localWebSQL.db undefined";
		       console.warn(errorMessage);
		        
		       $timeout(function() {
		          deferred.reject(errorMessage);
		       });
		    	
			    return deferred.promise;
			}

			var db = localWebSQL.db;
			var savedStatus = false;
			db.transaction(function (tx) {
			    var insertData = 'INSERT INTO ' + localWebSQL.entityName + ' (cacheKey, cacheValue) VALUES (?, ?)';
				tx.executeSql(insertData, [key, value], oninsertsuccess, onfailure);
			});

			var oninsertsuccess = function() {
			   savedStatus = true;
				// invalidate current cached page after specified max period
				$timeout(function() {
					localWebSQL.removeItem(key);
		    	}, localWebSQL.options.maxAge);
				
			    $timeout(function() {
			    	deferred.resolve(savedStatus);
		    	});
			};
			
			var onfailure = function(tx, e) {
			   var errorMessage = "";
			   switch (e.code) 
			   {
			      case e.SYNTAX_ERR:
			    	   errorMessage = "syntax error has occurred. " + e.message;
			    	   console.warn(errorMessage);
			          break;
			      default:
			   	   errorMessage = "error caching data. error: " + e.message;
			   }
			   console.warn(errorMessage);
			    
			   $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			return deferred.promise;
		};
		/** 
       * Function to retrieve existing cache data
       * key must be defined
       * @param {key} the key for data to be retrieved
       */
		localWebSQL.get = localWebSQL.getItem = function(key) {
		   var deferred = $q.defer();
		   var errorMessage = "";
		   if (!localWebSQL.db) {
		      errorMessage = "localWebSQL.db undefined";
		      console.warn(errorMessage);
		        
		      $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
		    	
			   return deferred.promise;
			}

			var db = localWebSQL.db;
			db.transaction(function (tx) {
			   var selectData = 'SELECT cacheValue FROM ' + localWebSQL.entityName + ' WHERE cacheKey = ?';
			   tx.executeSql(selectData, [key], onsuccess, onfailure);
			});
			var onsuccess = function(tx, result) {
				if (result) {
				    var data = null;
					if (result.rows && result.rows.length) {
					    data = result.rows.item(0).cacheValue;
					}
					
					$timeout(function() {
						deferred.resolve(data);
			    	});
				}
			};
			
			var onfailure = function(tx, e) {
			    var errorMessage = "";
			    switch (e.code) 
			    {
			       case e.SYNTAX_ERR:
			    	   errorMessage = "syntax error has occurred. " + e.message;
			    	   console.warn(errorMessage);
			           break;
			       default:
			    	   errorMessage = "error retrieving data. error: " + e.message;
			    }
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};
			
			return deferred.promise;
		};
		/** 
       * Function to delete an existing cache data
       * key must be defined and part of exisiting keys
       * @param {key} the key for data to be deleted
       */
		localWebSQL.remove = localWebSQL.removeItem = function(key) {
		    var deferred = $q.defer();
		    var errorMessage = "";
		    if (!localWebSQL.db) {
		        errorMessage = "localWebSQL.db undefined";
		        console.warn(errorMessage);
		        
		        $timeout(function() {
		           deferred.reject(errorMessage);
		        });
		        $timeout.flush();
		    	
			    return deferred.promise;
			}

			var db = localWebSQL.db;
			db.transaction(function (tx) {
			   var deleteData = 'DELETE FROM ' + localWebSQL.entityName + ' WHERE cacheKey = ?';
				tx.executeSql(deleteData, [key], onsuccess, onfailure);
			});

			var onsuccess = function() {
				$timeout(function() {
				   deferred.resolve();
			   });
			};
			
			var onfailure = function(tx, e) {
			    var errorMessage = "";
			    switch (e.code) 
			    {
			       case e.SYNTAX_ERR:
			    	   errorMessage = "syntax error has occurred. " + e.message;
			    	   console.warn(errorMessage);
			           break;
			       default:
			    	   errorMessage = "error removing data. error: " + e.message;
			    }
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			       deferred.reject(errorMessage);
		    	 });
			};

			return deferred.promise;
		};
		/** 
       * Function to clear entire cache space
       */
		localWebSQL.clear = function() {
		   var deferred = $q.defer();
		   var errorMessage = "";
		   if (!localWebSQL.db) {
		       errorMessage = "localWebSQL.db yet to be defined";
		       console.warn(errorMessage);
		        
		       $timeout(function() {
		          deferred.reject(errorMessage);
		       });
		    	
			    return deferred.promise;
			}

			var db = localWebSQL.db;
			var status = false;
			db.transaction(function (tx) {
			    var deleteTable = "DELETE FROM " + localWebSQL.entityName;
			    tx.executeSql(deleteTable, [], onsuccess, onfailure);
			});

			var onsuccess = function() {
			    console.log(localWebSQL.entityName + " table in " + localWebSQL.dbName + " webSQL data cleared");
			    status = true;
			    
			    $timeout(function() {
			       deferred.resolve(status);
		    	 });
			};
			
			var onfailure = function(tx, e) {
			    var errorMessage = "";
			    switch (e.code) 
			    {
			       case e.SYNTAX_ERR:
			    	   errorMessage = "syntax error has occurred. " + e.message;
			    	   console.warn(errorMessage);
			           break;
			       default:
			    	   errorMessage = "couldn't clear content of webSQL: " + localWebSQL.entityName  + ". error: " + e.message;
			    }
			    console.warn(errorMessage);
			    
			    $timeout(function() {
			       deferred.reject(errorMessage);
		    	 });
			};

			return deferred.promise;
		};
		/** 
       * Function to compute current size of cache, as per number of cache items
       */
		localWebSQL.length = function() {
		   var deferred = $q.defer();
		   var errorMessage = "";
		   if (!localWebSQL.db) {
		       errorMessage = "localWebSQL.db undefined";
		       console.warn(errorMessage);
		        
		       $timeout(function() {
		           deferred.reject(errorMessage);
		       });
			}

			var db = localWebSQL.db;
			
			db.transaction(function (tx) {
			    var tableSize = 'SELECT COUNT(*) AS Size from ' + localWebSQL.entityName;
				tx.executeSql(tableSize, [], onsuccess, onfailure);
			});

			var onsuccess = function(tx, result) {
				if (result && result.rows) {
				   $timeout(function() {
				    	deferred.resolve(result.rows.item(0).Size);
			    	});
				}
			};
			
			var onfailure = function(tx, e) {
			   var errorMessage = "";
			   switch (e.code) 
			   {
			      case e.SYNTAX_ERR:
			   	   errorMessage = "syntax error has occurred. " + e.message;
			    	   console.warn(errorMessage);
			           break;
			      default:
			    	   errorMessage = "error computing current cache size. error: " + e.message;
			   }
			   console.warn(errorMessage);

			   $timeout(function() {
			    	deferred.reject(errorMessage);
		    	});
			};

			return deferred.promise;
		};

	/**
     * Utility function for detecting if specified storage type exist
     *
     * @param {storageType} the type of storage to consider
     */
	var storageExist = function(storageType) {
		var uid = (new Date()).valueOf().toString();
      // check if specified storageType allow storage
		var savePromise = storageType.save(uid, uid);
		savePromise.then(function() {
		   // delete test data upon successful cache test
		   storageType.remove(uid);
		});
		return savePromise;
	};

	/**
     * Act as the storage handle based on available storage type. This help predetermine possible storage typeon service load. 
     * It use either { localStorage | sessionStorage | polyFill } in the specified order of
     * availability. Store can also be configured using the cacheType {LOCAL_STORAGE | SESSION_STORAGE | INDEXED_DB | WEB_SQL | POLY_FILL };
     */
	var store = (function() {
		try {
		   storageExist(localStorageDB).then(function(lsdbSavedStatus) {
		      if (lsdbSavedStatus) {
		         // use localStorage directly if available
		         return localStorageDB;
		      } else {
		         storageExist(localSessionStorage).then(function(lssdbSavedStatus) {
		            if (lssdbSavedStatus) {
		               // use sessionStorage directly if available
		               console.log("attempting sessionStorage client caching");
		               return localSessionStorage;
		            } else {
		               // fall back to poly fill data map
		               console.log("attempting POLY_FILL client caching");
		               return POLY_FILL;
		            }
		         });
		      }
		   });
		} catch (e) {
			console.error(e.description);
			/* most likely: localStorage and sessionStorage have been disabled by user */
			console.warn("....defaulting to POLY_FILL client caching");
			return POLY_FILL;
		}
	}());

	// supported cache types
	var cacheType = {LOCAL_STORAGE: 'localStorage', SESSION_STORAGE: 'sessionStorage', INDEXED_DB: 'indexedDB', "WEB_SQL": "webSQL", POLY_FILL: "polyFill"};

	// configurable options
	var options = {
	    /*
	     * default database name. applicable to INDEXED_DB | WEB_SQL
	     */
	    dbName: "cacheDB",
	    /*
        * default table name. applicable to INDEXED_DB | WEB_SQL
        */
	    entityName: "cacheTable",
	    /*
         * first n-items (default to first 10 items) to be deleted from the
         * cache. this should be used when client storage is full. applicable to LOCAL_STORAGE | SESSION_STORAGE 
         */
        deletableCacheItems: 10,
        /*
         * period (in milliseconds) after which each cached data should be deleted. default to 10 min
         */
        maxAge: 600000,
        /*
         * cache type to use: valid options are { localStorage | sessionStorage | indexedDB | webSQL | polyFill }. default to polyFill
         */
        storage: cacheType.POLY_FILL
	};

	return {
		// POLY_FILL object
		POLY_FILL: POLY_FILL,
		// localStorage implementation
		localStorageDB: localStorageDB,
		// sessionStorage implementation
		localSessionStorage: localSessionStorage,
		// IndexedDB implementation
		localIndexedDB: localIndexedDB,
		// webSQL implementation
		localWebSQL: localWebSQL,
		// supported cache mechanism
		cacheType: cacheType,
		// storage handle
		store: store,
		// storage availability
		storeQuotaExceeded: storeQuotaExceeded,
		// check storage availability and usability
		storageExist: storageExist,
		// configurable options
		options: options,
		// cache service initialization
		init: function(initData) {
		   var deferred = $q.defer();
		   /* ensure dbName option exist and that it is a valid truthy */
	       if (initData && initData.hasOwnProperty('dbName') && initData.dbName) {
	            options.dbName = initData.dbName;
	       }
	       /* ensure entityName option exist and that it is a valid truthy */
	       if (initData && initData.hasOwnProperty('entityName') && initData.entityName) {
	            options.entityName = initData.entityName;
	       }
	       /* ensure deletableCacheItems option exist and that it is a valid truthy */
		   if (initData && initData.hasOwnProperty('deletableCacheItems') && initData.deletableCacheItems) {
			    options.deletableCacheItems = initData.deletableCacheItems;
		   }
		   /* ensure maxAge option exist and that it is a valid truthy */
		   if (initData && initData.hasOwnProperty('maxAge') && initData.maxAge) {
			    options.maxAge = initData.maxAge;
		   }
		   /* specify storage to use and that cacheType specified is a valid truthy */
		   if (initData && initData.hasOwnProperty('cacheType') && initData.cacheType) {
			    options.storage = initData.cacheType;
				// preprocessor handler for localIndexedDB
				var indexedDBPreprocessor = function (db) {
			      $timeout(function() {
			         deferred.resolve(db);
			      });
			      store = localIndexedDB;
			      console.debug("cacheType overriden as indexedDB");
			      console.log(localIndexedDB.dbName + " indexedDB database opened");
				};
				// preprocessor handler for localWebSQL
				var webSQLPreprocessor = function (db) {
	               $timeout(function() {
	                  deferred.resolve(db);
	               });
	               store = localWebSQL;
	               console.debug("cacheType overriden as webSQL");
	               console.log(localWebSQL.dbName + " webSQL database opened");
	            };
	            // preprocessor handler for localStorageDB
				var localStoragePreprocessor = function (db) {
	               $timeout(function() {
	                  deferred.resolve(db);
	               });
	               store = localStorageDB;
	               console.debug("cacheType overriden as localStorage");
	               console.log(localStorageDB.dbName + " localStorage database opened");
	            };
	            // preprocessor handler for localSessionStorage
				var sessionStoragePreprocessor = function (db) {
	               $timeout(function() {
	                  deferred.resolve(db);
	               });
	               store = localSessionStorage;
	               console.debug("cacheType overriden as sessionStorage");
	               console.log(localSessionStorage.dbName + " sessionStorage database opened");
	            };
	            // preprocessor handler for POLY_FILL
				var polyFillPreprocessor = function () {
	               $timeout(function() {
	                  deferred.resolve();
	               });
	               store = POLY_FILL;
	               console.debug("cacheType overriden as POLY_FILL");
	               console.log(POLY_FILL.dbName + " POLY_FILL database opened");
	            };
            
	            /* finalize storage initialization */
				try {
					switch (options.storage) {
					   case "indexedDB":
	                     // fall through if IndexedDB storage is not supported or currently unavailable on client device
	                     $window.indexedDB = $window.IndexedDB || $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB;
	                     if ($window.indexedDB) {
	                        // update storage options
	                        localIndexedDB.options = options;
	                        localIndexedDB.open().then(function(lidb) {
	                           if (lidb) {
	                              indexedDBPreprocessor(lidb);
	                           } else {
	                              // update storage options
	                              localWebSQL.options = options;
	                              localWebSQL.open().then(function(lwdb) {
	                                 if (lwdb) {
	                                    webSQLPreprocessor(lwdb);
	                                 } else {
	                                    // update storage options
	                                    localStorageDB.options = options;
	                                    localStorageDB.open().then(function(lsdb) {
	                                       if (lsdb) {
	                                          localStoragePreprocessor(lsdb);
	                                       } else {
	                                          // update storage options
	                                          localSessionStorage.options = options;
	                                          localSessionStorage.open().then(function(lssdb) {
	                                             if (lssdb) {
	                                                sessionStoragePreprocessor(lssdb);
	                                             } else {
	                                                // update storage options
	                                                POLY_FILL.options = options;
	                                                polyFillPreprocessor();
	                                             }
	                                          });
	                                       }
	                                    });
	                                 }
	                              });
	                           }
	                        });
	                     }
	                     break;
	                  case "webSQL":
	                     // fall through if WebSQL storage is not supported or currently unavailable on client device
	                     if ($window.openDatabase) {
	                        // update storage options
	                        localWebSQL.options = options;
	                        localWebSQL.open().then(function(lwdb) {
	                           if (lwdb) {
	                              webSQLPreprocessor(lwdb);
	                           } else {
	                              // update storage options
	                              localIndexedDB.options = options;
	                              localIndexedDB.open().then(function(lidb) {
	                                 if (lidb) {
	                                    indexedDBPreprocessor(lidb);
	                                 } else {
	                                    // update storage options
	                                    localStorageDB.options = options;
	                                    localStorageDB.open().then(function(lsdb) {
	                                       if (lsdb) {
	                                          localStoragePreprocessor(lsdb);
	                                       } else {
	                                          // update storage options
	                                          localSessionStorage.options = options;
	                                          localSessionStorage.open().then(function(lssdb) {
	                                             if (lssdb) {
	                                                sessionStoragePreprocessor(lssdb);
	                                             } else {
	                                                // update storage options
	                                                POLY_FILL.options = options;
	                                                polyFillPreprocessor();
	                                             }
	                                          });
	                                       }
	                                    });
	                                 }
	                              });
	                           }
	                        });
	                     }
	                     break;
	                  case "localStorage":
						 // fall through if localStorage storage is not supported or currently unavailable on client device
	                     if ($window.localStorage) {
	                        // update storage options
	                        localStorageDB.options = options;
	                        localStorageDB.open().then(function(lsdb) {
	                           if (lsdb  && localStorageDB.db.save) {
	                              localStoragePreprocessor(lsdb);
	                           } else {
	                              // update storage options
	                              localIndexedDB.options = options;
	                              localIndexedDB.open().then(function(lidb) {
	                                 if (lidb) {
	                                    indexedDBPreprocessor(lidb);
	                                 } else {
	                                    // update storage options
	                                    localWebSQL.options = options;
	                                    localWebSQL.open().then(function(lwdb) {
	                                       if (lwdb) {
	                                          webSQLPreprocessor(lwdb);
	                                       } else {
	                                          // update storage options
	                                          localSessionStorage.options = options;
	                                          localSessionStorage.open().then(function(lssdb) {
	                                             if (lssdb) {
	                                                sessionStoragePreprocessor(lssdb);
	                                             } else {
	                                                // update storage options
	                                                POLY_FILL.options = options;
	                                                polyFillPreprocessor();
	                                             }
	                                          });
	                                       }
	                                    });
	                                 }
	                              });
	                           }
	                        });
	                     }
	                     break;
						case "sessionStorage":
							// fall through if sessionStorage storage is not supported or currently unavailable on client device
	                     if ($window.sessionStorage) {
	                        // update storage options
	                        localSessionStorage.options = options;
	                        localSessionStorage.open().then(function(lssdb) {
	                           if (lssdb  && localSessionStorage.db.save) {
	                              sessionStoragePreprocessor(lssdb);
	                           } else {
	                              // update storage options
	                              localIndexedDB.options = options;
	                              localIndexedDB.open().then(function(lidb) {
	                                 if (lidb) {
	                                    indexedDBPreprocessor(lidb);
	                                 } else {
	                                    // update storage options
	                                    localWebSQL.options = options;
	                                    localWebSQL.open().then(function(lwdb) {
	                                       if (lwdb) {
	                                          webSQLPreprocessor(lwdb);
	                                       } else {
	                                          // update storage options
	                                          localStorageDB.options = options;
	                                          localStorageDB.open().then(function(lsdb) {
	                                             if (lsdb) {
	                                                localStoragePreprocessor(lsdb);
	                                             } else {
	                                                // update storage options
	                                                POLY_FILL.options = options;
	                                                polyFillPreprocessor();
	                                             }
	                                          });
	                                       }
	                                    });
	                                 }
	                              });
	                           }
	                        });
	                     }
	                     break;
						case "POLY_FILL":
						   // update storage options
						   POLY_FILL.options = options;
						   POLY_FILL.open().then(function() {
						      polyFillPreprocessor();
						   });
						   break;
					}
				   
					return deferred.promise;
				} catch(e) {
				    store = POLY_FILL;
				    // update storage options
					 store.options = options;
					 console.warn("chosen cacheType probably not supported...using POLY_FILL as fallback cacheType. error: " + e);
				}
			}
		},
		// cache data
		save: function(key, value) {
			return store.save(key, value);
		},
		// remove cached data
		remove: function(key) {
			return store.remove(key);
		},
		// retrieve cached data
		get: function(key) {
			return store.get(key);
		},
		// compute size of cached storage
		length: function() {
			return store.length();
		},
		// clear cache storage
		clear: function() {
			return store.clear();
		}
	};
}]);