/* jshint ignore:start */

/* jshint ignore:end */

define('savedo-bank/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].LSAdapter.extend({
        namespace: "savedo-bank"
    });

});
define('savedo-bank/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'savedo-bank/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('savedo-bank/components/bootstrap-datepicker-inline', ['exports', 'ember', 'ember-cli-bootstrap-datepicker/components/bootstrap-datepicker-inline'], function (exports, Ember, BootstrapDatepickerInlineComponent) {

	'use strict';

	exports['default'] = BootstrapDatepickerInlineComponent['default'];

});
define('savedo-bank/components/bootstrap-datepicker', ['exports', 'ember', 'ember-cli-bootstrap-datepicker/components/bootstrap-datepicker'], function (exports, Ember, BootstrapDatepickerComponent) {

	'use strict';

	exports['default'] = BootstrapDatepickerComponent['default'];

});
define('savedo-bank/components/ember-chart', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Component.extend({
    tagName: "canvas",
    attributeBindings: ["width", "height"],

    renderChart: (function () {
      var context = this.get("element").getContext("2d");
      var data = this.get("data");
      var type = this.get("type").classify();
      var options = Ember['default'].merge({}, this.get("options"));

      var chart = new Chart(context)[type](data, options);

      if (this.get("legend")) {
        var legend = chart.generateLegend();
        this.$().parent().append(legend);
      };

      this.set("chart", chart);
    }).on("didInsertElement"),

    destroyChart: (function () {
      if (this.get("legend")) {
        this.$().parent().children("[class$=legend]").remove();
      };

      this.get("chart").destroy();
    }).on("willDestroyElement"),

    updateChart: (function () {
      try {
        var chart = this.get("chart");
        var data = this.get("data");
        var needUpdate = this.updateChartBasedOnType(data, chart);

        if (needUpdate) {
          chart.update();
        }
      } catch (error) {
        Ember['default'].warn("Dataset is not equal in structure as previous values. Rebuilding chart...");
        console.error(error);
        this.destroyChart();
        this.renderChart();
      }
    }).observes("data", "data.[]", "options"),

    updateChartBasedOnType: function updateChartBasedOnType(data, chart) {
      if (data.datasets) {
        return this.updateLinearCharts(data.datasets, chart);
      };
      if (Array.isArray(data)) {
        return this.updatePieCharts(data, chart);
      };
    },

    updateLinearCharts: function updateLinearCharts(datasets, chart) {
      datasets.forEach(function (dataset, i) {
        dataset.data.forEach(function (item, j) {
          item = item || 0;
          if (typeof chart.datasets[i] === "undefined") {
            chart.segments[j].value = item;
          } else {
            var dataSet = chart.datasets[i];

            if (typeof dataSet.bars !== "undefined") {
              chart.datasets[i].bars[j].value = item;
            } else {
              chart.datasets[i].points[j].value = item;
            }
          }
        });
      });
      return true;
    },

    updatePieCharts: function updatePieCharts(data, chart) {
      var needUpdate = false;
      data.forEach(function (segment, i) {
        if (typeof chart.segments[i] !== "undefined") {
          segment.value = segment.value || 0;
          if (chart.segments[i].value != segment.value) {
            chart.segments[i].value = segment.value;
            needUpdate = true;
          }
        } else {
          // there are now more segments than the chart knows about; add them
          chart.addData(segment, i, true);
          needUpdate = true;
        }
      });
      return needUpdate;
    }
  });

});
define('savedo-bank/controllers/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('savedo-bank/controllers/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].ArrayController.extend({
        paymentsLimit: 10,
        sortProperties: ["createdAt"],
        sortAscending: false,

        contentWatcher: (function () {}).observes("content"),

        futurePaymentList: (function () {
            var paymentsLimit = this.get("paymentsLimit");
            return this.get("arrangedContent").filter(function (item) {
                return item.get("isFutureTransfer");
            }).slice(0, paymentsLimit);
        }).property("content.@each.isFutureTransfer"),

        limitedPaymentList: (function () {
            var paymentsLimit = this.get("paymentsLimit");
            return this.get("arrangedContent").filter(function (item) {
                return !item.get("isFutureTransfer");
            }).slice(0, paymentsLimit);
        }).property("arrangedContent.@each"),

        chartData: (function () {
            var balance = this.get("account.currentBalance");
            var dataArray = this.get("arrangedContent").map(function (item) {
                console.log(moment(item.get("createdAt")));
                balance += item.get("amount");
                return {
                    label: moment(item.get("createdAt")).format("ll"),
                    data: balance
                };
            }).reverse();
            console.log("dataArray", dataArray);

            return {
                labels: dataArray.map(function (item) {
                    return item.label;
                }),
                datasets: [{
                    label: "Payments",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: dataArray.map(function (item) {
                        return item.data;
                    })
                }]

            };
        }).property("arrangedContent", "account.currentBalance")
    });

});
define('savedo-bank/controllers/payees/new', ['exports', 'ember', 'ember-validations'], function (exports, Ember, EmberValidations) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend(EmberValidations['default'].Mixin, {
        validations: {
            firstNameValue: {
                presence: true,
                length: { minimum: 5 }
            },
            secondNameValue: {
                presence: true,
                length: { minimum: 5 }
            },
            IBANValue: {
                format: { "with": /DE\d{2}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{4}[ ]\d{2}|DE\d{20}/, allowBlank: false, message: "Only German IBAN allowed" },
                length: { is: 22 }
            }
        },
        firstNameValue: null,
        secondNameValue: null,
        bankSelectValue: null,
        IBANValue: null,
        submitedOnce: false,

        flush: function flush() {
            this.set("firstNameValue", null);
            this.set("secondNameValue", null);
            this.set("bankSelectValue", null);
            this.set("IBANValue", null);
            this.set("submitedOnce", false);
        },

        errorMessages: (function () {
            if (this.get("submitedOnce")) {
                return this.get("errors");
            } else {
                return {};
            }
        }).property("errors", "submitedOnce"),

        actions: {
            submit: function submit() {
                var self = this;
                self.set("submitedOnce", true);
                if (self.get("isValid")) {
                    this.store.find("bank", this.get("bankSelectValue")).then(function (bank) {
                        var payee = self.store.createRecord("payee", {
                            firstname: self.get("firstNameValue"),
                            secondname: self.get("secondNameValue"),
                            bank: bank,
                            IBAN: self.get("IBANValue")
                        });
                        console.log("...saving");
                        payee.save().then(function (data) {
                            self.set("submitedOnce", false);
                            self.transitionToRoute("payees.payee", data.get("id"));
                        });
                    });
                }
                return false;
            }
        }
    });

});
define('savedo-bank/controllers/payees/payee', ['exports', 'ember', 'savedo-bank/controllers/payees/new'], function (exports, Ember, PayeesNew) {

    'use strict';

    exports['default'] = PayeesNew['default'].extend({
        isEditing: false,
        submitedOnce: true,
        firstNameValue: Ember['default'].computed.alias("model.firstname"),
        secondNameValue: Ember['default'].computed.alias("model.secondname"),
        IBANValue: Ember['default'].computed.alias("model.IBAN"),
        //    bankSelectValue: Ember.computed.alias('model.bank.id'),
        bankSelectValueChanged: (function () {
            var model = this.get("model");
            console.log("bankSelectValue", this.get("bankSelectValue"));
            var self = this;
            self.store.find("bank", self.get("bankSelectValue")).then(function (bank) {
                console.log("bank", bank);
                if (bank) {
                    model.set("bank", bank);
                }
            });
        }).observes("bankSelectValue"),

        actions: {
            startEditing: function startEditing() {
                this.set("isEditing", true);
                return false;
            },
            finishEditing: function finishEditing() {
                if (this.get("isValid")) {
                    var model = this.get("model");
                    var self = this;
                    //                self.store.find('bank',self.get('bankSelectValue')).then(function (bank){
                    //                        model.set('firstname',self.get('firstNameValue'));
                    //                        model.set('secondname',self.get('secondNameValue'));
                    //                        model.set('IBAN',self.get('IBANValue)'));
                    //                        model.set('bank',bank);
                    model.save().then(function () {
                        self.set("isEditing", false);
                    }, function (err) {
                        alert(err);
                    });

                    //                    }
                    //                );
                }

                return false;
            }
        }
    });

});
define('savedo-bank/controllers/payments/index', ['exports', 'savedo-bank/controllers/index'], function (exports, IndexController) {

    'use strict';

    exports['default'] = IndexController['default'].extend({
        sortProperties: ["createdAt"],
        sortAscending: false
    });

});
define('savedo-bank/controllers/payments/new', ['exports', 'ember', 'ember-validations'], function (exports, Ember, EmberValidations) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend(EmberValidations['default'].Mixin, {
        validations: {
            amountValue: {
                presence: true,
                numericality: { allowBlank: false, greaterThan: 0, lessThanOrEqualTo: 100000 },
                inline: EmberValidations['default'].validator(function () {
                    var money = parseFloat(this.get("amountValue"));
                    if (isNaN(money)) {
                        return;
                    }
                    console.log(money, currency(money));
                    if (money !== currency(money).value) {
                        return "We can't convert specified value to money.";
                    }
                })
            },
            dateValue: EmberValidations['default'].validator(function () {
                var date = this.get("dateValue");
                if (date === null) {
                    return;
                }
                console.log(moment(date).startOf("day"), moment().startOf("day"));
                if (moment(date).startOf("day") < moment().startOf("day")) {
                    return "You can't specify dates in the past";
                }
            })

        },
        payeeValue: null,

        amountValue: null,

        dateValue: null,

        submitedOnce: false,

        errorMessages: (function () {
            if (this.get("submitedOnce")) {
                return this.get("errors");
            } else {
                return {};
            }
        }).property("errors", "submitedOnce"),

        actions: {
            submit: function submit() {
                var self = this;
                self.set("submitedOnce", true);
                if (self.get("isValid")) {
                    var date = moment(self.get("dateValue") || new Date());
                    self.store.find("payee", self.get("payeeValue")).then(function (payee) {
                        var payment = self.store.createRecord("payment", {
                            payee: payee,
                            amount: self.get("amountValue"),
                            createdAt: date.toDate()
                        });
                        console.log("...saving");
                        payment.save().then(function (data) {
                            self.set("submitedOnce", false);
                            self.set("payeeValue", null);
                            self.set("amountValue", null);
                            self.set("dateValue", null);
                            self.transitionToRoute("payees.payee", data.get("payee.id"));
                        });
                    });
                }
                return false;
            }
        }
    });

});
define('savedo-bank/helpers/helper-currency', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.helperCurrency = helperCurrency;

    function helperCurrency(params /*, hash*/) {
        return new Ember['default'].Handlebars.SafeString(currency(params).format());
    }

    exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(helperCurrency);

});
define('savedo-bank/helpers/helper-moment', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.helperMoment = helperMoment;

    function helperMoment(params, options) {
        var format = options.format || "llll";
        return new Ember['default'].Handlebars.SafeString(moment(params[0]).format(format));
    }

    exports['default'] = Ember['default'].HTMLBars.makeBoundHelper(helperMoment);

});
define('savedo-bank/initializers/app-version', ['exports', 'savedo-bank/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('savedo-bank/initializers/ember-currency', ['exports'], function (exports) {

  'use strict';

  var initialize = function initialize() {};

  exports['default'] = {
    name: "ember-currency",
    initialize: initialize
  };
  /* container, app */

  exports.initialize = initialize;

});
define('savedo-bank/initializers/export-application-global', ['exports', 'ember', 'savedo-bank/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('savedo-bank/initializers/fixture-injector', ['exports'], function (exports) {

    'use strict';

    exports.initialize = initialize;

    function currencyInitialize(currency) {
        currency.settings.formatWithSymbol = true;
        currency.settings.separator = " ";
        currency.settings.decimal = ",";
        currency.settings.symbol = "€";
    }
    function initialize(container /* , application */) {

        currencyInitialize(currency);

        var store = container.lookup("store:main");
        store.pushMany("bank", [{ id: 1, name: "ING-DiBa", BIC: "INGDDEFFXXX" }, { id: 2, name: "Deutsche Bank Privat und Geschaftskunden", BIC: "DEUTDEDBBRE" }]);
        store.push("account", {
            id: 1,
            currentBalance: 56000,
            payments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        });
        store.pushMany("payee", [{ id: 1, firstname: "John", secondname: "Doe", bank: 1, IBAN: "DE12500105170648489890" }, { id: 2, firstname: "John", secondname: "Doe2", bank: 2, IBAN: "DE33290700240105668800" }]);
        store.pushMany("payment", [{ id: 1, payee: 1, createdAt: "Sat Mar 01 2015 16:16:08 GMT+0100 (CET)", amount: 300 }, { id: 2, payee: 1, createdAt: "Sat Mar 04 2015 16:17:08 GMT+0100 (CET)", amount: 200 }, { id: 3, payee: 1, createdAt: "Sat Mar 06 2015 17:16:08 GMT+0100 (CET)", amount: 400 }, { id: 4, payee: 2, createdAt: "Sat Mar 09 2015 18:46:08 GMT+0100 (CET)", amount: 700 }, { id: 5, payee: 1, createdAt: "Sat Mar 11 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 6, payee: 1, createdAt: "Sat Mar 12 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 7, payee: 2, createdAt: "Sat Mar 14 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 8, payee: 1, createdAt: "Sat Mar 16 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 9, payee: 2, createdAt: "Sat Mar 19 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 10, payee: 1, createdAt: "Sat Mar 20 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 11, payee: 1, createdAt: "Sat Mar 21 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 12, payee: 2, createdAt: "Sat Mar 23 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 13, payee: 1, createdAt: "Sat Mar 24 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 14, payee: 1, createdAt: "Sat Mar 27 2015 19:16:08 GMT+0100 (CET)", amount: 300 }, { id: 15, payee: 1, createdAt: "Sat Mar 30 2015 19:16:08 GMT+0100 (CET)", amount: 300 }]);
        //    store.save();
    }

    exports['default'] = {
        name: "fixture-injector",
        after: ["store"],
        initialize: initialize
    };

});
define('savedo-bank/models/account', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        currentBalance: DS['default'].attr(),
        payments: DS['default'].hasMany("payment")
    });

});
define('savedo-bank/models/bank', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        name: DS['default'].attr("string"),
        BIC: DS['default'].attr("string")
    });

});
define('savedo-bank/models/payee', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        firstname: DS['default'].attr("string"),
        secondname: DS['default'].attr("string"),
        bank: DS['default'].belongsTo("bank"),
        IBAN: DS['default'].attr("string"),
        name: (function () {
            return this.get("firstname") + " " + this.get("secondname");
        }).property("firstname", "secondname")
    });

});
define('savedo-bank/models/payment', ['exports', 'ember-data'], function (exports, DS) {

    'use strict';

    exports['default'] = DS['default'].Model.extend({
        payee: DS['default'].belongsTo("payee"),
        amount: DS['default'].attr("number"),
        createdAt: DS['default'].attr("date"),
        isFutureTransfer: (function () {
            return moment(this.get("createdAt")).diff(moment()) > 0;
        }).property("createdAt")
    });

});
define('savedo-bank/router', ['exports', 'ember', 'savedo-bank/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.resource("payees", function () {
      this.route("new");
      this.resource("payees.payee", { path: "/:payee_id" });
    });
    this.resource("payments", function () {
      this.route("new");
    });
  });

  exports['default'] = Router;

});
define('savedo-bank/routes/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return Ember['default'].RSVP.hash({
                account: this.store.find("account", 1),
                payments: this.store.find("payment")
            });
        },
        setupController: function setupController(controller, model) {
            this._super(controller, model.payments);
            controller.set("account", model.account);
        }

    });

});
define('savedo-bank/routes/payees', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('savedo-bank/routes/payees/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find("payee");
        }
    });

});
define('savedo-bank/routes/payees/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return Ember['default'].RSVP.hash({
                banks: this.store.find("bank")
            });
        },
        setupController: function setupController(controller, model) {
            //        this._super(controller,model.payee);
            controller.set("banks", model.banks);
        },
        actions: {
            willTransition: function willTransition(transition) {
                console.log("DATAA!", transition);
                this.get("controller").flush();
            }
        }
    });

});
define('savedo-bank/routes/payees/payee', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            return Ember['default'].RSVP.hash({
                payee: this.store.find("payee", params.payee_id),
                payments: this.store.find("payment"),
                banks: this.store.find("bank")
            });
        },
        setupController: function setupController(controller, model) {
            this._super(controller, model.payee);
            controller.set("banks", model.banks);
            controller.set("bankSelectValue", model.payee.get("bank.id"));
            controller.set("payments", model.payments.filter(function (item) {
                return item.get("payee.id") === model.payee.get("id");
            }));
        }
    });

});
define('savedo-bank/routes/payments', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('savedo-bank/routes/payments/index', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find("payment");
        }
    });

});
define('savedo-bank/routes/payments/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return this.store.find("payee");
        },
        willTransition: function willTransition() {
            this.controller.set("submitedOnce", false);
        }
    });

});
define('savedo-bank/serializers/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].LSSerializer.extend({});

});
define('savedo-bank/services/validations', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  var set = Ember['default'].set;

  exports['default'] = Ember['default'].Object.extend({
    init: function init() {
      set(this, "cache", {});
    }
  });

});
define('savedo-bank/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("img");
          dom.setAttribute(el2,"class","logo");
          dom.setAttribute(el2,"src","Savedo-logo.png");
          dom.setAttribute(el2,"alt","Logo png");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","title");
          var el3 = dom.createTextNode("Savedo Bank");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                    ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Account");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Payees");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Payments");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("nav");
        dom.setAttribute(el1,"class","navbar navbar-default");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","container");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Brand and toggle get grouped for better mobile display ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createTextNode("\n");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","nav navbar-nav navbar-right");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","container");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [5]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [1]),-1,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [3]),-1,-1);
        var morph3 = dom.createMorphAt(dom.childAt(element1, [5]),-1,-1);
        var morph4 = dom.createMorphAt(dom.childAt(fragment, [2]),0,1);
        block(env, morph0, context, "link-to", ["index"], {"class": "navbar-brand"}, child0, null);
        block(env, morph1, context, "link-to", ["index"], {"class": "btn btn-link"}, child1, null);
        block(env, morph2, context, "link-to", ["payees"], {"class": "btn btn-link"}, child2, null);
        block(env, morph3, context, "link-to", ["payments"], {"class": "btn btn-link"}, child3, null);
        content(env, morph4, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Make payment");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Add Payee");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("will transfer ");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("transfered");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("li");
            var el2 = dom.createTextNode(" On ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("span");
            dom.setAttribute(el2,"class","hidden-xs");
            var el3 = dom.createTextNode(" you ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" ");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode(" to ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element2 = dom.childAt(fragment, [1]);
            var element3 = dom.childAt(element2, [1]);
            var morph0 = dom.createMorphAt(element3,-1,0);
            var morph1 = dom.createMorphAt(dom.childAt(element2, [3]),0,1);
            var morph2 = dom.createMorphAt(element2,4,5);
            var morph3 = dom.createMorphAt(element2,5,-1);
            element(env, element3, context, "bind-attr", [], {"class": "item.isFutureTransfer:future"});
            inline(env, morph0, context, "helper-moment", [get(env, context, "item.createdAt")], {"format": "ll"});
            block(env, morph1, context, "if", [get(env, context, "item.isFutureTransfer")], {}, child0, child1);
            inline(env, morph2, context, "helper-currency", [get(env, context, "item.amount")], {});
            content(env, morph3, context, "item.payee.name");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("Future payments:");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("ul");
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),0,1);
          block(env, morph0, context, "each", [get(env, context, "futurePaymentList")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("will transfer ");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("transfered");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"class","hidden-xs");
            var el3 = dom.createTextNode(" you ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1]);
            var morph0 = dom.createMorphAt(element1,-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
            var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
            var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),-1,-1);
            element(env, element1, context, "bind-attr", [], {"class": "item.isFutureTransfer:future"});
            inline(env, morph0, context, "helper-moment", [get(env, context, "item.createdAt")], {"format": "ll"});
            block(env, morph1, context, "if", [get(env, context, "item.isFutureTransfer")], {}, child0, child1);
            inline(env, morph2, context, "helper-currency", [get(env, context, "item.amount")], {});
            content(env, morph3, context, "item.payee.name");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("Last payments:");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("table");
          dom.setAttribute(el1,"class","table table-striped payments");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("tr");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Time");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          dom.setAttribute(el3,"class","hidden-xs");
          var el4 = dom.createTextNode("Action");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Amount");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Payee");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [3]),2,3);
          block(env, morph0, context, "each", [get(env, context, "limitedPaymentList")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    var child4 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("You dont' have payments yet");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child5 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("To all payments");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row overview");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        dom.setAttribute(el3,"id","title");
        var el4 = dom.createTextNode("Welcome to Savedo Bank Account");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-7");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","balance");
        var el4 = dom.createTextNode("\n            Current Balance: ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","graph hidden-xs");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("Choose your action:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-xs-5 col-sm-3");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-xs-4 col-xs-offset-1 col-sm-3");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-5 payments");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element4 = dom.childAt(fragment, [0]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element5, [7]);
        var element7 = dom.childAt(element4, [5]);
        if (this.cachedFragment) { dom.repairClonedNode(element7,[1]); }
        var morph0 = dom.createMorphAt(dom.childAt(element5, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element5, [3]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element6, [1]),0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element6, [3]),0,1);
        var morph4 = dom.createMorphAt(element7,0,1);
        var morph5 = dom.createMorphAt(element7,1,2);
        var morph6 = dom.createMorphAt(element7,2,3);
        var morph7 = dom.createMorphAt(fragment,1,2,contextualElement);
        inline(env, morph0, context, "helper-currency", [get(env, context, "account.currentBalance")], {});
        inline(env, morph1, context, "ember-chart", [], {"type": "Line", "data": get(env, context, "chartData"), "height": 300, "width": 500});
        block(env, morph2, context, "link-to", ["payments.new"], {"class": "btn btn-lg btn-primary"}, child0, null);
        block(env, morph3, context, "link-to", ["payees.new"], {"class": "btn btn-lg btn-link payee-new"}, child1, null);
        block(env, morph4, context, "if", [get(env, context, "futurePaymentList")], {}, child2, null);
        block(env, morph5, context, "if", [get(env, context, "limitedPaymentList")], {}, child3, child4);
        block(env, morph6, context, "link-to", ["payments"], {"class": "btn btn-link"}, child5, null);
        content(env, morph7, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payees', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payees/edit-payee', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "errorMessages.firstNameValue");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "errorMessages.secondNameValue");
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "errorMessages.IBANValue");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode("Specify payee's information");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("form");
        dom.setAttribute(el1,"class","form-horizontal");
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","firstname");
        dom.setAttribute(el3,"class","col-sm-3 control-label");
        var el4 = dom.createTextNode("Specify first name");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-9");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","error-message");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","secondname");
        dom.setAttribute(el3,"class","col-sm-3 control-label");
        var el4 = dom.createTextNode("Specify second name");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-9");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","error-message");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","form-group");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","bank");
        dom.setAttribute(el3,"class","col-sm-3 control-label");
        var el4 = dom.createTextNode("Choose bank");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-9");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("label");
        dom.setAttribute(el3,"for","iban");
        dom.setAttribute(el3,"class","col-sm-3 control-label");
        var el4 = dom.createTextNode("Specify IBAN");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","col-sm-9");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","error-message");
        var el5 = dom.createTextNode("\n");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2]);
        var element1 = dom.childAt(element0, [1]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element0, [3]);
        var element4 = dom.childAt(element3, [3]);
        var element5 = dom.childAt(element0, [7]);
        var element6 = dom.childAt(element5, [3]);
        var morph0 = dom.createMorphAt(element2,0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [2]),0,1);
        var morph2 = dom.createMorphAt(element4,0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element4, [2]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element0, [5, 3]),0,1);
        var morph5 = dom.createMorphAt(element6,0,1);
        var morph6 = dom.createMorphAt(dom.childAt(element6, [2]),0,1);
        element(env, element1, context, "bind-attr", [], {"class": ":form-group errorMessages.firstNameValue:has-error"});
        inline(env, morph0, context, "input", [], {"placeholder": "Name", "id": "firstname", "value": get(env, context, "firstNameValue"), "class": "form-control", "tabindex": "1"});
        block(env, morph1, context, "if", [get(env, context, "errorMessages.firstNameValue")], {}, child0, null);
        element(env, element3, context, "bind-attr", [], {"class": ":form-group errorMessages.secondNameValue:has-error"});
        inline(env, morph2, context, "input", [], {"placeholder": "Surname", "id": "secondname", "value": get(env, context, "secondNameValue"), "class": "form-control", "tabindex": "2"});
        block(env, morph3, context, "if", [get(env, context, "errorMessages.secondNameValue")], {}, child1, null);
        inline(env, morph4, context, "view", ["select"], {"id": "bank", "content": get(env, context, "banks"), "optionValuePath": "content.id", "class": "form-control", "optionLabelPath": "content.name", "value": get(env, context, "bankSelectValue"), "tabindex": "3"});
        element(env, element5, context, "bind-attr", [], {"class": ":form-group errorMessages.IBANValue:has-error"});
        inline(env, morph5, context, "input", [], {"placeholder": "IBAN", "id": "iban", "value": get(env, context, "IBANValue"), "class": "form-control", "tabindex": "4"});
        block(env, morph6, context, "if", [get(env, context, "errorMessages.IBANValue")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payees/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode("");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              if (this.cachedFragment) { dom.repairClonedNode(fragment,[1]); }
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              content(env, morph0, context, "item.name");
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"class","hidden-xs");
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
            var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),0,1);
            element(env, element0, context, "bind-attr", [], {"class": "item.isFutureTransfer:warning:success"});
            block(env, morph0, context, "link-to", ["payees.payee", get(env, context, "item.id")], {}, child0, null);
            content(env, morph1, context, "item.bank.name");
            content(env, morph2, context, "item.IBAN");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("table");
          dom.setAttribute(el1,"class","table table-striped");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("tr");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Name");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Bank");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          dom.setAttribute(el3,"class","hidden-xs");
          var el4 = dom.createTextNode("IBAN");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),2,3);
          block(env, morph0, context, "each", [get(env, context, "arrangedContent")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("You dont'have Payees yet");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("New Payee");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h3");
        var el4 = dom.createTextNode("Payees:");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","submit");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element1 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(element1,2,3);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [4]),0,1);
        block(env, morph0, context, "if", [get(env, context, "model.content")], {}, child0, child1);
        block(env, morph1, context, "link-to", ["payees.new"], {"class": "btn btn-lg btn-primary"}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payees/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createTextNode("To the payee page");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createTextNode("To the account overview");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h2");
          var el2 = dom.createTextNode("Payee ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" successfully created!");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
          var morph1 = dom.createMorphAt(fragment,2,3,contextualElement);
          var morph2 = dom.createMorphAt(fragment,3,4,contextualElement);
          content(env, morph0, context, "submitedSuccessfully.name");
          block(env, morph1, context, "link-to", ["payees.payee", get(env, context, "submitedSuccessfully.id")], {}, child0, null);
          block(env, morph2, context, "link-to", ["index"], {}, child1, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h2");
          var el2 = dom.createTextNode("Add a new Payee:");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","submit");
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn btn-lg btn-primary");
          dom.setAttribute(el2,"tabindex","5");
          var el3 = dom.createTextNode("Create new payee");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [4, 1]);
          var morph0 = dom.createMorphAt(fragment,2,3,contextualElement);
          inline(env, morph0, context, "partial", ["payees/edit-payee"], {});
          element(env, element0, context, "action", ["submit"], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","row");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        block(env, morph0, context, "if", [get(env, context, "submitedSuccessfully")], {}, child0, child1);
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payees/payee', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","submit");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn btn-lg btn-primary");
          var el3 = dom.createTextNode("Save payee");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, inline = hooks.inline, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element1 = dom.childAt(fragment, [2, 1]);
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "partial", ["payees/edit-payee"], {});
          element(env, element1, context, "action", ["finishEditing"], {});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","submit");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("a");
          dom.setAttribute(el2,"class","btn btn-lg btn-primary");
          var el3 = dom.createTextNode("Edit payee");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1, 1]);
          element(env, element0, context, "action", ["startEditing"], {});
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          inline(env, morph0, context, "render", ["payments.index", get(env, context, "payments")], {});
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row payee-profile");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-xs-12");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        var el6 = dom.createTextNode("Bank: ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","row");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","col-xs-12");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h5");
        var el6 = dom.createTextNode("IBAN: ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[2]); }
        var element2 = dom.childAt(fragment, [0, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [3, 1, 1]),0,-1);
        var morph2 = dom.createMorphAt(dom.childAt(element2, [5, 1, 1]),0,-1);
        var morph3 = dom.createMorphAt(element2,6,7);
        var morph4 = dom.createMorphAt(fragment,1,2,contextualElement);
        content(env, morph0, context, "model.name");
        content(env, morph1, context, "model.bank.name");
        content(env, morph2, context, "model.IBAN");
        block(env, morph3, context, "if", [get(env, context, "isEditing")], {}, child0, child1);
        block(env, morph4, context, "unless", [get(env, context, "isEditing")], {}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payments', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payments/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("will transfer ");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        var child1 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createTextNode("transfered");
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              dom.detectNamespace(contextualElement);
              var fragment;
              if (env.useFragmentCache && dom.canClone) {
                if (this.cachedFragment === null) {
                  fragment = this.build(dom);
                  if (this.hasRendered) {
                    this.cachedFragment = fragment;
                  } else {
                    this.hasRendered = true;
                  }
                }
                if (this.cachedFragment) {
                  fragment = dom.cloneNode(this.cachedFragment, true);
                }
              } else {
                fragment = this.build(dom);
              }
              return fragment;
            }
          };
        }());
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("tr");
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.setAttribute(el2,"class","hidden-xs");
            var el3 = dom.createTextNode(" you ");
            dom.appendChild(el2, el3);
            var el3 = dom.createTextNode(" ");
            dom.appendChild(el2, el3);
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                        ");
            dom.appendChild(el1, el2);
            var el2 = dom.createElement("td");
            dom.appendChild(el1, el2);
            var el2 = dom.createTextNode("\n                    ");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, get = hooks.get, inline = hooks.inline, block = hooks.block, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(element0, [1]);
            var morph0 = dom.createMorphAt(element1,-1,-1);
            var morph1 = dom.createMorphAt(dom.childAt(element0, [3]),0,1);
            var morph2 = dom.createMorphAt(dom.childAt(element0, [5]),-1,-1);
            var morph3 = dom.createMorphAt(dom.childAt(element0, [7]),-1,-1);
            element(env, element1, context, "bind-attr", [], {"class": "item.isFutureTransfer:future"});
            inline(env, morph0, context, "helper-moment", [get(env, context, "item.createdAt")], {"format": "ll"});
            block(env, morph1, context, "if", [get(env, context, "item.isFutureTransfer")], {}, child0, child1);
            inline(env, morph2, context, "helper-currency", [get(env, context, "item.amount")], {});
            content(env, morph3, context, "item.payee.name");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("table");
          dom.setAttribute(el1,"class","table table-striped payments");
          var el2 = dom.createTextNode("\n                ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("tr");
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Time");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          dom.setAttribute(el3,"class","hidden-xs");
          var el4 = dom.createTextNode("Action");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Amount");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                    ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("th");
          var el4 = dom.createTextNode("Payee");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("            ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),2,3);
          block(env, morph0, context, "each", [get(env, context, "arrangedContent")], {"keyword": "item"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("h3");
          var el2 = dom.createTextNode("You dont' have payments yet");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("Make new");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","row");
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12");
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("h3");
        var el3 = dom.createTextNode("Your Payments:");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","submit");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element2 = dom.childAt(fragment, [1]);
        var morph0 = dom.createMorphAt(element2,2,3);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [4]),0,1);
        block(env, morph0, context, "if", [get(env, context, "arrangedContent")], {}, child0, child1);
        block(env, morph1, context, "link-to", ["payments.new"], {"class": "btn btn-lg btn-primary"}, child2, null);
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/templates/payments/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("To overview");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode("To payments");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                            ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "errorMessages.amountValue");
          return fragment;
        }
      };
    }());
    var child3 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                                ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "errorMessages.dateValue");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Make a payment");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("h2");
        var el4 = dom.createTextNode("Specify payment information");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("form");
        dom.setAttribute(el3,"class","form-horizontal");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","form-group");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","payee");
        dom.setAttribute(el5,"class","col-sm-3 control-label");
        var el6 = dom.createTextNode("Choose payee");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col-sm-9");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","amount");
        dom.setAttribute(el5,"class","col-sm-3 control-label");
        var el6 = dom.createTextNode("Specify amount");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col-sm-9");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","error-message");
        var el7 = dom.createTextNode("\n");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("label");
        dom.setAttribute(el5,"for","amount");
        dom.setAttribute(el5,"class","col-sm-3 control-label");
        var el6 = dom.createTextNode("Specify date, for delay payment");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","col-sm-9");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","error-message");
        var el8 = dom.createTextNode("\n");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","submit");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("a");
        dom.setAttribute(el5,"class","btn btn-lg btn-primary");
        dom.setAttribute(el5,"tabindex","4");
        var el6 = dom.createTextNode("Create payment");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0, 1]);
        var element1 = dom.childAt(element0, [7]);
        var element2 = dom.childAt(element1, [3]);
        var element3 = dom.childAt(element2, [3]);
        var element4 = dom.childAt(element1, [5]);
        var element5 = dom.childAt(element4, [3]);
        var element6 = dom.childAt(element1, [7, 1]);
        var morph0 = dom.createMorphAt(element0,2,3);
        var morph1 = dom.createMorphAt(element0,3,4);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [1, 3]),0,1);
        var morph3 = dom.createMorphAt(element3,0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [2]),0,1);
        var morph5 = dom.createMorphAt(element5,0,1);
        var morph6 = dom.createMorphAt(dom.childAt(element5, [2, 1]),0,1);
        block(env, morph0, context, "link-to", ["index"], {}, child0, null);
        block(env, morph1, context, "link-to", ["payments.index"], {}, child1, null);
        inline(env, morph2, context, "view", ["select"], {"id": "payee", "class": "form-control", "content": get(env, context, "model"), "optionValuePath": "content.id", "optionLabelPath": "content.name", "value": get(env, context, "payeeValue"), "tabindex": "1"});
        element(env, element2, context, "bind-attr", [], {"class": ":form-group errorMessages.amountValue:has-error"});
        inline(env, morph3, context, "input", [], {"placeholder": "Amount", "value": get(env, context, "amountValue"), "class": "form-control", "tabindex": "2"});
        block(env, morph4, context, "if", [get(env, context, "errorMessages.amountValue")], {}, child2, null);
        element(env, element4, context, "bind-attr", [], {"class": ":form-group errorMessages.dateValue:has-error"});
        inline(env, morph5, context, "bootstrap-datepicker", [], {"value": get(env, context, "dateValue"), "todayHighlight": true, "autoclose": true, "class": "form-control", "tabindex": "3"});
        block(env, morph6, context, "if", [get(env, context, "errorMessages.dateValue")], {}, child3, null);
        element(env, element6, context, "action", ["submit"], {});
        return fragment;
      }
    };
  }()));

});
define('savedo-bank/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/index.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/index.js should pass jshint', function() { 
    ok(true, 'controllers/index.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/payees/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/payees');
  test('controllers/payees/new.js should pass jshint', function() { 
    ok(true, 'controllers/payees/new.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/payees/payee.jshint', function () {

  'use strict';

  module('JSHint - controllers/payees');
  test('controllers/payees/payee.js should pass jshint', function() { 
    ok(true, 'controllers/payees/payee.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/payments/index.jshint', function () {

  'use strict';

  module('JSHint - controllers/payments');
  test('controllers/payments/index.js should pass jshint', function() { 
    ok(true, 'controllers/payments/index.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/controllers/payments/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/payments');
  test('controllers/payments/new.js should pass jshint', function() { 
    ok(true, 'controllers/payments/new.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/helpers/helper-currency.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/helper-currency.js should pass jshint', function() { 
    ok(true, 'helpers/helper-currency.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/helpers/helper-moment.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/helper-moment.js should pass jshint', function() { 
    ok(true, 'helpers/helper-moment.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/helpers/resolver', ['exports', 'ember/resolver', 'savedo-bank/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('savedo-bank/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/helpers/start-app', ['exports', 'ember', 'savedo-bank/app', 'savedo-bank/router', 'savedo-bank/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('savedo-bank/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/initializers/fixture-injector.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/fixture-injector.js should pass jshint', function() { 
    ok(true, 'initializers/fixture-injector.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/models/account.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/account.js should pass jshint', function() { 
    ok(true, 'models/account.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/models/bank.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/bank.js should pass jshint', function() { 
    ok(true, 'models/bank.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/models/payee.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/payee.js should pass jshint', function() { 
    ok(true, 'models/payee.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/models/payment.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/payment.js should pass jshint', function() { 
    ok(true, 'models/payment.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/index.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/index.js should pass jshint', function() { 
    ok(true, 'routes/index.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payees.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/payees.js should pass jshint', function() { 
    ok(true, 'routes/payees.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payees/index.jshint', function () {

  'use strict';

  module('JSHint - routes/payees');
  test('routes/payees/index.js should pass jshint', function() { 
    ok(true, 'routes/payees/index.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payees/new.jshint', function () {

  'use strict';

  module('JSHint - routes/payees');
  test('routes/payees/new.js should pass jshint', function() { 
    ok(true, 'routes/payees/new.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payees/payee.jshint', function () {

  'use strict';

  module('JSHint - routes/payees');
  test('routes/payees/payee.js should pass jshint', function() { 
    ok(true, 'routes/payees/payee.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payments.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/payments.js should pass jshint', function() { 
    ok(true, 'routes/payments.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payments/index.jshint', function () {

  'use strict';

  module('JSHint - routes/payments');
  test('routes/payments/index.js should pass jshint', function() { 
    ok(true, 'routes/payments/index.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/routes/payments/new.jshint', function () {

  'use strict';

  module('JSHint - routes/payments');
  test('routes/payments/new.js should pass jshint', function() { 
    ok(true, 'routes/payments/new.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/serializers/application.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/application.js should pass jshint', function() { 
    ok(true, 'serializers/application.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/test-helper', ['savedo-bank/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('savedo-bank/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('savedo-bank/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:application", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:index", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/index-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/index-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/payees/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:payees/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/payees/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/payees');
  test('unit/controllers/payees/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/payees/new-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/payees/payee-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:payees/payee", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/payees/payee-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/payees');
  test('unit/controllers/payees/payee-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/payees/payee-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/payments-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:payments", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/payments-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/payments-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/payments-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/controllers/payments/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:payments/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/controllers/payments/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/payments');
  test('unit/controllers/payments/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/payments/new-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/helpers/helper-currency-test', ['savedo-bank/helpers/helper-currency', 'qunit'], function (helper_currency, qunit) {

  'use strict';

  qunit.module("HelperCurrencyHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = helper_currency.helperCurrency(42);
    assert.ok(result);
  });

});
define('savedo-bank/tests/unit/helpers/helper-currency-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/helper-currency-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/helper-currency-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/helpers/helper-moment-test', ['savedo-bank/helpers/helper-moment', 'qunit'], function (helper_moment, qunit) {

  'use strict';

  qunit.module("HelperMomentHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = helper_moment.helperMoment(42);
    assert.ok(result);
  });

});
define('savedo-bank/tests/unit/helpers/helper-moment-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/helper-moment-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/helper-moment-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/initializers/fixture-injector-test', ['ember', 'savedo-bank/initializers/fixture-injector', 'qunit'], function (Ember, fixture_injector, qunit) {

  'use strict';

  var container, application;

  qunit.module("FixtureInjectorInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    fixture_injector.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('savedo-bank/tests/unit/initializers/fixture-injector-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/fixture-injector-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/fixture-injector-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/models/account-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("account", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('savedo-bank/tests/unit/models/account-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/account-test.js should pass jshint', function() { 
    ok(true, 'unit/models/account-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/models/bank-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("bank", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('savedo-bank/tests/unit/models/bank-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/bank-test.js should pass jshint', function() { 
    ok(true, 'unit/models/bank-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/models/payee-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("payee", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('savedo-bank/tests/unit/models/payee-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/payee-test.js should pass jshint', function() { 
    ok(true, 'unit/models/payee-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/models/payees/payee-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("payees/payee", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('savedo-bank/tests/unit/models/payees/payee-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models/payees');
  test('unit/models/payees/payee-test.js should pass jshint', function() { 
    ok(true, 'unit/models/payees/payee-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/models/payment-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("payment", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('savedo-bank/tests/unit/models/payment-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/payment-test.js should pass jshint', function() { 
    ok(true, 'unit/models/payment-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payee/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payee/index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payee/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payee');
  test('unit/routes/payee/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payee/index-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payees-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payees", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payees-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/payees-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payees-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payees/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payees/index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payees/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payees');
  test('unit/routes/payees/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payees/index-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payees/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payees/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payees/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payees');
  test('unit/routes/payees/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payees/new-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payees/payee-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payees/payee", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payees/payee-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payees');
  test('unit/routes/payees/payee-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payees/payee-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payments/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payments/index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payments/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payments');
  test('unit/routes/payments/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payments/index-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/routes/payments/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:payments/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('savedo-bank/tests/unit/routes/payments/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/payments');
  test('unit/routes/payments/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/payments/new-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/serializers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("serializer:application", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var serializer = this.subject();
    assert.ok(serializer);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('savedo-bank/tests/unit/serializers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/application-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/unit/views/payments-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:payments");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('savedo-bank/tests/unit/views/payments-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/payments-test.js should pass jshint', function() { 
    ok(true, 'unit/views/payments-test.js should pass jshint.'); 
  });

});
define('savedo-bank/tests/views/payments.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/payments.js should pass jshint', function() { 
    ok(true, 'views/payments.js should pass jshint.'); 
  });

});
define('savedo-bank/views/payments', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].View.extend({});

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('savedo-bank/config/environment', ['ember'], function(Ember) {
  var prefix = 'savedo-bank';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("savedo-bank/tests/test-helper");
} else {
  require("savedo-bank/app")["default"].create({"name":"savedo-bank","version":"0.0.0.563e8458"});
}

/* jshint ignore:end */
//# sourceMappingURL=savedo-bank.map