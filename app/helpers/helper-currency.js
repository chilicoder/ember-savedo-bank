import Ember from 'ember';

export function helperCurrency(params/*, hash*/) {
    return new Ember.Handlebars.SafeString(currency(params).format());
}

export default Ember.HTMLBars.makeBoundHelper(helperCurrency);
