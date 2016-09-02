var enterpriseDashboardApp = angular.module("enterpriseDashboardApp", ['ngRoute', 'ngSanitize', 'ngCsv', 'ngProgress', "appRoutes", "bw.paging", 'ngVideoPreview', "media", "ja.qr", "ngTouch"]);

enterpriseDashboardApp.factory('$fakeStorage', [
    function(){
        function FakeStorage() {};
        FakeStorage.prototype.setItem = function (key, value) {
            this[key] = value;
        };
        FakeStorage.prototype.getItem = function (key) {
            return typeof this[key] == 'undefined' ? null : this[key];
        }
        FakeStorage.prototype.removeItem = function (key) {
            this[key] = undefined;
        };
        FakeStorage.prototype.clear = function(){
            for (var key in this) {
                if( this.hasOwnProperty(key) )
                {
                    this.removeItem(key);
                }
            }
        };
        FakeStorage.prototype.key = function(index){
            return Object.keys(this)[index];
        };
        return new FakeStorage();
    }
])

enterpriseDashboardApp.config(function($httpProvider, $routeProvider, $locationProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

enterpriseDashboardApp.service('edbService', function($rootScope, $location, $window, $route, $http, $fakeStorage, $q) {
    var self = this;

    $rootScope.domainname = '';
    $rootScope.listofdomains = [];

    this.gotoProfileView = function(userObjectId) {
        $rootScope.gotoProfileView(userObjectId);
    }

    this.checkLoggedInUser = function(){
        var deferred = $q.defer();
        var localstorageobj = self.getLocalStorage();
        $http({
            method: "post",
            url: "/user/loggedinUser"
        }).success(function(data, status, headers, config) {
            if (data.isSuccess) {
                $rootScope.loggedInUser = data.user;
                localstorageobj.setItem('loggedInUserID', data.user.objectId);
                $rootScope.loggedInUserID = data.user.objectId;
                if (data.user.selectedDomain){
                    $rootScope.domainname = data.user.selectedDomain;
                } else {
                    $rootScope.domainname = '';
                }
                if (data.user.additionalDomains){
                    $rootScope.listofdomains = data.user.additionalDomains;
                } else {
                    $rootScope.listofdomains = [''];
                }
            } else {
                $location.path("/login");
            }
            deferred.resolve();
        })
        .error(function(data, status, headers, config) {
            $location.path("/login");
            deferred.reject;
        });
        return deferred.promise;
    }

    this.setDomainName = function(domainname){
        var deferred = $q.defer();
        $http({
            method: "post",
            url: "/user/setdomainusers",
            data: {
                'domainname' : domainname
            }
        })
            .success(function(data, status, headers, config) {
                $rootScope.domainname = domainname;
                deferred.resolve();
                console.log('variable changed to ' + domainname);
            })
            .error(function(data, status, headers, config) {
                console.log("Error while changing domain.");
                deferred.reject;
            });
        return deferred.promise;
    }

    $rootScope.LogOutMe = function(){
        var localstorageobj = self.getLocalStorage();
        $http({
            method: "get",
            url: "/user/logout"
        })
            .success(function(data, status, headers, config) {
                $rootScope.loggedInUser = null;
                localstorageobj.setItem('loggedInUser', null);
                $location.path("/login");
            })
            .error(function(data, status, headers, config) {
                console.log("Error while logging out.");
            });
    }

    $rootScope.gotoProfileView = function(userObjectId) {
        var localstorageobj = self.getLocalStorage();

        if (!userObjectId){
            loggedInUserID = localstorageobj.getItem('loggedInUserID');
            if (loggedInUserID){
                userObjectId = loggedInUserID;
            }
        }

        $rootScope.profileUserId = userObjectId;        

        localstorageobj.setItem('profileUserId', userObjectId);
        
        console.log("Showing the profile for user id : " + userObjectId);
        if ($location.path() == '/usersProfileView'){
            $window.location.reload();
        } else {
            $location.path("/usersProfileView");
        }        
    }

    this.fetchEventsForTag = function(itemId, tagName, tagDescription, tagVideo, isAutoPlay, audiofile, videofilething, audiofilething, videofileitem, pristineID) {
        console.log("edbService -fetchEventForTag function called");
        console.log("Showing the tag Scans for tag id: " + itemId + ", tag name is ::" + tagName + ",tag description is:: " + tagDescription + ", Pristine ID :: " + pristineID);
        console.log('Top video file thing :: ' + videofilething);
        $rootScope.itemId = itemId;
        $rootScope.tagName = tagName;
        $rootScope.tagDescription = tagDescription;
        $rootScope.video = tagVideo;
        $rootScope.isAutoPlay = isAutoPlay;
        $rootScope.audiofile = audiofile;
        $rootScope.videofilething = videofilething;
        $rootScope.audiofilething = audiofilething;
        $rootScope.videofileitem = videofileitem;
        $rootScope.pristineID = pristineID;

        var localstorageobj = self.getLocalStorage();

        /*For Page reloading purpose*/
        localstorageobj.setItem('Tag_itemId', itemId);
        localstorageobj.setItem('Tag_tagName', tagName);
        localstorageobj.setItem('Tag_tagDescription', tagDescription);
        localstorageobj.setItem('Tag_video', tagVideo);
        localstorageobj.setItem('Tag_isAutoPlay', isAutoPlay);
        localstorageobj.setItem('Tag_audiofile', audiofile);
        localstorageobj.setItem('Tag_videofilething', videofilething);
        localstorageobj.setItem('Tag_audiofilething', audiofilething);
        localstorageobj.setItem('Tag_videofileitem', videofileitem);
        localstorageobj.setItem('Tag_pristineID', pristineID);        
        $location.path("/tagView")
    }

    this.isStorageSupported = function(storageName) {
        var testKey = 'test',
            storage = $window[storageName];
        try
        {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        } 
        catch (error) 
        {
            return false;
        }
    }

    this.getLocalStorage = function(){
        var storage = self.isStorageSupported('localStorage') ? $window.localStorage : $fakeStorage;
        return storage;
    }

});

enterpriseDashboardApp.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if (event.which === 13) {
                scope.$apply(function() {
                    scope.$eval(attrs.ngEnter, {
                        'event': event
                    });
                });

                event.preventDefault();
            }
        });
    };
})

