import Ember from 'ember';

export default Ember.Route.extend({
    model: function(){
        return Ember.RSVP.hash({
            account: this.store.find('account',1),
            payments: this.store.find('payment')
        });
    },
    setupController: function(controller,model) {
        this._super(controller,model.payments);
        controller.set('account',model.account);
    }

});
