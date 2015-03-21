import DS from 'ember-data';

export default DS.Model.extend({
    payee: DS.belongsTo('payee'),
    amount: DS.attr('number'),
    createdAt: DS.attr('date', {
        defaultValue: function() { return new Date(); }
    })
});
