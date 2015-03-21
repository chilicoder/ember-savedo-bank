import Ember from 'ember';

export function helperMoment(params, options) {
    var format = options['format'] || 'llll';
    return new Ember.Handlebars.SafeString(moment(params[0]).format(format) );
}

export default Ember.HTMLBars.makeBoundHelper(helperMoment);
