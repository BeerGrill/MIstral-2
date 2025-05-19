<script>
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import chevronDown from './icons/chevron-down.vue'
import axios from 'axios'




export default {
  name: 'YourComponentName',
  components: {
    chevronDown
  },
  data() {
    return {
      zuLang: false,
      Namenskonvention: true,
      modelList: [],
      skillList: {},
      selected_skill: null,
      selected_skill_id: null,
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
          // this.modelList[data[i].modell_api] = data[i].modell_name
          this.modelList[i] = data[i].modell_name
        }
        // console.log(this.modelList)



      }
      catch (error) {
        // console.error("Fehler bei Übermittlung:", error)
        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: ' + error.message)
        }
      }
    },

    async createSkill() {
      const input = this.modelList;

      const { value: formValues, isConfirmed } = await Swal.fire({
        title: "Create a new skill",
        html: `
      <label for="select">Select a Model</label>
      <select id="select" class="swal2-select">
        <option value="" disabled selected>Select a model</option>
        ${Object.keys(input)
            .map(key => `<option value="${input[key]}">${input[key]}</option>`)
            .join("")}
      </select>
      <br>
      <label for="skill">Give name to your custom skill</label>
      <input id="skill" class="swal2-input" placeholder="Enter skill name">
    `,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Create new skill",
        focusConfirm: false,
        preConfirm: () => {
          const pattern = /^[a-zA-ZäöüÄÖÜß_0-9]+$/;
          const selectedModel = document.getElementById("select").value;
          const skillName = document.getElementById("skill").value;

          if (!selectedModel || !skillName) {
            Swal.showValidationMessage('Modell und Skillname dürfen nicht leer sein!');
            return false;
          }

          if (skillName.length > 45) {
            Swal.showValidationMessage('Der Skillname darf nicht länger als 45 Zeichen sein!');
            return false;
          }

          if (!pattern.test(skillName)) {
            Swal.showValidationMessage('Der Skillname darf nur Buchstaben, Ziffern und Unterstriche enthalten!');
            return false;
          }

          return {
            selectedModel,
            skillName
          };
        }
      });

      // Wenn der Benutzer bestätigt hat und gültige Eingaben geliefert wurden
      if (isConfirmed && formValues) {
        const requestData = {
          custom_name: formValues.skillName,
          version: formValues.selectedModel
        };

        try {
          const response = await axios.post('http://localhost/mistral_projekt/create_skill.php', requestData);
          // console.log("Erfolgreich erstellt:", response.data);
          Swal.fire("Erfolg", `Skill wurde erfolgreich erstellt: ${formValues.skillName} ${formValues.selectedModel} `, "success");
        } catch (error) {
          // console.error("Fehler beim Erstellen:", error);
          Swal.fire("Fehler", "Skill konnte nicht erstellt werden", "error");
        }
      }
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
        // console.error("Fehler bei übermittlung Get_skill", error)
        if (error.message.includes("Failed to fetch")) {
          // alert("Failed to fetch")
        } else {
          // alert(alert('Fehler bei der Übermittlung: Get_skill ' + error.message))
        }
      }
    },
    sendData() {
      this.$store.commit('setData', this.selected_skill);
      // alert(this.$store.state.data)
    },

    showDeleteConfirmation() {
      Swal.fire({
        title: "Bitte bestätigen Sie das Löschen!",

        showCancelButton: true,
        confirmButtonText: "Löschen",
        cancelButtonText: "Abbrechen",
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.deleteSkill()
          location.reload();
          Swal.fire("Gelöscht!", "", "success");
        }
      })
    },

    async deleteSkill() {
      const requestData = { skill_id: this.selected_skill_id }

      axios.post("http://localhost/mistral_projekt/deleteSkill.php", requestData)
        .then(response => {
          // console.log('Erfolg:', response.data);
        })
        .catch(error => {
          // console.error('Fehler:', error);
        });
    },

    async showRenameConfirmation() {
      const pattern = /^[a-zA-ZäöüÄÖÜß_0-9]+$/;
      const { value: neu_skill_name } = await Swal.fire({
        title: "Geben Sie einen Namen ein",
        input: "text",

        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "Kann nicht leer sein";
          } if (!pattern.test(value)) {
            return 'Der Skillname darf nur Buchstaben, Ziffern und Unterstriche enthalten!';
          }
        }
      });
      if (neu_skill_name) {
        this.renameSkill(neu_skill_name);
        Swal.fire("Skill wurde erfolgreich umbenannt", "", "success");
      }

    },

    renameSkill(neu_skill_name) {
      const requestData = {
        skill_id: this.selected_skill_id,
        neu_skill_name: neu_skill_name
      };
      axios.post("http://localhost/mistral_projekt/renameSkill.php", requestData)
        .then(response => {
          // console.log('Erfolg', response.data);
          location.reload();
        })
        .catch(error => {
          // console.log('fehler', error)
        })
    }

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


      <div class="skill" v-for="skill in skillList" :key="skill.id">
        <!--  -->
        <RouterLink class="skill-router" to="/Configuration"
          v-on:click="selected_skill = skill.skill_name; skill.skill_name = selected_skill; sendData(); console.log(selected_skill)">
          <div class="skill-nav">
            <p>
              {{ skill.skill_name }}</p>
          </div>
        </RouterLink>


        <div class="skill-config-dropdown clearfix">
          <chevron-down id="skill-chevron" />
          <div class="config-nav clearfix">
            <ul>
              <li><button
                  v-on:click="selected_skill_id = skill.skill_id; showDeleteConfirmation(); console.log(selected_skill_id)">Löschen</button>
              </li>
              <li><button
                  v-on:click="selected_skill_id = skill.skill_id; showRenameConfirmation(); console.log(selected_skill_id)">Umbenennen</button>
              </li>
              <li><button
                  v-on:click="selected_skill_id = skill.skill_id; console.log(selected_skill_id)">Klonnen</button>
              </li>
            </ul>
          </div>
        </div>
      </div>


    </div>
  </div>




</template>
<style scoped>
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}

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
  flex-wrap: wrap;
  gap: 20px;
  justify-content: start;
  text-decoration: none;

}

.skill-router {
  width: 100%;
  height: 100%;
  text-decoration: none;
  display: flex;
  justify-content: center;
}

.skill {
  width: auto;
  min-width: 220px;
  height: auto;
  min-height: 130px;
  border: 1px solid rgb(128, 128, 128, 0.3);
  border-radius: 10px;
  margin: 5px 15px 0 10;
  display: flex;
  flex-direction: column;
}

.skill-nav {
  display: flex;
  align-items: center;
  color: black;

}

.skill-nav>p {
  text-decoration: dotted;
  font-size: 20px;
}

.skill-config-dropdown {

  border-top: 1px solid rgb(128, 128, 128, 0.4);
  /* width: 100%; */
  position: relative;
  display: inline-block;


}

.skill-config-dropdown:hover>.config-nav {
  display: block;
}

.config-nav {
  position: absolute;
  left: 0px;
  top: 30px;
  width: 100%;
  display: none;

}

.config-nav>ul>li>button {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-decoration: none;
  box-shadow: none;
  outline: none;
  height: 100%;
  width: 100%;

}

.config-nav>ul>li>button:hover {
  background-color: rgb(190, 190, 190);
}

ul {
  padding: 0;
}



.config-nav>ul>li {
  background-color:
    rgb(221, 221, 221);
  display: block;
  height: 45px;

  text-align: center;
  font-size: 20px;
  border-top: 1px solid rgb(0, 0, 0, 0.3);
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