enterpriseDashboardApp.controller('UserLoginCtrl', function($rootScope, $scope, $route, $http, $location, $window, edbService) {

    $rootScope.activeTab = $route.current.activeTab;

    $scope.userFormData = new Object();
    $scope.userFormData.userName = '';
    $scope.userFormData.password = '';
    $scope.LoginStatus = "Login";
    $rootScope.loggedInUser = '';
    $rootScope.loggedInUser.profilePictureUrl = '';
    var localstorageobj = edbService.getLocalStorage();

    //Log out and reset user data so that clears the data
    if ($rootScope.isLogOut == true) {
        $http({
            method: "get",
            url: "/user/logout"
        })
            .success(function(data, status, headers, config) {
                $rootScope.loggedInUser = null;
                localstorageobj.setItem('loggedInUser', null);
            })
            .error(function(data, status, headers, config) {
                console.log("Error while logging out.");
            });
    } else {
        //Check for active session if user going to  home page/root
        $http({
            method: "post",
            url: "/user/loggedinUser"
        })
            .success(function(data, status, headers, config) {
                if (data.isSuccess) {
                    $rootScope.loggedInUser = data.user;
                    localstorageobj.setItem('loggedInUserID', data.user.objectId);
                    $rootScope.loggedInUserID = data.user.objectId;

                    //$location.path("/index.html");
                    $location.path("/set-domain");
                } else {
                    $scope.errorMessage = data.message;
                    $scope.isError = true;
                }
            })
            .error(function(data, status, headers, config) {
                $scope.errorMessage = data.message;;
            });
    }

    $scope.submitForm = function() {
        $scope.LoginStatus = "Processing..";
        var formData = {
            "username": $scope.userFormData.userName,
            "password": $scope.userFormData.password
        };

        $http({
            method: "post",
            url: "/user/login",
            data: formData
        })
            .success(function(data, status, headers, config) {
                if (data.isSuccess) {
                    $rootScope.loggedInUser = data.user;
                    //$location.path("/index.html");
                    $location.path("/set-domain");
                } else {
                    $scope.errorMessage = data.message;
                    $scope.isError = true;
                    $scope.LoginStatus = "Login";
                }
            })
            .error(function(data, status, headers, config) {
                $scope.errorMessage = 'Login Failed';
                $scope.LoginStatus = "Login";
            });
    }
});

