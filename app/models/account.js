import DS from 'ember-data';

export default DS.Model.extend({
    currentBalance: DS.attr(),
    payments: DS.hasMany('payment')
});
