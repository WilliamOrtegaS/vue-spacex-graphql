import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import VueCompositionApi, { provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'
// import ApolloClient from 'apollo-boost'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { createHttpLink } from 'apollo-link-http'

// import { createProvider } from './vue-apollo'
const httpLink = createHttpLink({
  uri: 'https://api.spacex.land/graphql/'
})

// const cache = new InMemoryCache()
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          keyArgs: false,
          merge (existing = [], incoming, args) {
            console.log(
              'query merge existing',
              existing,
              'incoming',
              incoming,
              'args',
              args
            )
            if (existing === undefined) return incoming
            if (incoming === undefined) return existing
            if (incoming.length === existing.length - 1) return incoming // deletion control
            // console.log("MERGING", (existing.length-1), (incoming.length))
            return [
              // returning a list to render en v-data-table
              ...existing,
              ...incoming
            ]
          }
        }
      }
    },
    Mutation: {
      fields: {
        insert_users: {
          keyArgs: false,
          merge (existing = [], incoming = [], args) {
            console.log(
              '**********EXISTING',
              existing,
              '************INCOMING',
              incoming,
              '**************ARGS',
              args.args.objects
            )
            return [args.args.objects]
          }
        }
      }
    },
    Subscription: {
      fields: {
        users: {
          merge (existing, incoming) {
            console.log(
              'merging devices subscription, existing:',
              existing,
              'incoming:',
              incoming
            )
            return { ...existing, ...incoming }
          }
        }
      }
    },
    users: {
      keyFields: ['id']
    }
  }
})

// Client apollo client
const apolloClient = new ApolloClient({
  // connectToDevTools: true,
  // uri: 'https://api.spacex.land/graphql/',
  link: httpLink,
  cache
})
Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  // Add the client to vue object
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  router,
  store,
  vuetify,
  // apolloProvider: createProvider(),
  render: h => h(App)
}).$mount('#app')