enterpriseDashboardApp.controller('enterpriseDashboardCtrl', function($rootScope, $scope, $route, $http, $location, edbService, ngProgressFactory, $timeout, $interval, $window, $q) {
    $scope.progressbar = ngProgressFactory.createInstance();
    $scope.progressbar.setParent(document.getElementById('progressbar'));
    $scope.progressbar.setHeight('1px');
    $scope.progressbar.setColor('firebrick');
    $scope.progressbar.start();
    $scope.tagtotalRecords = 0;
    $scope.refreshuserbuttontext = 'Refresh Users List';
    $scope.UsersInitialized = false;
    $scope.TagsInitialized = false;
    $scope.dashboarddomainname = $rootScope.domainname;
    $scope.dashboardlistofdomains = $rootScope.listofdomains
    $scope.updatingCurrentDomain = false;

    $rootScope.tagSortReverse = '-5'; // set the default sort type

    /*$scope.$watchCollection('[refreshuserbuttontext]', function() {
        if ($scope.refreshuserbuttontext) {
            $timeout(function() {
                $scope.refreshuserbuttontext = 'Refresh Users List';
            }, 5000);
        }
    });*/

    $scope.getUserHeader = function() {
        return ["Name", "Username", "Scans", "Device", "Os Ver.", "App Ver."]
    };

    $rootScope.activeTab = $route.current.activeTab;

    $scope.currentItemId = "";

    //If user is logged in populate the dashboard metrics - number of users, scans and tags
    if ($rootScope.loggedInUser) {
        if (!$rootScope.domainname){
            $location.path("/set-domain");
        }
        $http({
            method: "GET",
            url: "/dashboard/tagCount"
        }).success(function(data, status, headers, config) {
            $scope.tagdata = data.data;

            $rootScope.tagCount = data.tagCount;
            $scope.tagtotalRecords = data.tagCount;
            $scope.TagsInitialized = true;
        });
        console.log('Rootscope Domain Name :: ' + $rootScope.domainname);
    } else {
        //$location.path("/login");
        edbService.checkLoggedInUser().then(function(){
            if ($rootScope.domainname){
                $scope.dashboardlistofdomains = $rootScope.listofdomains;
                $scope.dashboarddomainname = $rootScope.domainname;
            } else {
                $location.path("/set-domain");
            }
        });
        
        $http({
                method: "GET",
                url: "/dashboard/tagCount"
            }).success(function(data, status, headers, config) {
                $scope.tagdata = data.data;
                $rootScope.tagCount = data.tagCount;
                $scope.tagtotalRecords = data.tagCount;
                $scope.TagsInitialized = true;
            });
        console.log('Rootscope Domain Name :: ' + $rootScope.domainname);
    }

    $scope.changeDomainName = function(){
        $scope.updatingCurrentDomain = true;
        edbService.setDomainName($scope.dashboarddomainname).then(function(){
            $window.location.reload();
        })        
    }

    //scanCount
    $scope.$watchCollection('[currentItemId]', function() {
        $rootScope.currentItemId = $scope.currentItemId;
    });

    /*Already calling internally in data/users service. So no need to be here.*/
    $scope.updateAcceptedUsers = function() {
        $scope.refreshuserbuttontext = 'Processing..';
        $http({
            method: "GET",
            url: "/data/updateAcceptedUsers"
        }).success(function(data, status, headers, config) {
            $scope.errorMessage = data.message;
            if ($scope.userSearchWord){
                $scope.userSearchWord = '';
            } else {
                $scope.getUsers();
            }
        }).error(function(data, status, headers, config) {
            $scope.errorMessage = data.message;
        });
    };

    $scope.fetchEventsForTag = function(itemId, tagname, tagdescription, tagVideo, isAutoPlay, audiofile, videofilething, audiofilething, videofileitem, pristineID) {
        console.log('Getting Pristing ID in Tag Scope :: ' + pristineID);
        edbService.fetchEventsForTag(itemId, tagname, tagdescription, tagVideo, isAutoPlay, audiofile, videofilething, audiofilething, videofileitem, pristineID);
    };

    $scope.currentPage = 1;
    $scope.pageSize = '10';
    $scope.userId = null;
    $scope.userSearchWord = '';

    $scope.users = {};
    $scope.userscsv = {};

    $scope.getUsers = function() {
        $scope.UsersInitialized = false;
        $http({
            method: "post",
            url: "/data/users",
            data: {
                "draw": $scope.currentPage,
                "length": $scope.pageSize,
                "userID": $scope.userId,
                "userSearchWord": $scope.userSearchWord
            }
        }).success(function(data, status, headers, config) {
            $scope.users = data.data;
            $scope.userscsv = data.dataAll;
            $scope.totalRecords = data.recordsTotal;
            if (data.dataAll){
                $rootScope.userCount = data.dataAll.length;
            } else {
                $rootScope.userCount = 0;
            }
            $scope.UsersInitialized = true;
        }).error(function(data, status, headers, config) {
            console.log("Some Error :::: " + data);
            $scope.UsersInitialized = true;
        });
    };

    $scope.getUsers();

    $scope.$watchCollection('[currentPage]', function() {
        if ($scope.UsersInitialized){
            $scope.getUsers();
        }
    });

    $scope.$watchCollection('[pageSize]', function() {
        if ($scope.UsersInitialized){
            $scope.currentPage = 1;
            $scope.getUsers();
        }
    });

    $scope.searchUsers = function() {
        if ($scope.UsersInitialized){
            $scope.currentPage = 1;
            $scope.getUsers();
        }
    }

    $scope.tagcurrentPage = 1;
    $scope.tagpageSize = '10';
    $scope.tagtype = "nonreset";
    $scope.tagtotalRecords = 0;
    $scope.userSearchTags = '';

    $scope.getTags = function() {
        $scope.TagsInitialized = false;
        $http({
            method: "POST",
            url: "/dashboard/tagCountpost",
            data: {
                "draw": $scope.tagcurrentPage,
                "length": $scope.tagpageSize,
                "tagSearchWord": $scope.userSearchTags,
                "tagtype": $scope.tagtype
            }
        }).success(function(data, status, headers, config) {
            $scope.tagdata = data.data;
            $scope.tagtotalRecords = data.tagCount;
            $scope.TagsInitialized = true;
        });
    }

    $scope.$watchCollection('[tagcurrentPage]', function() {
        if ($scope.TagsInitialized){
            $scope.getTags();
        }
    });

    $scope.$watchCollection('[tagpageSize]', function() {
        if ($scope.TagsInitialized){
            $scope.tagcurrentPage = 1;
            $scope.getTags();
        }
    });

    $scope.$watchCollection('[tagtype]', function() {
        if ($scope.TagsInitialized){
            $scope.getTags();
        }
    });
    $scope.searchTags = function(){
        if ($scope.TagsInitialized){
            $scope.tagcurrentPage = 1;
            $scope.getTags();
        }
    }
    $scope.gotoProfileView = function(userObjectId) {
        edbService.gotoProfileView(userObjectId);
    };

});

