<template>
  <div :id="dom_id" class="chart-workflow"></div>
</template>

<script>
  import API from '@/service/api'
  import _ from 'lodash'
  import vis from 'vis'
  import 'vis/dist/vis-network.min.css'
  // import jobRelies from '@/service/mockData' // mocking data

  export default {
    name: 'ChartJobRelies',
    props: ['dom_id', 'root_job'],
    data() {
      return {
        workflow_data: [],
        network: null,
        dataset_chart: {
          nodes: null,
          edges: null
        }
      }
    },
    mounted() {
      console.log('ChartJobRelies mounted() ', this.root_job);
      this.fetchData(this.root_job.id).then(res => {
        console.log('getJobRelies fetched: ', res);
        this.renderChart(this.dom_id, this.createDataSet(this.root_job, res));
      }, err => {
        console.log('getJobRelies fetched: ', err);
      });
    },
    watch: {
      root_job: function (newRootJob) {
        console.log('root_job watch() ', newRootJob);
        this.fetchData(newRootJob.id).then(res => {
          console.log('getJobRelies fetched: ', res);
          this.renderChart(this.dom_id, this.createDataSet(newRootJob, res));
        }, err => {
          console.log('getJobRelies fetched: ', err);
        });
      }
    },
    methods: {
      fetchData(jobId) {
        console.log(`fetchData(${jobId})`);
        return API.getJobRelies(jobId);
        // return jobRelies(jobId);
      },
      createDataSet(job, relations) {
        console.log(`createDataSet(`, job, relations, `)`);
        let self = this;
        // let chart_data = {};
        let ns = [{
          id: job.id,
          label: job.name,
          status: job.status,
          title: `ID: ${job.id},状态: ${job.status}`,
          shape: 'dot',
          group: job.status
        }];
        let es = [];
        relations.PRE && _.unionBy(relations.PRE, 'id').forEach(function (pre) {
          if (pre.id !== job.id) {
            ns.push({
              id: pre.id,
              label: pre.name,
              status: pre.status,
              title: `ID: ${pre.id},状态: ${pre.status}`,
              shape: 'dot',
              group: pre.status
            });
            es.push({
              from: pre.id,
              to: job.id
            })
          }
        });

        relations.POST && _.unionBy(relations.POST, 'id').forEach(function (post) {
          if (post.id !== job.id) {
            ns.push({
              id: post.id,
              label: post.name,
              status: post.status,
              title: `ID: ${post.id},状态: ${post.status}`,
              shape: 'dot',
              group: post.status
            });
            es.push({
              from: job.id,
              to: post.id
            })
          }
        });

        console.log('ns: ', ns);
        // console.log('_.unionBy(ns): ', _.unionBy(ns, 'id'));
        console.log('es: ', es);
        self.dataset_chart.nodes = new vis.DataSet(_.unionBy(ns, 'id'));
        self.dataset_chart.nodes.on('*', function (event, properties, senderId) {
          console.log('DataSet nodes event:', event, 'properties:', properties, 'senderId:', senderId);
        });
        self.dataset_chart.edges = new vis.DataSet(_.uniq(es));
        self.dataset_chart.edges.on('*', function (event, properties, senderId) {
          console.log('DataSet edges event:', event, 'properties:', properties, 'senderId:', senderId);
        });
        window.self.dataset_chart = self.dataset_chart;
        console.log('self.dataset_chart: ', self.dataset_chart);
        return self.dataset_chart;
      },
      updateDataSet(job, relations) {
        console.log('updateDataSet(job: ', job, ', relations: ', relations);
        let self = this;
        // let chart_data = {};
        let ns = [];
        let es = [];
        relations.PRE && _.unionBy(relations.PRE, 'id').forEach(function (pre) {
          if (pre.id !== job.id) {
            // console.log(self.dataset_chart.nodes.get(pre.id));
            if (_.isEmpty(self.dataset_chart.nodes.get(pre.id))) {
              ns.push({
                id: pre.id,
                label: pre.name,
                status: pre.status,
                title: `ID: ${pre.id},状态: ${pre.status}`,
                shape: 'dot',
                group: pre.status
              });
              if (!self.dataset_chart.edges.get({
                  filter: function (e) {
                    return e.from == pre.id && e.to == job.id
                  }
                })) {
                es.push({
                  from: pre.id,
                  to: job.id
                })
              } else {
                console.log('else');
                es.push({
                  from: pre.id,
                  to: job.id
                })
              }
            }
          }
        });

        relations.POST && _.unionBy(relations.POST, 'id').forEach(function (post) {
          if (post.id !== job.id) {
            // console.log(self.dataset_chart.nodes.get(post.id), '==> ', _.isEmpty(self.dataset_chart.nodes.get(post.id)));

            if (_.isEmpty(self.dataset_chart.nodes.get(post.id))) {
              ns.push({
                id: post.id,
                label: post.name,
                status: post.status,
                title: `ID: ${post.id},状态: ${post.status}`,
                shape: 'dot',
                group: post.status
              });
              if (!self.dataset_chart.edges.get({
                  filter: function (e) {
                    return e.from == post.id && e.to == job.id
                  }
                })) {
                es.push({
                  from: job.id,
                  to: post.id
                })
              } else {
                console.log('else');
                es.push({
                  from: job.id,
                  to: post.id
                })
              }
            }
          }
        });

        console.log('ns: ', ns);
        console.log('es: ', es);
        self.dataset_chart.nodes.add(_.unionBy(ns, 'id'));
        self.dataset_chart.edges.add(_.uniq(es));
        // window.self.dataset_chart = self.dataset_chart;
        console.log('self.dataset_chart: ', self.dataset_chart);
        self.network && self.network.fit({
          animation: {             // animation object, can also be Boolean
            duration: 500,                 // animation duration in milliseconds (Number)
            easingFunction: "easeInOutQuad" // Animation easing function, available are:
          }
        });
        // return self.dataset_chart;
      },
      renderChart(dom_id, converted_data) {
        let self = this;
        let container = document.getElementById('chart_workflow');
        let options = {
          autoResize: true,
          height: '100%',
          width: '100%',
          locale: 'en',
          nodes: {
            // widthConstraint: 500,
            size: 15,
            font: {
              size: 20,
              color: 'black'
            },
            borderWidth: 2,
            fixed: true,
            chosen: {
              node: function (values, id, selected, hovering) {
                // console.log('chosen node: ', arguments);
              }
            }
          },
          edges: {
            // smooth: true,
            color: {
              inherit: 'from'
            },
            arrows: {

              to: {
                enabled: true,
                scaleFactor: 1,
                type: 'arrow'
              }
            },
            arrowStrikethrough: false
          },
          groups: {
            'RUNNING': {
              color: {background: '#007bff'}
            },
            'DONE': {
              color: '#28a745'
              // size: 50
            },
            'ERROR': {
              color: '#dc3545'
              // size: 50
            },
            'PENDING': {
              color: '#ffc107'
              // size: 50
            }
          },
          layout: {
            hierarchical: {
              direction: 'LR',
              sortMethod: 'directed',
              levelSeparation: 300
            },
            improvedLayout: true
          },
          physics: {
            "forceAtlas2Based": {
              "springLength": 100
            },
            "minVelocity": 0.75,
            "solver": "forceAtlas2Based"
          },
          interaction: {
            selectConnectedEdges: true,
            zoomView: true
          }
        };
        let network = new vis.Network(container, converted_data, options);
        window.network = network;
        self.network = network;
        network.fit();
        network.on('selectNode', function (params) {
          console.log('on selectNode: ', arguments);
          // debugger
          if (params.nodes && params.nodes.length) {
            console.log(params.nodes[0]);
            self.fetchData(params.nodes[0]).then(res => {
              console.log('getJobRelies fetched: ', res);
              return self.updateDataSet(self.dataset_chart.nodes.get(params.nodes[0]), res);
            }, err => {
              console.log('getJobRelies fetched: ', err);
            });
          }
        });
      }
    },
    components: {}
  }
</script>

<style scoped>
  .chart-workflow {
    width: 100%;
    height: 100%;
  }
</style>
