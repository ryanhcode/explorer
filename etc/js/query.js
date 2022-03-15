
Vue.component('query', {
  props: ['valid'],
  data: function() {
    return {
      query_result: undefined,
      query_error: undefined,
    }
  },
  methods: {
    // Query changed event
    evt_query_changed(query) {
      let r = this.request;
      if (r) {
        r.abort();
      }
      if (query && query.length > 1) {
        this.request = app.request_query('query', query, (reply) => {
          this.query_error = reply.error;
          if (reply.error === undefined) {
            this.query_result = reply;
          }
          this.$emit('changed');
        }, (err_reply) => {
          if (err_reply) {
            this.query_error = err_reply.error;
          } else {
            this.query_error = "request failed";
          }
          this.$emit('changed');
        }, {
          ids: false, 
          subjects: false,
          entity_labels: true,
          variable_labels: true
        });
      } else {
        this.query_result = undefined;
        this.query_error = undefined;
        this.$emit('changed');
      }
    },
    evt_enable_toggle(e) {
      this.$refs.container.enable_toggle(e);
    },
    refresh() {
      this.evt_query_changed(this.$refs.editor.get_query());
    },
    get_query() {
      return this.$refs.editor.get_query();
    },
    set_query(q) {
      this.$refs.editor.set_query(q);
      this.$refs.container.expand();
    },
    get_error() {
      return this.query_error;
    },
    evt_close() {
      this.set_query();
    },
    result_count() {
      return this.$refs.results.count();
    }
  },
  computed: {
    count: function() {
      if (!this.query_result) {
        return 0;
      }

      let result = 0;
      for (let i = 0; i < this.query_result.results.length; i ++) {
        const elem = this.query_result.results[i];
        if (elem.entities) {
          result += elem.entities.length;
        } else {
          result ++;
        }
      }
      return result;
    }
  },
  template: `
    <content-container 
      ref="container" 
      :disable="query_result === undefined && query_error === undefined" 
      closable="true" 
      v-on:close="evt_close">

      <template v-slot:summary>
        <query-editor
          ref="editor"
          :error="query_error"
          v-on:changed="evt_query_changed"
          v-on:enable_toggle="evt_enable_toggle"/>
      </template>

      <template v-slot:detail>
        <query-results 
          ref="results"
          :data="query_result" 
          :valid="valid && query_error === undefined"
          v-on="$listeners"/>
      </template>
    </content-container>
    `
});
