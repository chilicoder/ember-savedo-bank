import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.hash ({
            banks: this.store.find('bank')
        });
    }

});
