function currencyInitialize(currency) {
    currency.settings.formatWithSymbol = true;
    currency.settings.separator = ' ';
    currency.settings.decimal = ',';
    currency.settings.symbol = '€';
}


export function initialize( container /* , application */ ) {

    currencyInitialize(currency);

    var store = container.lookup('store:main');
    store.pushMany('bank',
        [
            {id: 1, name: 'ING-DiBa' ,BIC: 'INGDDEFFXXX'},
            {id: 2, name: 'Deutsche Bank Privat und Geschaftskunden' ,BIC: 'DEUTDEDBBRE'}
        ]
    );
    store.push('account',
        {
            id: 1,
            currentBalance: 132432465.45,
            payments: [1,2,3,4,5,6,7,8,9,10,11,12]
        }
    );
    store.pushMany('payee',
        [
            {id: 1, firstname: 'John', secondname: 'Doe', bank: 1 ,IBAN: 'DE12500105170648489890'},
            {id: 2, firstname: 'John', secondname: 'Doe2', bank: 2 ,IBAN: 'DE33290700240105668800'}

        ]
    );
    store.pushMany('payment',
        [
            {id: 1,payee: 1, createdAt: "Sat Mar 01 2015 16:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 2,payee: 1, createdAt: "Sat Mar 04 2015 16:17:08 GMT+0100 (CET)", amount: 200 },
            {id: 3,payee: 1, createdAt: "Sat Mar 06 2015 17:16:08 GMT+0100 (CET)", amount: 400 },
            {id: 4,payee: 1, createdAt: "Sat Mar 09 2015 18:46:08 GMT+0100 (CET)", amount: 700 },
            {id: 5,payee: 1, createdAt: "Sat Mar 11 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 6,payee: 1, createdAt: "Sat Mar 12 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 7,payee: 1, createdAt: "Sat Mar 14 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 8,payee: 1, createdAt: "Sat Mar 16 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 9,payee: 1, createdAt: "Sat Mar 19 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 10,payee: 1, createdAt: "Sat Mar 20 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 11,payee: 1, createdAt: "Sat Mar 21 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 12,payee: 1, createdAt: "Sat Mar 23 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 13,payee: 1, createdAt: "Sat Mar 24 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 14,payee: 1, createdAt: "Sat Mar 27 2015 19:16:08 GMT+0100 (CET)", amount: 300 },
            {id: 15,payee: 1, createdAt: "Sat Mar 30 2015 19:16:08 GMT+0100 (CET)", amount: 300 }

        ]
    );
//    store.save();
}

export default {
  name: 'fixture-injector',
  after: ['store'],
  initialize: initialize
};
