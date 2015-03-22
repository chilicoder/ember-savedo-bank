import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.hash ({
            banks: this.store.find('bank')
        });
    },
    setupController: function(controller, model){
//        this._super(controller,model.payee);
        controller.set('banks', model.banks);
    }

});
