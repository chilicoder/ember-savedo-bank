import IndexController from '../index';

export default IndexController.extend({
    init: function(){
        console.log(this.get('paymentsLimit'));
        this._super();
    },
    sortProperties: ['createdAt'],
    sortAscending: false
});
