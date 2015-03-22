import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin,{
    validations: {
        amountValue: {
            presence: true,
            numericality: { allowBlank:false , greaterThan: 0, lessThanOrEqualTo : 100000 },
            inline: EmberValidations.validator(function() {
                var money = parseFloat(this.get('amountValue'));
                if (isNaN(money)) {return;}
                console.log(money,currency(money));
                if (money !== currency(money).value) {
                    return "We can't convert specified value to money.";
                }
            })
        },
        dateValue: EmberValidations.validator(function() {
            var date = this.get('dateValue');
            if (date === null) {return;}
            console.log(moment(date).startOf('day'),moment().startOf('day'));
            if (moment(date).startOf('day') < moment().startOf('day')) {
                return "You can't specify dates in the past";
            }
        })


    },
    payeeValue: null,
    amountValue: null,
    dateValue: null,

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
                var date = self.get('dateValue') || new Date();
                self.store.find('payee', self.get('payeeValue')).then( function(payee){
                    var payment = self.store.createRecord('payment',{
                        payee: payee,
                        amount: self.get('amountValue'),
                        createdAt: date
                    });
                    console.log('...saving');
                    payment.save().then(function(data){
                            self.set('submitedOnce',false);
                            alert('Payment of '+currency(parseFloat(data.get('amount'))).format()+' to '+data.get('payee.name')+' successfully created!');
                            self.set('payeeValue',null);
                            self.set('amountValue',null);
                            self.set('dateValue',null);
                            self.transitionToRoute('payees.payee',data.get('payee'));
                        }
                    );

                });

            }
            return false;
        }
    }
});