enterpriseDashboardApp.controller('scansViewController', function($rootScope, $scope, $route, $http, $location, edbService, $window) {
    $scope.initialized = false;   
    $scope.currentPage = 1;
    $scope.pageSize = '10';
    $scope.totalRecords = "";

    $scope.localThingId = null;
    $scope.scans = {};
    $scope.scanscsv = {};
    $scope.scanSearchWord = "";
    $scope.dashboarddomainname = $rootScope.domainname;
    $scope.dashboardlistofdomains = $rootScope.listofdomains
    $scope.updatingCurrentDomain = false;

    $rootScope.activeTab = $route.current.activeTab;

    $rootScope.sortType = 'time'; // set the default sort type
    $rootScope.sortReverse = false; // set the default sort order
    $rootScope.searchTime = ''; // set the default search/filter term

    edbService.checkLoggedInUser().then(function(){
        if (!$rootScope.domainname){
            $location.path("/set-domain");
        } else {
            $scope.dashboardlistofdomains = $rootScope.listofdomains;
            $scope.dashboarddomainname = $rootScope.domainname;
        }
    });;

    $scope.changeDomainName = function(){
        $scope.updatingCurrentDomain = true;
        edbService.setDomainName($scope.dashboarddomainname).then(function(){
            $window.location.reload();
        })        
    }

    $scope.getScanHeader = function() {
        return ["Scanned By", "Content View", "Tag Name", "location", "Time Stamp"]
    };

   $scope.searchScansForTags = function() {
        console.log("Search Scans for Tags current page and size : " + $scope.currentPage + ", " + $scope.pageSize);
        $http({
            method: "post",
            url: "/data/scansForTag",
            data: {
                "draw": $scope.currentPage,
                "length": $scope.pageSize,
                "thingId": $scope.localThingId
            }
        })
            .success(function(data, status, headers, config) {
                $scope.scans = data.data;
                $scope.totalRecords = data.recordsTotal;
            })
            .error(function(data, status, headers, config) {
                $scope.errorMessage = "SUBMIT ERROR";
            });
    }

    $scope.getScans = function() {
        $scope.initialized = false;
        $http({
            method: "post",
            url: "/data/scans",
            data: {
                "draw": $scope.currentPage,
                "length": $scope.pageSize,
                "scanSearchWord": $scope.scanSearchWord
            }
        })
            .success(function(data, status, headers, config) {
                $scope.scans = data.data;
                $scope.totalRecords = data.recordsTotal;
                
                $scope.scanscsv = data.dataAll;
                if (data.dataAll) {
                    $rootScope.scanCount = data.dataAll.length;
                }
                $scope.initialized = true;
            })
            .error(function(data, status, headers, config) {
                //$scope[resultVarName] = "SUBMIT ERROR";
                console.log('Error in Fetching Scans');
            });
    }

    $scope.gotoProfileView = function(userObjectId) {
        edbService.gotoProfileView(userObjectId);
    }

    $scope.searchScans = function() {
        if($scope.initialized){
            $scope.currentPage = 1;
            $scope.getScans();
        }
    }
    
    $scope.$watchCollection('[currentPage]', function() {
        if($scope.initialized){
            console.log("Current page updated : " + $scope.currentPage);
        if ($scope.localThingId) {
            $scope.searchScansForTags();
        } else {
            $scope.getScans();
        }
        }
        
    });

    $scope.$watchCollection('[pageSize]', function() {
        if($scope.initialized){
            $scope.currentPage = 1;
            if ($scope.localThingId) {
                $scope.searchScansForTags();
            } else {
                $scope.getScans();
            }
         }
    });

    if ($rootScope.thingId) {
        $scope.localThingId = $rootScope.thingId;
        $scope.searchScansForTags();
    } else {
        $scope.getScans();
    }

    //reset user id/thing id for scans
    $rootScope.scansUserId = null;
    $rootScope.thingId = null;
});

enterpriseDashboardApp.controller('userProfileViewController', function($rootScope, $scope, $route, $http, $location, edbService, $window) {
    $scope.tags = {};
    $rootScope.activeTab = $route.current.activeTab;
    $scope.userId = 'dummy';
    var localstorageobj = edbService.getLocalStorage();


    var localStorageUserId = localstorageobj.getItem('profileUserId');

    edbService.checkLoggedInUser();
    
    if ($rootScope.profileUserId) {
        $scope.userId = $rootScope.profileUserId;
    } else if ($rootScope.loggedInUser && $rootScope.loggedInUser.objectId) {
        $scope.userId = $rootScope.loggedInUser.objectId;
    } else if (localStorageUserId) {
        $scope.userId = localStorageUserId;
    }
    
    $scope.gotoProfileView = function(userObjectId) {
        edbService.gotoProfileView(userObjectId);
    }

    $scope.totalRecords = '0';
    $scope.pageSize = '10';
    $scope.currentPage = '1';
    $scope.initialized = false;

    $http({
        method: "post",
        url: "/data/userProfile",
        data: {
            "userId": $scope.userId,
            "draw": $scope.currentPage,
            "length": $scope.pageSize
        }
    }).success(function(data, status, headers, config) {
        $scope.userProfile = data.user;
        $rootScope.userScanCount = data.scanCount;
        $scope.userTagCount = data.tagCount;
        $scope.totalRecords = data.scanCount;
        $scope.commentsCount = data.commentsCount;
        $scope.scans = data.data;
        $scope.jobTitle = data.jobTitle;
        $scope.OsVersion = data.OsVersion;
        $scope.appVersion = data.appVersion
        $scope.deviceModel = data.deviceModel;
        $rootScope.profileUserId = null;
        $scope.initialized = true;
    })
    .error(function(data, status, headers, config) {
        console.log("Profile ERROR Response" + JSON.stringify(data));
        $scope.initialized = true;
        //$scope[resultVarName] = "SUBMIT ERROR";
    });


    $scope.getUsersScans = function() {
        $scope.initialized = false;
        $http({
            method: "post",
            url: "/data/scansForUser",
            data: {
                "userId": $scope.userId,
                "draw": $scope.currentPage,
                "length": $scope.pageSize,
                "scanperiod": $scope.scanperiod
            }
        }).success(function(data, status, headers, config) {
            $scope.totalRecords = data.recordsTotal;
            $scope.scans = data.data;
            $scope.initialized = true;
        })
        .error(function(data, status, headers, config) {
            console.log("Profile ERROR Response" + JSON.stringify(data));
            $scope.initialized = true;
            //$scope[resultVarName] = "SUBMIT ERROR";
        });
    }

    $scope.$watchCollection('[currentPage]', function() {
        if ($scope.initialized) {
            $scope.getUsersScans();
        }
    });
    
    $scope.$watchCollection('[scanperiod]', function() {
        if ($scope.initialized) {
            $scope.currentPage = '1';
            $scope.getUsersScans();
        }
    });

});

