import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin,{
    validations: {
        firstNameValue: {
            presence: true,
            length: { minimum: 5 }
        },
        secondNameValue: {
            presence: true,
            length: { minimum: 5 }
        },
        IBANValue: {
            format: { with: /^([a-zA-Z]|\d)+$/, allowBlank: false, message: 'Must be letters and numbers only'  },
            length: { is: 21}
        }
    },
    firstNameValue: null,
    secondNameValue: null,
    bankSelectValue: null,
    IBANValue: null,
    submitedOnce: false,
    errorMessages: function() {
        if (this.get('submitedOnce')) {
            return this.get('errors');
        }
        else {
            return {};
        }
    }.property('errors','submitedOnce'),


    actions:{
        submit: function() {
            var self = this;
            self.set('submitedOnce',true);
            if (self.get('isValid')) {
                this.store.find('bank', this.get('bankSelectValue')).then( function(bank){
                    var payee = self.store.createRecord('payee',{
                        firstname: self.get('firstNameValue'),
                        secondname: self.get('secondNameValue'),
                        bank: bank,
                        IBAN: self.get('IBANValue')
                    });
                    console.log('...saving');
                    payee.save().then(function(data){
                            self.set('submitedOnce',false);
                            alert('Payee '+data.get('name')+' successfully created!');
                            self.transitionToRoute('payees.payee',data);
                        }
                    );

                });

            }
            return false;
        }
    }
});
