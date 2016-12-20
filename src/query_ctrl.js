import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'
import * as utils from './utils';
import * as migrations from './migrations';

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  //constructor($scope, $injector, uiSegmentSrv)  {
  constructor($scope, $injector, $rootScope, $sce, $q, templateSrv) {
    super($scope, $injector);

    //this.scope = $scope;
    //this.uiSegmentSrv = uiSegmentSrv;
    //this.target.target = this.target.target || 'select metric';
    this.$q = $q;
    this.replaceTemplateVars = this.datasource.replaceTemplateVars;
    this.templateSrv = templateSrv;

    // Update metric suggestion when template variable was changed
    $rootScope.$on('template-variable-value-updated', () => this.onVariableChange());

    // Update metrics when item selected from dropdown
    $scope.$on('typeahead-updated', () => {
      this.onTargetBlur();
    });

    this.init = function() {
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
        functions: [],
      };
      _.defaults(target, targetDefaults);

      // Create function instances from saved JSON
      target.functions = _.map(target.functions, function(func) {
        return metricFunctions.createFuncInstance(func.def, func.params);
      });

      if (0 === 0) {
        this.downsampleFunctionList = [
          {name: "avg", value: "avg"},
          {name: "min", value: "min"},
          {name: "max", value: "max"}
        ];

        this.initFilters();
      }
    };

    this.init();


  }

  getItemNames() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(false));
      // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  isVariable(str) {
    return utils.isTemplateVariable(str, this.templateSrv.variables);
  }

  isRegex(str) {
    return utils.isRegex(str);
  }

}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