enterpriseDashboardApp.controller('tagViewController', function($rootScope, $http, $scope, $route, $location, $sce, $timeout, $window, edbService ) {
    $scope.scans = {};
    $rootScope.activeTab = $route.current.activeTab;

    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalRecords = "";
    $scope.passcodeverificationstatus = '';
    $scope.modalresetpasscode = '';
    $scope.modalvideourl = '';
    $scope.tagviewsearch = '';
    $scope.TagScanInitialized = false;
    var localstorageobj = edbService.getLocalStorage();

    edbService.checkLoggedInUser();
    
    $scope.tagScan = function() {
        $scope.TagScanInitialized = false;

        /*When Page reloaded */
        if (!$rootScope.itemId){
            var itemId = localstorageobj.getItem('Tag_itemId');
            if (itemId){
                $rootScope.itemId = itemId;
                $rootScope.tagName = localstorageobj.getItem('Tag_tagName');
                if ($rootScope.tagName == 'null') { $rootScope.tagName= '' }
                $rootScope.tagDescription = localstorageobj.getItem('Tag_tagDescription');
                if ($rootScope.tagDescription == 'null') { $rootScope.tagDescription= '' }
                $rootScope.video = localstorageobj.getItem('Tag_video');
                if ($rootScope.video == 'null') { $rootScope.video= '' }
                $rootScope.audiofile = localstorageobj.getItem('Tag_audiofile');
                if ($rootScope.audiofile == 'null') { $rootScope.audiofile= '' }
                $rootScope.videofilething = localstorageobj.getItem('Tag_videofilething');
                if ($rootScope.videofilething == 'null') { $rootScope.videofilething= '' }
                $rootScope.audiofilething = localstorageobj.getItem('Tag_audiofilething');
                if ($rootScope.audiofilething == 'null') { $rootScope.audiofilething= '' }
                $rootScope.videofileitem = localstorageobj.getItem('Tag_videofileitem');
                if ($rootScope.videofileitem == 'null') { $rootScope.videofileitem= '' }
                $rootScope.pristineID = localstorageobj.getItem('Tag_pristineID');
                if ($rootScope.pristineID == 'null') { $rootScope.pristineID = ''; }
            }
        }

        if ($rootScope.itemId) {
            $http({
                method: "post",
                url: "/data/scansForItem", //Change the URL if you want to get the data from somewhere else
                data: {
                    "draw": $scope.currentPage,
                    "length": $scope.pageSize,
                    "itemId": $rootScope.itemId,
                    "tagviewsearch" : $scope.tagviewsearch
                }
            })
                .success(function(data, status, headers, config) {
                    $scope.scans = data.data;
                    $scope.tagTitle = $rootScope.tagName;
                    $scope.tagDescription = $rootScope.tagDescription;
                    $scope.tagVideo = $rootScope.video;
                    $scope.VideoType = 'url';
                    $scope.modalaudiourl = $rootScope.audiofile;
                    $scope.modalvideourl = $scope.tagVideo;
                    $scope.videofilething = $rootScope.videofilething;
                    $scope.audiofilething = $rootScope.audiofilething;
                    $scope.videofileitem = $rootScope.videofileitem;
                    $scope.pristineID = $rootScope.pristineID;
                    $scope.pristineIDURL = '';
                    if ($rootScope.pristineID){
                        $scope.pristineIDURL = 'http://pstn.us/' + $rootScope.pristineID;
                    }

                    $scope.VideoType = '';
                    $scope.videoextension = '';

                    if ($scope.tagVideo) {
                        $youtubeid = getYoutubeId($scope.tagVideo);
                        if ($youtubeid) {
                            $scope.VideoType = 'youtube';
                        } else {
                            $vimeoid = getVimeoId($scope.tagVideo);
                            if ($vimeoid) {
                                $scope.VideoType = 'vimeo';
                            } else {
                                $wistia = checkIsWistia($scope.tagVideo);
                                if ($wistia) {
                                    $scope.tagVideo = '//fast.wistia.net/embed/iframe/' + $scope.tagVideo.split('/').pop();
                                    $scope.VideoType = 'wistia';
                                } else {
                                    if ($scope.tagVideo) {
                                        $scope.videoextension = $scope.tagVideo.split('.').pop();
                                        $scope.VideoType = 'file';
                                    } else {
                                        $scope.tagVideo = false;
                                    }
                                }
                            }
                        }
                    } else if ($scope.videofileitem) {
                        $scope.videoextension = $scope.videofileitem.split('.').pop();
                        $scope.tagVideo = $scope.videofileitem;
                        $scope.VideoType = 'file';
                    } else if ($scope.videofilething) {
                        $scope.videoextension = $scope.videofilething.split('.').pop();
                        $scope.tagVideo = $scope.videofilething;
                        $scope.VideoType = 'file';
                    } else {
                        $scope.tagVideo = false;
                    }
                    

                    if (!$scope.audiofile) {
                        $scope.audiofile = $rootScope.audiofilething;
                    }

                    $scope.audiofile = ($rootScope.audiofile ? $rootScope.audiofile : false);
                    $scope.trustSrc = function(src) {
                        return $sce.trustAsResourceUrl(src);
                    }
                    $scope.isAutoPlay = $rootScope.isAutoPlay;
                    $scope.totalRecords = data.recordsTotal;

                    $scope.TagScanInitialized = true;
                })
                .error(function(data, status, headers, config) {
                    $scope.errorMessage = "SUBMIT ERROR";
                    $scope.TagScanInitialized = true;
                });
        } else
            console.log("NOT Fetching Scans Data for Item" + JSON.stringify($rootScope.itemId));
    }

    $scope.searchTagScans = function(){
        if ($scope.TagScanInitialized){
            $scope.currentPage = 1;
            $scope.tagScan();
        }        
    }

    $scope.resetTagUpdationStatus = '';
    $scope.resetTagClass = '';
    $scope.resetTag = function(itemId) {
        $scope.itemId = $rootScope.itemId;
        $http({
            method: "post",
            url: "/data/resetTag",
            data: {
                "itemId": $scope.itemId,
                "modalresetpasscode": $scope.modalresetpasscode
            }
        })
            .success(function(data, status, headers, config) {
                if (data.objectId) {
                    $rootScope.loggedInUser = data.user;
                    $scope.passcodeverificationstatus = 'Tag has been reset successfully';
                    document.getElementById('passcodeconfirmation').style.display = 'none';
                    $scope.resetTagUpdationStatus = data.message;
                    $scope.resetTagClass = 'alert alert-info fade in';
                    $location.path('/');
                } else {
                    $scope.errorMessage = data.message;
                    $scope.resetTagUpdationStatus = data.message;
                    $scope.resetTagClass = 'alert alert-danger fade in';
                    $scope.isError = true;
                }
            })
            .error(function(data, status, headers, config) {
                $scope['error'] = "SUBMIT ERROR";
                $scope.resetTagUpdationStatus = 'Submission Error';
                $scope.resetTagClass = 'alert alert-danger fade in';
            });
    }
    $scope.$watchCollection('[resetTagUpdationStatus]', function() {
        if ($scope.resetTagUpdationStatus) {
            $timeout(function() {
                $scope.resetTagUpdationStatus = '';
                $scope.resetTagClass = '';
            }, 5000);
        }
    });

    $scope.saveAudioVideoUrl = function(itemId) {
        $scope.itemId = $rootScope.itemId;
        $http({
            method: "post",
            url: "/data/updateaudiovideourl",
            data: {
                "itemId": $scope.itemId,
                "AudioUrl": $scope.modalaudiourl,
                "VideoUrl": $scope.modalvideourl,
                //"modalresetpasscode": $scope.modalresetpasscode
            }
        })
            .success(function(data, status, headers, config) {
                /*if (data.objectId) {
                    $location.path("/");
                } else {
                    $scope.errorMessage = data.message;
                    $scope.isError = true;
                }*/

                if (data.objectId) {
                    $('#videoupdatemodal').modal('hide');
                    $scope.resetTagUpdationStatus = 'Video updated successfully';
                    $scope.resetTagClass = 'alert alert-info fade in';
                    /*$('.modal-backdrop').removeClass('in');
                    $('.modal-backdrop').addClass('out');*/
                    $('.modal-backdrop').hide()
                    $scope.TagScanInitialized = false;
                    $location.path('/tagsView');
                    //$window.location.reload();
                } else {
                    $scope.errorMessage = data.message;
                    $scope.resetTagUpdationStatus = data.message;
                    $scope.resetTagClass = 'alert alert-danger fade in';
                    $scope.isError = true;
                }
            })
            .error(function(data, status, headers, config) {
                $scope['error'] = "SUBMIT ERROR";
            });
    }

    $scope.checkresetcode = function() {
        $http({
            method: "post",
            url: '/data/checkresetpasscode',
            data: {
                "modalresetpasscode": $scope.modalresetpasscode
            }
        })
            .success(function(data, status, headers, config) {
                if (data.isSuccess) {
                    $scope.resetTagUpdationStatus = data.message;
                    $scope.resetTagClass = 'alert alert-info fade in';
                    
                    /*document.getElementsByClassName("modal-backdrop")[0].
                    document.getElementById('passcodeconfirmationforvideo').style.display = 'none';*/
                    $('#passcodeconfirmationforvideo').modal('hide');
                    $('.modal-backdrop').removeClass('in');
                    $('.modal-backdrop').addClass('out');
                    $('#videoupdatemodal').modal('show');
                } else {
                    $scope.resetTagUpdationStatus = data.message;
                    $scope.resetTagClass = 'alert alert-danger fade in';
                }
            })
            .error(function(data, status, headers, config) {
                $scope['error'] = "SUBMIT ERROR";
            });
    }

    function getYoutubeId(url) {
        if (!url) {
            return '';
        }
        var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);

        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return '';
        }
    }

    function getVimeoId(url) {
        if (!url) {
            return '';
        }

        vimeo_Reg = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

        var match = url.match(vimeo_Reg);

        if (match) {
            return '' + match[3] + '';
        } else {
            return '';
        }
    }

    function checkIsWistia(url) {
        if (!url) {
            return false;
        }
        wistia_Reg = /https?:\/\/(.+)?(wistia.com|wi.st)\/(medias|embed)\/.*/;

        var match = url.match(wistia_Reg);

        if (match) {
            return true;
        } else {
            return false;
        }
    }

    $scope.tagNameUpdationStatus = '';
    $scope.tagNameClass = '';
    //To do: This needs to be fixed..
    $scope.updateTagName = function() {
        if ($rootScope.itemId) {
            $http({
                method: "post",
                url: "/data/updateTagName",
                data: {
                    "itemId": $rootScope.itemId,
                    "tagName": $scope.tagTitle
                }
            })
                .success(function(data, status, headers, config) {
                    $scope.tagNameUpdationStatus = 'Tag Name updated successfully';
                    $scope.tagNameClass = 'blue-text';
                })
                .error(function(data, status, headers, config) {
                    $scope.errorMessage = "SUBMIT ERROR";
                    $scope.tagNameUpdationStatus = 'Submission Error';
                    $scope.tagNameClass = 'red-text';
                });
        } else {
            console.log("Item not found" + JSON.stringify($rootScope.itemId));
        }
    }
    //<--

    $scope.$watchCollection('[tagNameUpdationStatus]', function() {
        if ($scope.tagNameUpdationStatus) {
            $timeout(function() {
                $scope.tagNameUpdationStatus = '';
                $scope.tagNameClass = '';
            }, 5000);
        }
    });

    $scope.tagDescrUpdationStatus = '';
    $scope.tagDescrClass = '';
    //To do: This needs to be fixed..
    $scope.updateTagDescription = function() {
        if ($rootScope.itemId) {
            $http({
                method: "post",
                url: "/data/updateTagDescription",
                data: {
                    "itemId": $rootScope.itemId,
                    "tagDescription": $scope.tagDescription
                }
            })
                .success(function(data, status, headers, config) {
                    //$scope.passcodeverificationstatus = 'Tag description updated successfully';
                    $scope.tagDescrUpdationStatus = 'Tag description updated successfully';
                    $scope.tagDescrClass = 'blue-text';
                })
                .error(function(data, status, headers, config) {
                    $scope.errorMessage = "SUBMIT ERROR";
                    $scope.tagDescrUpdationStatus = 'Submission Error';
                    $scope.tagDescrClass = 'red-text';
                });
        } else {
            console.log("Item not found" + JSON.stringify($rootScope.itemId));
        }
    }
    //<--
    $scope.$watchCollection('[tagDescrUpdationStatus]', function() {
        if ($scope.tagDescrUpdationStatus) {
            $timeout(function() {
                $scope.tagDescrUpdationStatus = '';
                $scope.tagDescrClass = '';
            }, 5000);
        }
    });

    $scope.tagviewsearch = '';
    $scope.$watchCollection('[currentPage]', function() {
        $scope.tagScan();
    });
    
    /*$scope.$watchCollection('[tagviewsearch]', function() {
        $scope.tagScan();
    });*/

    $scope.gotoProfileView = function(userObjectId) {
        edbService.gotoProfileView(userObjectId);
    };
});

