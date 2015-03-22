import Ember from 'ember';

export default Ember.ArrayController.extend({
    paymentsLimit: 10,
    sortProperties: ['createdAt'],
    sortAscending: false,

    futurePaymentList: function () {
        var paymentsLimit = this.get('paymentsLimit');
        return this.get('arrangedContent').filter(function(item){
            return item.get('isFutureTransfer');
        }).slice(0,paymentsLimit);
    }.property('content.@each.isFutureTransfer'),

    limitedPaymentList: function() {
        var paymentsLimit = this.get('paymentsLimit');
        return this.get('arrangedContent').filter(function(item){
            return !item.get('isFutureTransfer');
        }).slice(0,paymentsLimit);
    }.property('arrangedContent')
});
