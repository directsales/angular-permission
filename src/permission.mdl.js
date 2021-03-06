(function () {
  'use strict';

  angular.module('permission', ['ui.router'])
    .run(['$transitions', '$rootScope', 'Permission', '$state', '$q',
    function ($transitions, $rootScope, Permission, $state, $q) {
      var getPermissions = function(state) {
        return state.data && state.data.permissions ? state.data.permissions : null;
      }

      $transitions.onStart({ 
        to: function (state) {
          return getPermissions(state);
        }
      }, 
      function ($transition$, $state) {
        var toState = $transition$.to();
        var permissions = getPermissions(toState);
        var toParams = $transition$.params();

        $rootScope.$broadcast('$stateChangePermissionStart', toState, toParams);
        return Permission.authorize(permissions, toParams)
          .then(function () {
            $rootScope.$broadcast('$stateChangePermissionAccepted', toState, toParams)
          })
          .catch(function (error) {
            $rootScope.$broadcast('$stateChangePermissionDenied', toState, toParams);
            if (permissions.redirectTo) {
              var redirectTo = permissions.redirectTo;
              if (angular.isFunction(redirectTo)) {
                redirectTo = redirectTo();
              }
              return $q.when(permissions.redirectTo, function (redirectState) {
                var targetState = $state.target(redirectState);
                return targetState;
              });
            } else {
              return false;
            }
          })
      })
    }]);
}());