enterpriseDashboardApp.controller('userViewController', function($rootScope, $scope, $http, $window, edbService) {
    UserAjax.init();
    $scope.userFormData = {};
    $rootScope.activeTab = 'Users';
    $rootScope.userCount = 0;
    $rootScope.scanCount = 0;
    $rootScope.tagCount = 0;
    $scope.dashboarddomainname = $rootScope.domainname;
    $scope.dashboardlistofdomains = $rootScope.listofdomains
    $scope.updatingCurrentDomain = false;

    edbService.checkLoggedInUser().then(function(){
        $scope.dashboardlistofdomains = $rootScope.listofdomains;
        $scope.dashboarddomainname = $rootScope.domainname;
    });

    $scope.changeDomainName = function(){
        $scope.updatingCurrentDomain = true;
        edbService.setDomainName($scope.dashboarddomainname).then(function(){
            $window.location.reload();
        })        
    }

    $scope.submitForm = function() {
        var formData = {
            "username": $scope.userFormData.username,
            "email": $scope.userFormData.email
        };

        $http({
            method: "post",
            url: "/user/findAndAddUser",
            data: formData
        })
            .success(function(data, status, headers, config) {
                $scope.foundUser = data.foundUser;
                $scope.message = data.message;
                console.log('Success of submitForm in userViewController :: ' + $scope.foundUser);
            })
            .error(function(data, status, headers, config) {
                console.log('Error of submitForm in userViewController :: ' + $scope.foundUser);
            });
    }

});

