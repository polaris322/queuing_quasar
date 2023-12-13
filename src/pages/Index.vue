<template>
  <q-page class="bg-grey-3 column">
    <q-form
      @submit="addUser"
      @reset="onReset"
    >
      <div class="q-pa-md bg-primary">
        <div class="row q-pa-xs justify-center">
          <div class="col-lg-5 col-md-4 q-pa-xs">
            <q-input filled v-model="username"
                     Placeholder="Name" dense
                     lazy-rules
                     :rules="[ val => val && val.length > 0 || 'Please type username']"
                     bg-color="white"
                     square />
          </div>
          <div class="col-lg-5 col-md-4 q-pa-xs">
            <q-input filled v-model="phone"
                     lazy-rules
                     :rules="[ val => val && val.length > 0 || 'Please type phone number']"
                     Placeholder="Phone number"
                     maxlength="12" type="number"
                     dense bg-color="white"
                     square
            />
          </div>
          <div class="col-lg-1 col-md-3 q-pa-xs">
            <q-btn type="submit" icon="add" round color="secondary" />
          </div>
        </div>
      </div>
    </q-form>


    <div class="q-pa-md q-gutter-md">
      <q-list bordered separator class="bg-white rounded-borders">
        <q-item-label header>Current Queue</q-item-label>

        <q-item
          v-for="user in usernames"
          :key="user.id"
          clickable v-ripple>
          <q-item-section avatar>
            <q-avatar>
              <img src="~assets/generic_avatar.png"/>
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1">{{ user.name }}</q-item-label>
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-chip color="teal" size="md" text-color="white" icon="check" v-if="user.completed">
                Completed
              </q-chip>
              <q-chip color="red" size="md" text-color="white" icon="alarm" v-else>
                Pending
              </q-chip>
            </q-item-label>
          </q-item-section>

          <q-item-section>
            <DateDiff :date="new Date(user.timestamp)" />
          </q-item-section>

          <q-item-section side top>
            <div class="flex items-center">
              <q-btn class="q-ma-sm" @click="completeUser(user.id)" unelevated rounded icon="check" size="sm" color="secondary" label="Complete" :disable="!user.completed"/>
              <q-btn unelevated rounded icon="close" color="red" size="sm" label="Cancel" @click="promptCancel(user.id)"/>
            </div>
          </q-item-section>
        </q-item>

      </q-list>
    </div>

    <q-dialog v-model="confirmCancel" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure to cancel this user in this queue?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No, I am not" color="primary" v-close-popup />
          <q-btn flat label="Yes, I am sure" color="primary" @click="deleteUser" />
        </q-card-actions>

        <q-inner-loading :showing="visibleLoading">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="visibleLoading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
  </q-page>
</template>

<script>
import DateDiff from 'components/DateDiff.vue'
import db from 'boot/firebase'

const DB_NAME = 'waiting_details';

export default {
  components: {
    DateDiff
  },
  data() {
    return {
      username: '',
      phone: '',
      usernames: [],
      confirmCancel: false,
      selectedId: '',
      visibleLoading: false
    }
  },
  methods: {
    async initialize() {
      this.visibleLoading = true;
      await db.collection(DB_NAME).orderBy("timestamp", "asc").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            //ADD
            const source = change.doc.metadata.hasPendingWrites ? 'Local' : 'Server'

            if (source === 'Server') {
                let user = change.doc.data();
                user.id = change.doc.id;
                this.usernames.push(user);
            }
          }

          if (change.type === 'modified') {
            //UPDATE
            const index = this.usernames.findIndex(item => item.id === change.doc.id)
            let user = change.doc.data();
            user.id = change.doc.id;
            this.usernames.splice(index, 1, user)
          }

          if (change.type === 'removed') {
            //REMOVE
            const index = this.usernames.findIndex(item => item.id === change.doc.id)
            if (index >= 0) {
             this.usernames.splice(index, 1)
            }
          }
        })
        this.visibleLoading = false;
      })
    },

    async addUser() {
      this.visibleLoading = true;
      let newuser = {
        name: this.username,
        phone: '',
        completed: false,
        timestamp: Date.now()
      }

      await db.collection(DB_NAME).add(newuser).then((res) => {
        Object.assign(newuser, {id: res.id});
        this.usernames.push(newuser);
        this.onReset();
      }).catch((error) => console.log(error))

      this.visibleLoading = false;
    },

    onReset () {
      this.username = '';
      this.phone = '';
    },

    promptCancel(id) {
      this.confirmCancel = true;
      this.selectedId = id;
    },

    async deleteUser(){
      this.visibleLoading = true;
      await db.collection(DB_NAME).doc(this.selectedId).delete().then(() => {
        this.confirmCancel = false;
        this.selectedId = '';
      })
        .catch((error) => {
          console.error(error);
        })
      this.visibleLoading = false;
    },

    completeUser(id) {
      db.collection(DB_NAME).doc(id)
        .update({ completed: true }).then(() => {
      }).catch((error) => {
        console.log(error);
      });
    }
  },

  created() {
    this.initialize();
  }
}
</script>
