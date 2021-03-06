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
            format: { with: /DE\d{2}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{2}|DE\d{20}/, allowBlank: false, message: 'Only German IBAN allowed'  },
            length: { is: 22}
        }
    },
    firstNameValue: null,
    secondNameValue: null,
    bankSelectValue: null,
    IBANValue: null,
    submitedOnce: false,

    flush: function(){
        this.set('firstNameValue',null);
        this.set('secondNameValue',null);
        this.set('bankSelectValue',null);
        this.set('IBANValue',null);
        this.set('submitedOnce',false);
    },

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
                            self.transitionToRoute('payees.payee',data.get('id'));
                        }
                    );

                });

            }
            return false;
        }
    }
});
