var accountManager = require('../app/server/modules/account-manager');
var mongoose = require('../app/server/modules/mongoose');
var Fiber = require('fibers');


var TEST_ACCOUNT_NAME = 'TESCT';
var NUMBER_TESTS_ACCOUNTS = 10000;


var testCreateAccounts = function(baseName, numberAccounts) {
    function addAccount(i) {
        var fiber = Fiber.current;
        console.log("adding user = " + baseName + i)
        accountManager.addNewAccount(
            {
                pass: '1234',
                email: 's+' + i + '@u.washington.edu',
                user: baseName + i + '2'
            },
            function(something) {
                console.log(something);
                fiber.run();
            }
        );
        Fiber.yield();
    }

    Fiber(function() {
        for (var i = 0; i < numberAccounts; i++) {
            addAccount(i);
            console.log("Added account " + i.valueOf());
        }
    }).run();
};

testCreateAccounts(TEST_ACCOUNT_NAME, NUMBER_TESTS_ACCOUNTS);