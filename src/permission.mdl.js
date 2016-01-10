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
        var permissions = getPermissions(to);
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
              var targetState = $state.target(redirectTo);
              return $transition$.redirect(targetState); 
            } else {
              return false;
            }
          })
      });
    }]);
}());