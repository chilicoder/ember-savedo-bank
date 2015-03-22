import Ember from 'ember';
import PayeesNew from './new';

export default PayeesNew.extend({
    isEditing:false,
    firstNameValue: Ember.computed.alias('model.firstname'),
    actions: {
        startEditing: function(){
            this.set('isEditing',true);
            return false;
        },
        finishEditing: function(){
            if (this.get('isValid')) {
                var model = this.get('model');
                var self = this;
                self.store.find('bank',self.get('bankSelectValue')).then(function (bank){
//                        model.set('firstname',self.get('firstNameValue'));
                        model.set('secondname',self.get('secondNameValue'));
                        model.set('IBAN',self.get('IBANValue)'));
                        model.set('bank',bank);
                        model.save().then(function(){
                            self.set('isEditing',false);
                        },function(err){
                            alert(err);
                        });

                    }
                );

            }

            return false;
        }
    }
});
