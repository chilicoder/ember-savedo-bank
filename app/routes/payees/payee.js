import Ember from 'ember';

export default Ember.Route.extend({
    model: function(params){
        return Ember.RSVP.hash({
            payee: this.store.find('payee',params.payee_id),
            payments: this.store.find('payment'),
            banks: this.store.find('bank')
        });
    },
    setupController: function(controller, model){
        this._super(controller,model.payee);
        controller.set('banks',model.banks);
        controller.set('bankSelectValue',model.payee.get('bank.id'));
        controller.set('payments', model.payments.filter( function (item){
            return item.get('payee.id') === model.payee.get('id');
        }));
    }
});
