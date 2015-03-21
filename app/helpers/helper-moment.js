import Ember from 'ember';

export function helperMoment(params, hash) {
    var format = 'llll';
    return new Ember.Handlebars.SafeString(moment(params[0]).format(format) );
}

export default Ember.HTMLBars.makeBoundHelper(helperMoment);
