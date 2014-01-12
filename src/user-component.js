angular.module('dpdUser', ['ngResource']).
  service('dpdUserStore', function () {
    this.set = function (username, id) {
      this.username = username;
      this.id = id;
    };

    this.clear = function () {
      this.username = null;
      this.id = null;
    };
  }).
  controller('UserComponentCtrl',
      ['$rootScope', '$http', 'dpdUserStore',
      function($rootScope, $http, dpdUserStore) {
        var self = this;
        this.user = dpdUserStore;

        this.onGetMe = function (user) {
          if (user.data && user.data.username) {
            dpdUserStore.set(user.data.username, user.data.id);
          }
          else {
            dpdUserStore.clear();
          }
        };

        this.onLogin = function (username, user) {
          dpdUserStore.set(username, user.data.uid);
          $rootScope.$emit('dpdUser.login', {username: username, id: user.data.uid});
          self.loginError = null;
        };

        this.onLoginError = function (res, statusCode) {
          switch (statusCode) {
            case 401:
              self.loginError = 'Invalid username or password.';
              break;
            default:
              self.loginError = 'Unknown error occurred when attemping to log in.';
          }
        };

        this.login = function (username, password) {
          $http.post('/users/login', {username: username, password: password}).
            success(function (user) {
              self.onLogin.call(self, username, user);
            }).
            error(this.onLoginError);
        };

        this.onGetMeError = function () {
          dpdUserStore.clear();
        };

        this.logout = function () {
          $http.get('/users/logout');
          dpdUserStore.clear();
          $rootScope.$emit('dpdUser.logout');
        };

        $http.get('/users/me').then(this.onGetMe, this.onGetMeError);
  }]).
  directive('dpdUserComponent', function() {
    return {
      restrict: 'E',
      controller: 'UserComponentCtrl',
      controllerAs: 'userComponentCtrl',
      scope: {},
      templateUrl: 'user-component.html'
    };
  });
