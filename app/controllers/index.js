import Ember from 'ember';

export default Ember.ArrayController.extend({
    paymentsLimit: 10,
    sortProperties: ['createdAt'],
    sortAscending: false,

    contentWatcher: function(){

    }.observes('content'),

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
    }.property('arrangedContent.@each'),


    chartData: function(){
        var balance = this.get('account.currentBalance');
        var dataArray = this.get('arrangedContent').map(function(item){
            balance += item.get('amount');
            return {
                label: moment(item.get('createdAt')).format('ll'),
                data: balance
            };
        }).reverse();
        return {
            labels: dataArray.map(function(item){return item.label;}),
            datasets:[
                {
                    label: "Payments",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: dataArray.map(function(item){return item.data;})
                }
            ]

        };

    }.property('arrangedContent','account.currentBalance')
});
