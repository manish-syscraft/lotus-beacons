angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
        // Home Page
        .when('/', {
            templateUrl: 'views/login-view.html',
            cache: false,
            controller: 'UserLoginCtrl',
            activeTab: 'Login'
        })
        // Home Page
        .when('/login', {
            templateUrl: 'views/login-view.html',
            controller: 'UserLoginCtrl',
            cache: false,
            activeTab: 'Login'
        })
        // Logout Page
        .when('/logOut', {
            templateUrl: 'views/login-view.html',
            controller: 'UserLoginCtrl',
            cache: false,
            activeTab: 'Login'
        })
        // Dashboard
        .when('/index.html', {
            templateUrl: 'views/dashboard-view.html',
            controller: 'enterpriseDashboardCtrl',
            cache: false,
            activeTab: 'Dashboard'
        })
        /*// Scans of all users in the Enterprise
        .when('/scansView', {
            templateUrl: 'views/scans-view.html',
            controller: 'scansViewController',
            cache: false,
            activeTab: 'Scans'
        })
        // Admin and User Profile View
        .when('/usersProfileView', {
            templateUrl: 'views/user-profile-view.html',
            controller: 'userProfileViewController',
            cache: false,
            activeTan: 'UserProfile'
        })
        // Tag details that include scans of the tag and tag settings
        .when('/tagView', {
            templateUrl: 'views/tag-view.html',
            controller: 'tagViewController',
            cache: false,
            activeTab: 'Tags'

        })
        //Displays all users in the Enterprise
        .when('/usersView', {
            templateUrl: 'views/users-view.html',
            controller: 'userViewController',
            cache: false,
            activeTab: 'Users'
        })
        //Displays all tags in the Enterprise
        .when('/tagsView', {
            templateUrl: 'views/tags-view.html',
            controller: 'tagsViewController',
            cache: false,
            activeTab: 'Tags'
        })
        .when('/loginpassword', {
            templateUrl: 'views/loginpassword-view.html',
            controller: 'userPasswordController',
            cache: false,
            activeTab: 'Users'
        })*/
        $locationProvider.html5Mode(false);

    }
]);