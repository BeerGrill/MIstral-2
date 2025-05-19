<script>
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import Start_site from './Start_site.vue'

export default {
  name: 'App',
  // components: { Try_Skill },
  data() {
    return {
      labels: [],
      types: [],
      instractions: [],
      //newLable: '',
      newPrompt: {},
      data: [],
      id: null,
      editMode: false,
      column: "",
      skill_name: "",

    }
  },
  computed: {
    receivedData() {
      alert(this.$store.state.data);
    },
  },
  methods: {
    createLable() {
      ; (async () => {
        const { value: formValues } = await Swal.fire({
          title: 'Multiple inputs',
          html: `

      <label for="label">label</label><br>
      <input id="label" class="swal2-input">

       <br><br><br>

      <label for="Type">Type</label><br>
      <select name="Type" id="Type" class="swal2-select">
  <option value="label">label</option>
  <option value="line">Line</option>
</select>

       <br><br><br>
      <label for="Instructions">Instructions</label><br>
      <input type="select" id="Instructions" class="swal2-input" >
    `,
          focusConfirm: false,
          preConfirm: () => {
            return {
              label: document.getElementById('label').value,
              type: document.getElementById('Type').value,
              instructions: document.getElementById('Instructions').value,
            }
          },
        })
        if (formValues) {
          this.newPrompt = formValues
          this.createLabel()
        }
      })()
    },

    async createLabel() {
      if (!this.newPrompt) {
        alert('No data to send!')
        return
      }

      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: this.newPrompt.label,
          type: this.newPrompt.type,
          instructions: this.newPrompt.instructions,
          skill_name: this.$store.state.data,
        }),
      }
      try {
        const response = await fetch(
          'http://localhost/mistral_projekt/createLabel.php',
          requestOptions,
        )
        //alert(requestOptions.body)
        if (!response.ok) {
          const error = `Fehler: ${response.status} - ${response.statusText}`
          throw new Error(error)
        }
        this.get_Prompts();
        // alert(`Erfolgreich gespeichert! ` + requestOptions.body)
      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung:', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: ' + error.message)
        }
      }
      this.newPrompt = []
    },
    // async get_Prompts() {
    //   const requestOptions = {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   }
    //   try {
    //     const response = await fetch(
    //       'http://localhost/mistral_projekt/Get_labels.php',
    //       requestOptions,
    //     )
    //     if (!response.ok) {
    //       const error = `Fehler:" ${response.status} - ${response.statusText}}`
    //       throw new Error(error)
    //     }
    //     const data = await response.json()
    //     this.data = data
    //   } catch (error) {
    //     console.error(
    //       'Es gab einen Fehler bei der Übermittlung:Labels können nicht gezogen werden',
    //       error,
    //     )

    //     if (error.message.includes('Failed to fetch')) {
    //       alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
    //     } else {
    //       alert('Fehler bei der Übermittlung:Labels können nicht gezogen werden ' + error.message)
    //     }
    //   }
    // },
    async get_Prompts() {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({
          skill: this.$store.state.data
        })
      }
      try {
        const response = await fetch(
          'http://localhost/mistral_projekt/Get_labels.php',
          requestOptions,
        )
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        const data = await response.json()
        this.data = data
        //alert(JSON.stringify(data))
      } catch (error) {
        // console.error(
        //   'Es gab einen Fehler bei der Übermittlung:Labels können nicht gezogen werden',
        //   error,
        // )

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung:Labels können nicht gezogen werden ' + error.message)
        }
      }
    },


    delete_popup(labelId) {
      this.id = labelId
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.delete_label()
          Swal.fire({
            title: 'Deleted!',
            text: 'Label has been deleted.',
            icon: 'success',
          })
        }
      })
    },

    async delete_label() {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: this.id,
        }),
      }
      try {
        const response = await fetch(
          'http://localhost/mistral_projekt/delete_label.php',
          requestOptions,
        )
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        this.get_Prompts();
        this.id = null
      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung:Lable wurde nicht gelöscht', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: Lable wurde nicht gelöscht ' + error.message)
        }
      }
    },
    async update_lable(labelId, newLabel, columnName) {

      this.editMode = false
      const requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: labelId,
          newLabel: newLabel,
          column: columnName
        })
      }

      try {
        const response = await fetch('http://localhost/mistral_projekt/update_lable.php', requestOptions)
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }

      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung:Lable wurde nicht gelöscht', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: Lable wurde nicht gelöscht ' + error.message)
        }
      }
    },


    ///next method
  },
  mounted() {
    this.get_Prompts()

  },
}

