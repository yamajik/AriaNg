(function () {
    'use strict';

    angular.module('ariaNg').controller('Aria2SettingsController', ['$scope', '$location', '$timeout', 'ariaNgConstants', 'aria2AvailableOptions', 'aria2RpcService', 'utils', function ($scope, $location, $timeout, ariaNgConstants, aria2AvailableOptions, aria2RpcService, utils) {
        var location = $location.path().substring($location.path().lastIndexOf('/') + 1);
        var pendingSaveRequest = {};

        var getAvailableOptions = function (location) {
            if (location == 'basic') {
                return aria2AvailableOptions.basicOptions;
            } else if (location == 'http-ftp-sftp') {
                return aria2AvailableOptions.httpFtpSFtpOptions;
            } else if (location == 'http') {
                return aria2AvailableOptions.httpOptions;
            } else if (location == 'ftp-sftp') {
                return aria2AvailableOptions.ftpSFtpOptions;
            } else if (location == 'bt-metalink') {
                return aria2AvailableOptions.btMetalinkOptions;
            } else if (location == 'bt') {
                return aria2AvailableOptions.btOptions;
            } else if (location == 'metalink') {
                return aria2AvailableOptions.metalinkOptions;
            } else if (location == 'rpc') {
                return aria2AvailableOptions.rpcOptions;
            } else if (location == 'advanced') {
                return aria2AvailableOptions.advancedOptions;
            } else {
                utils.alert('Type is illegal!');
            }
        };

        $scope.optionStatus = {};
        $scope.availableOptions = getAvailableOptions(location);
        $scope.setGlobalOption = function (option, value, lazySave) {
            if (!option || !option.key || option.readonly) {
                return;
            }

            var key = option.key;
            var invoke = function () {
                var data = {};
                data[key] = value;

                $scope.optionStatus[key] = 'saving';

                return aria2RpcService.changeGlobalOption({
                    params: [data],
                    callback: function () {
                        $scope.optionStatus[key] = 'saved';
                    }
                });
            };

            delete $scope.optionStatus[key];

            if (lazySave) {
                if (pendingSaveRequest[key]) {
                    $timeout.cancel(pendingSaveRequest[key]);
                }

                pendingSaveRequest[key] = $timeout(function () {
                    invoke();
                }, ariaNgConstants.lazySaveTimeout);
            } else {
                invoke();
            }
        };

        $scope.loadPromise = (function () {
            return aria2RpcService.getGlobalOption({
                callback: function (result) {
                    $scope.globalOptions = result;
                }
            })
        })();
    }]);
})();