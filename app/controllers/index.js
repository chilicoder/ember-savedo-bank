import ApplicationController from '../controllers/application.js';

export default ApplicationController.extend({
    needs:['application'],
    paymentsLimit: 10,
    limitedPaymentList: function() {
        var paymentsLimit = this.get('paymentsLimit');
        return this.get('content.payments').slice(0,paymentsLimit);
    }.property('content.payments')
});