</script>

<template>
  <!-- <button v-on:click="zeig_data">click</button> -->
  <div class="container-label">
    <div class="manipulation-buttons-row">
      <div class="col-1">
        <p>label Definition</p>
      </div>
      <button v-on:click="createLable" class="col-1-button">
        <p>Add label</p>
      </button>
      <button v-on:click="update_lable" class="col-1-button">
        <p>Save</p>
      </button>
    </div>
    <ul class="label-header-row">
      <li class="fields">Name</li>
      <li class="fields">Type</li>
      <li class="fields">Instructions</li>
      <li class="fields_action">Action</li>
    </ul>
    <!-- <div class="label-fields-row"> -->
    <ul class="label-definition">
      <li class="created_labels" v-for="dat in data" :key="dat.label_id">
        <!-- Erste Element-->
        <div v-if="!editMode">
          <span @dblclick="editMode = true">{{ dat.label }}</span>
        </div>
        <div v-else>
          <input v-model="dat.label" v-on:blur="update_lable(dat.label_id, dat.label, column = 'label')" />
          <!-- v-on:enter="update_lable(dat.label, dat.label_id, column = 'label')" @blur=" column = 'label'"  -->
        </div>
        <!-- Zweite Element-->
        <div v-if="!editMode">
          <span @dblclick="editMode = true">{{ dat.type }}</span>
        </div>
        <div v-else>
          <input v-model="dat.type" v-on:blur="update_lable(dat.label_id, dat.type, column = 'type')" />
          <!-- v-on:enter="update_lable(dat.label_id, dat.type)"  -->
        </div>

        <!-- Dritte Element-->
        <div v-if="!editMode">
          <span @dblclick="editMode = true">{{ dat.instructions }}</span>
        </div>
        <div v-else>
          <input v-model="dat.instructions"
            v-on:blur="update_lable(dat.label_id, dat.instructions, column = 'instructions')" />
          <!-- v-on:enter="update_instructions(dat.label_id)" -->
        </div>




        <button class="delete_button" @click="delete_popup(dat.label_id)">
          <!--  delete_label(dat.label_id) -->
          <img src="../components/icons/trash3-fill.svg" alt="delete" title="lable löschen" />
        </button>
      </li>

    </ul>

  </div>
</template>

<style scoped>
.container-label {
  height: 1000px;
  width: auto;
  background-color: #f5f7f7;
  display: flex;
  padding: 16px;
  margin: 50px 50px 0 50px;
  flex-direction: column;
  border: 1px solid rgba(112, 134, 134, 0.4);
  border-radius: 10px;
}

.manipulation-buttons-row {
  height: 75px;
  width: 100%;
  display: flex;
  justify-content: end;
}

[class*='col-1'] {
  width: auto;
  height: auto;
  min-width: 100px;
  max-height: 30px;
}

.col-1-button {
  margin-left: 10px;
  border-radius: 4px;
}

.label-header-row {
  display: flex;
  height: 40px;
  width: 237, 5px;
  margin-left: 0;
  border: 1px solid black;
  border-radius: 10px;
  padding: 0%;
}

.fields {
  border-left: 1px solid rgb(234, 0, 0, 0.4);
  display: flex;
  flex-direction: row;
  margin-top: 7px;
  width: 366px;
}

.fields_action {
  border-left: 1px solid rgb(234, 0, 0, 0.4);
  display: flex;
  flex-direction: row;
  margin-top: 7px;
  width: 100px;
}

.label-definition {
  padding: 0%;
}

.label-definition>li {
  list-style-type: none;
  display: flex;
  margin-top: 20px;
  border-bottom: 2px solid rgb(128, 128, 128, 0.2);

}

.created_labels>div>span {
  display: flex;
  flex-direction: row;
  width: 366px;
}

.delete_button {
  border: none;
  border-radius: 10px;
  background-color: none;
}
</style>
