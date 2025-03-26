<script>
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

import { ref, computed } from 'vue'
export default {
  data() {
    return {
      modelList: [],
      skillList: {},
      selected_skill: null
      // modellName: '',
      // question: '',
      // response: '',
      // prompt: ' ',
    }
  },
  methods: {

    async getModel() {
      const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json " }
      }
      try {
        const response = await fetch("http://localhost/mistral_projekt/get_model.php", requestOptions)
        if (!response.ok) {
          const error = `Fehler : ${response.status} - ${response.statusText}`
          throw new Error(error)
        }
        const data = await response.json()
        for (let i = 0; i < data.length; i++) {
          this.modelList[data[i].modell_api] = data[i].modell_name
        }
        //this.modelList.push(data[0].modell_name)


      }
      catch (error) {
        console.error("Fehler bei Übermittlung:", error)
        if (error.message.includes('Failed to fetch')) {
          alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          alert('Fehler bei der Übermittlung: ' + error.message)
        }
      }
    },

    async createSkill() {

      (async () => {
        const input = this.modelList

        const { value: formValues } = await Swal.fire({
          title: "Create a new skill",
          html: `
            <label for="select">Select a Model</label>
            <select id="select" class="swal2-select">
                <option value="" disabled selected>Select a model</option>
                ${Object.keys(input)
              .map(key => `<option value="${key}">${input[key]}</option>`)
              .join("")}
            </select>
            <br>
            <label for="model">Give name to your custom skill</label>
            <input id="model" class="swal2-input" placeholder="Enter skill name">
        `,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Create new skill",
          focusConfirm: false,
          preConfirm: () => {
            return {
              selectedModel: document.getElementById("select").value,

              skillName: document.getElementById("model").value
            };
          }
        });

        if (formValues) {
          const modell = input[formValues.selectedModel]
          const skill = formValues.skillName
          Swal.fire(`You selected: ${input[formValues.selectedModel] || "None"}<br>Custom Skill: ${formValues.skillName} ` + modell);

          const requestOptions = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              custom_name: skill,
              mistral_version: modell
            })
          }
          try {
            const response = await fetch("http://localhost/mistral_projekt/create_skill.php", requestOptions);
            if (!response.ok) {
              const error = `Fehler: ${response.status} - ${response.statusText}`
              throw new Error(error)
            }
            const data = await response.json()
            this.getSkill_list
            //alert(data + "sadx")
          }
          catch (error) {
            console.error("Fehler bei übermittlung", error)
            if (error.message.includes("Failed to fetch")) {
              alert(">Failed to fetch")
            } else {
              alert(alert('Fehler bei der Übermittlung: ' + error.message))
            }
          }


        }
        else {
          Swal.fire("You should pick something")
        }
      })()
    },

    async getSkill_list() {
      const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json " }
      }
      try {
        const response = await fetch("http://localhost/mistral_projekt/getSkill_list.php", requestOptions)
        if (!response.ok) {
          const error = (`Fehler`, error)
          throw new Error(error)

        }
        const data = await response.json()
        this.skillList = data

      } catch (error) {
        console.error("Fehler bei übermittlung Get_skill", error)
        if (error.message.includes("Failed to fetch")) {
          alert("Failed to fetch")
        } else {
          alert(alert('Fehler bei der Übermittlung: Get_skill ' + error.message))
        }
      }
    },
    sendData() {
      this.$store.commit('setData', this.selected_skill);
      // alert(this.$store.state.data)
    }





    //   preConfirm: () => {
    //     return [
    //       document.getElementById("model").value,
    //     ];
    //   }
    // });

    // if (formValues) {
    //   Swal.fire(`You selected: ${formValues}`);

    // const requestOptions = {
    //   method: "POST",
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     custom_name: formValues[0],
    //     mistral_version: "mistral-small-latest"
    //   })
    // }
    // try {
    //   const response = await fetch("http://localhost/mistral_projekt/create_model.php", requestOptions)

    //   if (!response.ok) {
    //     const error = `Fehler: ${response.status} - ${response.statusText}`
    //     throw new Error(error)
    //   }
    //   alert(JSON.stringify(response))
    // }

    // catch (error) {
    //   console.error('Es gab einen Fehler bei der Übermittlung:', error)
    //   if (error.message.includes('Failed to fetch')) {
    //     alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
    //   } else {
    //     alert('Fehler bei der Übermittlung: ' + error.message)
    //   }
    // }

    //   }
    // })()
    // }
  },
  mounted() {
    this.getModel();
    this.getSkill_list()
  }
}
</script>

