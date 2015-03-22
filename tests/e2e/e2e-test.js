import Ember from "ember";
import { module, test ,equal ,ok } from 'qunit';
import startApp from '../helpers/start-app';

var App;


module('UserStories', {
    beforeEach: function() {
        if (App) {Ember.run(App, App.destroy);}
        App = startApp();
    },
    afterEach: function() {
//        Ember.run(App, App.destroy);
    }
});

/*1) As a customer, I want to be able to view my balance so that I can see how much money I have
 in my account.
 Given a customer opening the web app,
 When they click on Balances
 Then they see their account balance.
 */

test("Account page", function(assert) {
    visit('/').then(function() {
        assert.ok( find('.balance').text().trim().slice(18) === "56 000,00" ,'Balance is 56 000,00');
    });
});

/*
 2) As a customer, I want to be able to create a payee so that I can send money to someone.
 Give a customer opening the web app,
 When they click on Create Payee
 Then they see a form to create a new payee and can enter the Payee name, Bank and IBAN
 */

test("Create payee", function(assert) {
    visit('/');
    click('.payee-new');
    fillIn('#firstname','Mister');
    fillIn('#secondname','Incognito');
    fillIn('#iban','DE12500100000000009890');
    click('.submit a');
    andThen(function(){
            assert.ok(find('.payee-profile').length > 0,'Block Profile exists');
            assert.ok(find('.payee-profile h2').text().trim() === 'Mister Incognito','Name of payee is Mister Incognito');
            assert.ok(find('.payee-profile > div > div.row').eq(1).text().trim() === 'IBAN: DE12500100000000009890','IBAN is IBAN: DE12500100000000009890');
        }
    );
});

/*
 3) As a customer, I want to be able to edit a payee so that I can send money to someone.
 Give a customer opening the web app,
 When they click on Payees
 Then they see a list of payees and they can click on one and edit it.
 */

test("Edit payee", function(assert) {
    visit('/payees');
    click(find('table tr td a').eq(1)).then( function (){
        click(find('.submit a').eq(0)).then( function(){
            assert.equal(find('.submit a').eq(0).text().trim(),'Save payee','First submit link is Save payee');
            fillIn('#firstname','Mister');
            fillIn('#secondname','Incognito');
            fillIn('#iban','DE12500100000000009890');
            click(find('.submit a').eq(0));
            andThen(function(){
                assert.ok(find('.payee-profile').length > 0,'Block Profile exists');
                assert.equal(find('.payee-profile h2').eq(0).text().trim() , 'Mister Incognito','Name of payee is Mister Incognito');
                assert.ok(find('.payee-profile > div > div.row').eq(1).text().trim() === 'IBAN: DE12500100000000009890','IBAN is IBAN: DE12500100000000009890');
            });
        });
    });
});

/*
 4) As a customer, I want to be able to transfer money to a payee, so that I can pay my bills.
 Given a customer opening the web app,
 When they click on Make Payment,
 Then they see a form that allows them to choose a Payee, enter an amount and a date.
 */

test("Make payment", function(assert) {
    var randomAmount = '579.68';
    visit('/payments').then(function(){
        var initialPayments = find('table td:contains("€579,68")').length;
        visit('/payments/new');
        fillIn(('[placeholder="Amount"]'),randomAmount);
        click(find('.submit a').eq(0)).then( function(){
            visit('/payments');
            andThen(function(){
                assert.equal(find('table td:contains("€579,68")').length,initialPayments+1,'Pyements before:'+initialPayments+' Payments after:'+initialPayments+1);
            });
        });
    });

});

/*
 5) As a customer, I want to be able to see a list of transactions so that I can determine what has
 happened on my account.
 Given a customer opening the web app
 When they click on Statement
 Then they see a list of transactions on their account */

test("See payments", function(assert) {
    visit('/payments').then(function(){
        andThen(function(){
            assert.ok(find('table.payments tr').length > 2,'Rows in payments table is more then 2');
        });
    });

});


