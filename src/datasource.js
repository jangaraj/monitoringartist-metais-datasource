import _ from "lodash";
import moment from 'moment';

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  // Called once per panel (graph)
  query(options) {
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({data: []});
    }
    var timeFrom = query.range.from._d.toISOString().slice(0,10);
    var timeTo = query.range.to._d.toISOString().slice(0,10);

    var promises = _.map(options.targets, target => {
      target = _.cloneDeep(target);
      var options = {
       url: this.url + '/monitoring/param-value/list?entityRef=' + target['target'] + '&parameterTypeId=18&intervalStart=' + timeFrom + '&intervalEnd=' + timeTo + '&sortAttr=intervalStart&sortAsc=true&perPageSize=100000',
        data: query,
        method: 'GET',
      };
      return this.backendSrv.datasourceRequest(options).then(function(result) {
        var datapoints = []
        _.each(result.data['results'], function(item) {
          datapoints.push([parseInt(item["value"]), parseInt(moment(item["monitoredInterval"]["end"]).format('x'))])
        });
        return [{"target":target['target'],"datapoints":datapoints}];
      });

    });

    // Data for panel (all targets)
    return this.q.all(_.flatten(promises))
      .then(_.flatten)
      .then(timeseries_data => {

        var data = _.map(timeseries_data, timeseries => {
          return timeseries;
        });
        return { data: data };
      });
  }

  // Required
  // Used for testing datasource in datasource configuration pange
  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/',
      method: 'GET'
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
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
    }).then(result => {
      return result.data;
    });
  }

  // Optional
  // Required for templating
  metricFindQuery(options) {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/cmdb/read/cilistfiltered',
      data: '{"page":1,"perPage":9999,"sortBy":"createdAt","sortType":"DESC","filter":{"type":["AS"],"metaAttributes":{"state":["DRAFT"]},"relTypeFilters":[{"relType":"ISVS_realizuje_AS","relCiUuids":["56fb4575-7034-41c8-bf51-c4c97c50bcf4"]}],"searchFields":["Gen_Profil_nazov","Gen_Profil_kod_metais"],"fullTextSearch":"' + options.target + '"}}',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(this.mapToTextValue);
  }

  mapToTextValue(result) {
    return _.map(result.data["configurationItemSet"], (i) => {
      return { text: i.attributes.find( x => x.name === 'Gen_Profil_nazov').value, value: i.uuid};
    });
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target),
        refId: target.refId,
        hide: target.hide
      };
    });

    options.targets = targets;

    return options;
  }
}