enterpriseDashboardApp.controller('tagsViewController', function($rootScope, $scope, $http, $location, edbService, $window) {
    $scope.currentPage = '1';
    $scope.pageSize = '30';
    $scope.totalRecords = "";

    $scope.tags = {};
    $rootScope.activeTab = 'Tags';
    $scope.userSearchTags = "";
    $scope.currentDisplayTag = null;
    $scope.tagtype = "nonreset";
    $scope.TagsInitialized = false;
    $scope.dashboarddomainname = $rootScope.domainname;
    $scope.dashboardlistofdomains = $rootScope.listofdomains
    $scope.updatingCurrentDomain = false;

    $rootScope.tagSortReverse = '-5'; // set the default sort type

    edbService.checkLoggedInUser().then(function(){
        if (!$rootScope.domainname){
            $location.path("/set-domain");
        }

        $scope.dashboardlistofdomains = $rootScope.listofdomains;
        $scope.dashboarddomainname = $rootScope.domainname;
    });

    $scope.changeDomainName = function(){
        $scope.updatingCurrentDomain = true;
        edbService.setDomainName($scope.dashboarddomainname).then(function(){
            $window.location.reload();
        })        
    }

    $http({
        method: "post",
        url: "/data/tags",
        data: {
            "draw": $scope.currentPage,
            "length": $scope.pageSize
        }
    })
        .success(function(data, status, headers, config) {
            $scope.tags = data.data;
            $scope.currentDisplayTag = data.data[0];
            $scope.totalRecords = data.tagCount;
            $scope.TagsInitialized = true;
        })
        .error(function(data, status, headers, config) {
            console.log('Stuck into the error on Fetching Tags');
            $scope.TagsInitialized = true;
        });

    $scope.fetchEventsForTag = function(itemId, tagname, tagdescription, tagVideo, isAutoPlay, audiofile, videofilething, audiofilething, videofileitem, pristineID) {
        edbService.fetchEventsForTag(itemId, tagname, tagdescription, tagVideo, isAutoPlay, audiofile, videofilething, audiofilething, videofileitem, pristineID);
    };

    $scope.showThisTag = function(curTagData) {
        $scope.currentDisplayTag = curTagData;
    }

    $scope.$watchCollection('[currentPage]', function() {
        if ($scope.TagsInitialized){
            $scope.searchTags();
        }
    });

    $scope.$watchCollection('[pageSize]', function() {
        if ($scope.TagsInitialized){
            $scope.currentPage = '1';
            $scope.searchTags();
        }
    });

    $scope.$watchCollection('[tagtype]', function() {
        if ($scope.TagsInitialized){
            $scope.searchTags();
        }
    });

    $scope.searchTags = function() {
        $scope.TagsInitialized = false;
        $http({
            method: "post",
            url: "/data/tags",
            data: {
                "draw": $scope.currentPage,
                "length": $scope.pageSize,
                "tagSearchWord": $scope.userSearchTags,
                "tagtype" : $scope.tagtype
            }
        })
            .success(function(data, status, headers, config) {
                $scope.tags = data.data;
                $scope.currentDisplayTag = data.data[0];
                $scope.totalRecords = data.tagCount;
                $scope.TagsInitialized = true;
            })
            .error(function(data, status, headers, config) {
                $scope['error'] = "SUBMIT ERROR";
                $scope.TagsInitialized = true;
            });
    }
});

