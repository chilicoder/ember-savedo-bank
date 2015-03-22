import DS from 'ember-data';

export default DS.Model.extend({
    payee: DS.belongsTo('payee'),
    amount: DS.attr('number'),
    createdAt: DS.attr('date'),
    isFutureTransfer: function (){
        return moment(this.get('createdAt')).diff(moment()) > 0;
    }.property('createdAt')
});