<template>
  <div class="main-bereich">
    <div class="create_bereich">
      <p>Skills</p>
      <button v-on:click="createSkill">Create new skill</button>
    </div>
    <div class="skill-list">
      <RouterLink class="router" to="/Configuration"><button class="skill" v-for="skill in skillList" :key="skill.id"
          v-on:click="selected_skill = skill.skill_name; skill.skill_name = selected_skill; sendData()">{{
            skill.skill_name }}
          <!--  {{ skill.skill_id }}${{ skill.modell_name }} -->
        </button></RouterLink>

    </div>



  </div>
  <!-- <button v-on:click="sendData"> click ME!</button> -->
  <!-- <div class="main-bereich">
    <div class="model-create-buttom">
      <button @click="sendPromptToBackend">
        <img src="../components/icons/chat-dots-fill.svg" alt="send messege" />
      </button>
      <input v-model="prompt" placeholder="Ask Something..." />
    </div>
    <div class="response-bereich">
      <p>{{ response }}</p>
    </div>
  </div> -->
  <!-- <footer>
    <div class="references">
      <div class="link_to_hdp"><a href="https://www.hdp-management.com/">HDP_Web-Seite</a></div>
    </div>
  </footer> -->
</template>
<style scoped>
html,
body {
  box-sizing: border-box;
}

.main-bereich {
  height: auto;
  min-height: 400px;
  width: auto;
  min-width: 300px;
  background-color: rgb(239, 245, 245);
  margin: 30px;
  padding: 30px;
  right: 100px;
  border-radius: 20px;
  border: 1px solid rgba(114, 113, 113, 0.1);

}

.create_bereich {
  position: relative;
  width: 100%;
  min-width: 100px;
  height: 50px;
  min-height: 50px;
  /* background-color: rgb(243, 241, 241);
  border: 1px solid rgb(172, 168, 168, 0.2); */
  border-radius: 6px;
  align-content: center;
  display: flex;
  justify-content: space-between;

}

.create_bereich>p {
  width: 150px;
  height: 100%;
  justify-content: center;
  display: flex;
  align-content: center;
  flex-wrap: wrap;
}

.create_bereich>button {
  background-color: rgb(225, 240, 240);
  border-radius: 7px;
  border: 1px solid rgb(128, 128, 128, 0.4);
  height: 100%;
  width: 150px;
  margin-left: 20px;

}

.skill-list {
  width: 100%;
  height: auto;
  background-color: rgb(230, 236, 236);
  border-radius: 10px;
  margin-top: 30px;
  padding: 15px;
  display: flex;

}

.router {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: start;
  text-decoration: none;

}

.skill {
  width: auto;
  min-width: 220px;
  height: auto;
  min-height: 130px;
  border: 1px solid rgb(128, 128, 128, 0.3);
  border-radius: 10px;
  margin: 5px 15px 0 10;
  justify-content: center;
  display: flex;
  align-items: center;


}


.response-bereich {
  width: 1200px;
  min-width: 800px;
  height: 300px;
  background-color: azure;
  position: absolute;
  top: 100px;
  left: 30px;
  border: 1px solid rgba(132, 134, 134, 0.2);
  border-radius: 12px;
}

.response-bereich>p {
  padding: 16px;
}




::placeholder {
  padding: 0px;
  font-style: italic;
  font-size: 20px;
}
</style>
