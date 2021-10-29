<template>
  <v-container>
    <v-row justify="center">
      <div v-if="allUserData">
        <h1 class="mt-3 text-center">Space X</h1>
        <h2 class="text-center">Usuarios</h2>
        <!-- <p>{{allUserData}}</p> -->
      </div>
    </v-row>
    <v-row v-if="allUserData">
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="allUserData.users"
          sort-by="calories"
          class="elevation-8"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn icon>
              <v-icon small @click=";(dialogEditUser = true), getConfig(item)">
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon
                small
                @click=";(dialogDeleteUser = true), getConfigDelete(item)"
              >
                mdi-delete
              </v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialogEditUser"
      persistent
      max-width="900px"
      style="font-size: 2vm"
    >
      <v-form v-model="valid" ref="form" v-on:submit.prevent lazy-validation>
        <v-card>
          <v-card-title>
            <span class="title">Modificación</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="6">
                  <span>Name</span>
                  <v-text-field solo v-model="editUser.name"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <span>Rocket</span>
                  <v-text-field solo v-model="editUser.rocket"></v-text-field>
                </v-col>
                <v-row class="justify-center text-center">
                  <v-col cols="12">
                    <v-btn
                      x-large=""
                      color="primary"
                      dark=""
                      @click="updateItemUser()"
                    >
                      CONFIRMAR
                    </v-btn>
                    <v-btn
                      x-large=""
                      color="error"
                      dark=""
                      @click="dialogEditUser = false"
                      class="ma-2"
                    >
                      CANCELAR
                    </v-btn>
                  </v-col>
                </v-row>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="dialogDeleteUser" persistent max-width="500px">
      <template>
        <v-system-bar color="error"></v-system-bar>
        <v-card class="text-center">
          <span class="text-center"
            ><strong class="title">Título: </strong>{{ editUser.name }}</span
          >
          <v-card-actions>
            <v-col class="text-center mt-n4">
              <v-btn dark color="primary" @click="deleteItemUser">SI</v-btn>
            </v-col>
            <v-col class="text-center mt-n4">
              <v-btn dark color="error" @click="dialogDeleteUser = false"
                >NO</v-btn
              >
            </v-col>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <!--   <v-btn @click="updatePost" color="success">Update Post</v-btn> -->
  </v-container>
</template>
<script>
import { useMutation, useQuery } from '@vue/apollo-composable'
// import { gql } from 'apollo-boost'
import gql from 'graphql-tag'
import { ref } from '@vue/composition-api'
// import { ALL_USERS } from '../graphql/users.query.gql'
// import { DELETE_USERS } from '../graphql/deleteUser.mutation.gql'

// const ALL_USERS_QUERY = gql`
//   {
//     users {
//       name
//       id
//       rocket
//       twitter
//     }
//   }
// `
const ALL_USERS_QUERY = gql`
query users {
  users {
      name
      id
      rocket
      twitter
    }
}
`
const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: uuid!, $name: String, $rocket: String) {
    update_users(
      where: { id: { _eq: $id } }
      _set: { name: $name, rocket: $rocket }
    ) {
      returning {
        name
        id
        rocket
        twitter
      }
    }
  }
`
const DELETE_USER_MUTATION = gql`
  mutation deleteUser($id: uuid!) {
    delete_users(where: { id: { _eq: $id } }) {
      returning {
        name
        rocket
      }
    }
  }
`
export default {
  name: 'Users',
  setup () {
    const dialogEditUser = ref(false)
    const dialogDeleteUser = ref(false)
    const editUser = ref({
      id: '',
      name: '',
      rocket: ''
    })
    const { result: allUserData, loading, error } = useQuery(ALL_USERS_QUERY)
    const getConfig = item => {
      editUser.value.id = item.id
      editUser.value.name = item.name
      editUser.value.rocket = item.rocket
      dialogEditUser.value = true
    }
    const getConfigDelete = item => {
      editUser.value.id = item.id
      editUser.value.name = item.name
      editUser.value.rocket = item.rocket
    }
    const { mutate: updateUser } = useMutation(UPDATE_USER_MUTATION, () => ({
      variables: {
        id: editUser.value.id,
        name: editUser.value.name,
        rocket: editUser.value.rocket
      },
      refetchQueries: [{ query: ALL_USERS_QUERY }]
    }))
    const { mutate: deleteUser, onDone, onError: errorDeleteUser } = useMutation(DELETE_USER_MUTATION, () => ({
      variables: {
        id: editUser.value.id
      },
      refetchQueries: [{ query: ALL_USERS_QUERY }]
      // update: (cache, { data: { ...DELETE_USER_MUTATION } }) => {
      //   // if (update_users.affected_rows) {
      //   //   if (this.type === 'private') {
      //   console.log('Delete', DELETE_USER_MUTATION)
      //   const data = cache.readQuery({ query: ALL_USERS_QUERY })
      //   console.log('aaaa =>', data)
      //   cache.writeQuery({
      //     query: ALL_USERS_QUERY,
      //     data: {
      //       users: data.users.filter(item => item.id !== editUser.id)
      //     }
      //   })
      //   console.log('cache => ', cache)
      //   // store.evit({ id: editUser.id })
      //   // const allUsers = data
      //   //   }
      //   // }
      // }
      // update: (cache, {
      //   data: { deleteUser }
      // }) => {
      //   // const data = cache.readQuery({ query: ALL_USERS_QUERY })
      //   // console.log('Data => ', data)
      //   // data.users.push(deleteUser)
      //   // cache.writeQuery({ query: ALL_USERS_QUERY, allUserData })
      //
      // }
    }))
    onDone(() => {
      console.log('OK => ')
      dialogDeleteUser.value = false
    })
    errorDeleteUser(error => {
      console.log('Error => ', error)
    })
    /*    const { mutate: sendMessage, onDone } = useMutation(gql`
      mutation sendMessage ($text: String!) {
        sendMessage (text: $text) {
          id
          text
        }
      }
    `, () => ({
      variables: {
        text: newMessage.value,
      },
      update: (cache, { data: { sendMessage } }) => {
        const data = cache.readQuery({ query: MESSAGES })
        data.messages.push(sendMessage)
        cache.writeQuery({ query: MESSAGES, data })
      },
    }))

    onDone(() => {
      newMessage.value = ''
    }) */

    const updateItemUser = () => {
      updateUser()
      dialogEditUser.value = false
    }
    const deleteItemUser = () => {
      deleteUser()
      // dialogDeleteUser.value = false
    }
    return {
      allUserData,
      loading,
      error,
      getConfig,
      editUser,
      dialogEditUser,
      updateItemUser,
      deleteItemUser,
      dialogDeleteUser,
      getConfigDelete
    }
  },
  data () {
    return {
      // dialogEdit: false,
      // dialogDelete: false,
      headers: [
        {
          text: 'INDEX',
          align: 'center',
          value: 'id'
        },
        {
          text: 'NOMBRE',
          align: 'center',
          value: 'name'
        },
        {
          text: 'ROCKET',
          align: 'center',
          value: 'rocket'
        },
        {
          text: 'ACCIONES',
          align: 'center',
          value: 'actions'
        }
      ],
      valid: false
    }
  }
}
</script>