enterpriseDashboardApp.controller('userPasswordController', function($rootScope, $scope, $route, $http, $location, edbService, $window) {
    $scope.tags = {};
    $rootScope.activeTab = $route.current.activeTab;
    $scope.userId = 'dummy';
    var localstorageobj = edbService.getLocalStorage();


    edbService.checkLoggedInUser();
    var localStorageUserId = localstorageobj.getItem('profileUserId');

    if (!$rootScope.loggedInUser){
        $location.path("/login");
    }

    if ($rootScope.profileUserId) {
        $scope.userId = $rootScope.profileUserId;
    } else if ($rootScope.loggedInUser && $rootScope.loggedInUser.objectId) {
        $scope.userId = $rootScope.loggedInUser.objectId;
    } else if (localStorageUserId) {
        $scope.userId = localStorageUserId;
    }

    $scope.processStatus = 'Reset';
    $scope.resetPasswordClass = '';
    $scope.resetPasswordStatus = '';

    $scope.$watchCollection('[resetPasswordStatus]', function() {
        if ($scope.resetTagUpdationStatus) {
            $timeout(function() {
                $scope.resetTagUpdationStatus = '';
                $scope.resetTagClass = '';
            }, 5000);
        }
    });

    $scope.newpassword = '';
    $scope.confirmpassword = '';

    $scope.newresetpasscode = '';
    $scope.confirmresetpasscode = '';

    $scope.resetLoginPassword = function(){
        if (!$scope.newpassword){
            $scope.resetPasswordStatus = 'Blank password not accepted.';
            $scope.resetPasswordClass = 'alert alert-danger fade in';
            return;
        }
        if ($scope.newpassword != $scope.confirmpassword) {
            $scope.resetPasswordStatus = 'Confirm password donot match with New password';
            $scope.resetPasswordClass = 'alert alert-danger fade in';
            return;
        }

        if ($rootScope.loggedInUser){
            $scope.processStatus = 'Processing..';
            $http({
            method: "post",
            url: "/user/updateLoginPassword",
            data: {
                    "userId": $scope.userId,
                    "newpassword": $scope.newpassword,
                }
            }).success(function(data, status, headers, config) {
                if (data.isSuccess) {
                    $scope.resetPasswordStatus = data.message;
                    $scope.resetPasswordClass = 'alert alert-info fade in';
                } else {
                    $scope.resetPasswordStatus = data.message;
                    $scope.resetPasswordClass = 'alert alert-danger fade in';
                }
                $scope.processStatus = 'Reset';
            })
            .error(function(data, status, headers, config) {
                $scope.resetPasswordStatus = 'Some error occur during processing';
                $scope.resetPasswordClass = 'alert alert-danger fade in';
            });            
        } else {
            $location.path("/login");
        }
    }

    $scope.resetResetPasscode = function(){
        if (!$scope.newresetpasscode){
            $scope.resetPasswordStatus = 'Blank password not accepted.';
            $scope.resetPasswordClass = 'alert alert-danger fade in';
            return;
        }
        if ($scope.newresetpasscode != $scope.confirmresetpasscode) {
            $scope.resetPasswordStatus = 'Confirm password donot match with New password';
            $scope.resetPasswordClass = 'alert alert-danger fade in';
            return;
        }

        console.log('Current User Id' + $scope.userId);

        if ($rootScope.loggedInUser){
            $scope.processStatus = 'Processing..';
            $http({
            method: "post",
            url: "/user/updateResetpasscode",
            data: {
                    "userId": $scope.userId,
                    "newpassword": $scope.newresetpasscode,
                }
            }).success(function(data, status, headers, config) {
                if (data.isSuccess) {
                    $scope.resetPasswordStatus = data.message;
                    $scope.resetPasswordClass = 'alert alert-info fade in';
                } else {
                    $scope.resetPasswordStatus = data.message;
                    $scope.resetPasswordClass = 'alert alert-danger fade in';
                }
            })
            .error(function(data, status, headers, config) {
                $scope.resetPasswordStatus = 'Some error occur during processing';
                $scope.resetPasswordClass = 'alert alert-danger fade in';
            });
            $scope.processStatus = 'Reset';
        } else {
            $location.path("/login");
        }
    }
});



enterpriseDashboardApp.controller('domainSelectionController', function($rootScope, $scope, $route, $http, $location, edbService) {
    $rootScope.activeTab = $route.current.activeTab;
    $scope.dashboarddomainname = $rootScope.domainname;
    $scope.dashboardlistofdomains = $rootScope.listofdomains;
    $scope.updatingCurrentDomain = false;
    
    edbService.checkLoggedInUser().then(function(){
        $scope.dashboardlistofdomains = $rootScope.listofdomains;
        $scope.dashboarddomainname = $rootScope.domainname;
    });
    
    $scope.changeDomainName = function(){
        $scope.updatingCurrentDomain = true;
        edbService.setDomainName($scope.dashboarddomainname).then(function(){
            $location.path('/index.html')
        })        
    } 
});