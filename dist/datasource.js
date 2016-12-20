'use strict';

System.register(['lodash', 'moment'], function (_export, _context) {
  "use strict";

  var _, moment, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_moment) {
      moment = _moment.default;
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

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        // Called once per panel (graph)


        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var _this = this;

            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }
            var timeFrom = query.range.from._d.toISOString().slice(0, 10);
            var timeTo = query.range.to._d.toISOString().slice(0, 10);

            var promises = _.map(options.targets, function (target) {
              target = _.cloneDeep(target);
              var options = {
                url: _this.url + '/monitoring/param-value/list?entityRef=' + target['target'] + '&parameterTypeId=18&intervalStart=' + timeFrom + '&intervalEnd=' + timeTo + '&sortAttr=intervalStart&sortAsc=true&perPageSize=100000',
                data: query,
                method: 'GET'
              };
              return _this.backendSrv.datasourceRequest(options).then(function (result) {
                var datapoints = [];
                _.each(result.data['results'], function (item) {
                  datapoints.push([parseInt(item["value"]), parseInt(moment(item["monitoredInterval"]["end"]).format('x'))]);
                });
                return [{ "target": target['target'], "datapoints": datapoints }];
              });
            });

            // Data for panel (all targets)
            return this.q.all(_.flatten(promises)).then(_.flatten).then(function (timeseries_data) {

              var data = _.map(timeseries_data, function (timeseries) {
                return timeseries;
              });
              return { data: data };
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
            var annotationQuery = {
              range: options.range,
              annotation: {
                name: options.annotation.name,
                datasource: options.annotation.datasource,
                enable: options.annotation.enable,
                iconColor: options.annotation.iconColor,
                query: query
              },
              rangeRaw: options.rangeRaw
            };

            return this.backendSrv.datasourceRequest({
              url: this.url + '/annotations',
              method: 'POST',
              data: annotationQuery
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(options) {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/cmdb/read/cilistfiltered',
              data: '{"page":1,"perPage":9999,"sortBy":"createdAt","sortType":"DESC","filter":{"type":["AS"],"metaAttributes":{"state":["DRAFT"]},"relTypeFilters":[{"relType":"ISVS_realizuje_AS","relCiUuids":["56fb4575-7034-41c8-bf51-c4c97c50bcf4"]}],"searchFields":["Gen_Profil_nazov","Gen_Profil_kod_metais"],"fullTextSearch":"' + options.target + '"}}',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).then(this.mapToTextValue);
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.map(result.data["configurationItemSet"], function (i) {
              return { text: i.attributes.find(function (x) {
                  return x.name === 'Gen_Profil_nazov';
                }).value, value: i.uuid };
            });
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this2 = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                target: _this2.templateSrv.replace(target.target),
                refId: target.refId,
                hide: target.hide
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
