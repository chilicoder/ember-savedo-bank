import DS from 'ember-data';

export default DS.Model.extend({
    firstname: DS.attr('string'),
    secondname: DS.attr('string'),
    bank: DS.belongsTo('bank'),
    IBAN: DS.attr('string'),
    name: function () {
        return this.get('firstname')+' '+this.get('secondname');
    }.property('firstname','secondname')
});
