(function () {
    'use strict';

    angular
        .module('jhipsterAngularJsApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register ($resource) {
        return $resource('api/register', {}, {});
    }
})();
