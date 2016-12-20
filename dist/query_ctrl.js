'use strict';

System.register(['app/plugins/sdk', './css/query-editor.css!', './utils', './migrations'], function (_export, _context) {
  "use strict";

  var QueryCtrl, utils, migrations, _createClass, GenericDatasourceQueryCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      QueryCtrl = _appPluginsSdk.QueryCtrl;
    }, function (_cssQueryEditorCss) {}, function (_utils) {
      utils = _utils;
    }, function (_migrations) {
      migrations = _migrations;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl = function (_QueryCtrl) {
        _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

        //constructor($scope, $injector, uiSegmentSrv)  {
        function GenericDatasourceQueryCtrl($scope, $injector, $rootScope, $sce, $q, templateSrv) {
          _classCallCheck(this, GenericDatasourceQueryCtrl);

          var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

          //this.scope = $scope;
          //this.uiSegmentSrv = uiSegmentSrv;
          //this.target.target = this.target.target || 'select metric';
          _this.$q = $q;
          _this.replaceTemplateVars = _this.datasource.replaceTemplateVars;
          _this.templateSrv = templateSrv;

          // Update metric suggestion when template variable was changed
          $rootScope.$on('template-variable-value-updated', function () {
            return _this.onVariableChange();
          });

          // Update metrics when item selected from dropdown
          $scope.$on('typeahead-updated', function () {
            _this.onTargetBlur();
          });

          _this.init = function () {
            var target = this.target;

            // Migrate old targets
            target = migrations.migrate(target);

            var scopeDefaults = {
              metric: {},
              oldTarget: _.cloneDeep(this.target),
              queryOptionsText: this.renderQueryOptionsText()
            };
            _.defaults(this, scopeDefaults);

            // Load default values
            var targetDefaults = {
              mode: 0,
              application: { filter: "" },
              item: { filter: "" },
              functions: []
            };
            _.defaults(target, targetDefaults);

            // Create function instances from saved JSON
            target.functions = _.map(target.functions, function (func) {
              return metricFunctions.createFuncInstance(func.def, func.params);
            });

            if (0 === 0) {
              this.downsampleFunctionList = [{ name: "avg", value: "avg" }, { name: "min", value: "min" }, { name: "max", value: "max" }];

              this.initFilters();
            }
          };

          _this.init();

          return _this;
        }

        _createClass(GenericDatasourceQueryCtrl, [{
          key: 'getItemNames',
          value: function getItemNames() {
            return this.datasource.metricFindQuery(this.target).then(this.uiSegmentSrv.transformToSegments(false));
            // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
          }
        }, {
          key: 'toggleEditorMode',
          value: function toggleEditorMode() {
            this.target.rawQuery = !this.target.rawQuery;
          }
        }, {
          key: 'onChangeInternal',
          value: function onChangeInternal() {
            this.panelCtrl.refresh(); // Asks the panel to refresh data.
          }
        }, {
          key: 'isVariable',
          value: function isVariable(str) {
            return utils.isTemplateVariable(str, this.templateSrv.variables);
          }
        }, {
          key: 'isRegex',
          value: function isRegex(str) {
            return utils.isRegex(str);
          }
        }]);

        return GenericDatasourceQueryCtrl;
      }(QueryCtrl));

      _export('GenericDatasourceQueryCtrl', GenericDatasourceQueryCtrl);

      GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
    }
  };
});
//# sourceMappingURL=query_ctrl.js.map
