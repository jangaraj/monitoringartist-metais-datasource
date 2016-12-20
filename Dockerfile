FROM monitoringartist/grafana-xxl:latest

RUN rm -rf /grafana-plugins/* && mkdir -p /grafana-plugins/grafana-simple-json-datasource/

ADD ./dist/ /grafana-plugins/grafana-simple-json-datasource/

