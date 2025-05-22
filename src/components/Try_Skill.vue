<script>
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

export default {
  name: 'App',
  components: {},
  // props: {
  //   labelname: String,
  // },
  data() {
    return {
      test: [
        { label: 'Geburtsdatum des Kunden', antwort: 'Nicht gefunden' },
        {
          label: 'Adresse des Nachunternehmer',
          antwort: 'Alt-Moabit 91, 10559 Berlin'
        }
      ]
      ,
      frage: null,
      label: null,
      type: null,
      Antworten: [],
      pdfUrl: null,
      url: null,   ///file URL
      fileId: null,
      file: null,
      prompts: [],
      frageObject: [],
      globalInstruction: null,
      modell_api: null,
    }
  },
  computed: {
    receivedData() {
      // alert(this.$store.state.data);
    },
  },
  methods: {
    uploadImage() {
      ; (async () => {
        const { value: file } = await Swal.fire({
          title: 'Select image',
          input: 'file',
          inputAttributes: {
            accept: 'application/pdf',
            'aria-label': 'Upload your profile picture',
          },
        })
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.pdfUrl = URL.createObjectURL(file)
            this.file = file
            this.getFileId()
          }
          reader.readAsDataURL(file)
        }
      })()
    },
    // get id von testende Datei
    async getFileId() {
      if (!this.file) {
        // alert('No file uploaded yet!')
        return
      }
      const formData = new FormData()
      formData.append('purpose', 'ocr')
      formData.append('file', this.file)
      const requestOptions = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 'Your bearer Token',
        },
        body: formData,
      }
      try {
        const response = await fetch('https://api.mistral.ai/v1/files', requestOptions)
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        const data = await response.json()
        this.fileId = data.id
        this.getURL()
      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung:getFileId', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung:getFileId ' + error.message)
        }
      }
    },

    async getURL() {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dBFznnVVDkfgvHricnDdXAljjvngXkjQ',
        },
      }
      try {
        const response = await fetch(
          'https://api.mistral.ai/v1/files/' + this.fileId + '/url?expiry=24',
          requestOptions,
        )
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        const data = await response.json()
        this.url = data.url
        // 
        this.askModel()
      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung:getURL', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: getURL' + error.message)
        }
      }
    },

    async askModel() {
      this.frageObject.push({
        type: 'document_url',
        document_url: this.url,
      })
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dBFznnVVDkfgvHricnDdXAljjvngXkjQ',
        },
        body: JSON.stringify({
          model: 'mistral-small-latest', //7 modell variable
          messages: [
            {
              role: 'user',
              content: this.frageObject,
            },
          ],
        }),
      }

      try {
        const response = await fetch(this.modell_api, requestOptions)

        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        const data = await response.json()

        const objekt = "[" + data.choices[0].message.content.replace(/'/g, '"') + "]"
        this.Antworten = JSON.parse(objekt)
        // console.log(objekt)


      } catch (error) {
        // console.error('Es gab einen Fehler bei der Übermittlung: Ask modell', error)

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung: Ask modell ' + error.message)
        }
      }
    },
    async get_Prompts() {
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: this.$store.state.data
        })
      }
      try {
        const response = await fetch(
          'http://localhost/mistral_projekt/Get_labels_2.php',
          requestOptions,
        )
        if (!response.ok) {
          const error = `Fehler:" ${response.status} - ${response.statusText}}`
          throw new Error(error)
        }
        const data = await response.json()
        this.prompts = data
        this.globalInstruction = data[0].modell_verhalten
        this.modell_api = data[0].modell_api

        for (let i = 0; i < data.length; i++) {
          this.frageObject.push({
            type: "text",
            text: this.globalInstruction + data[i].instructions,
          })

        }

      } catch (error) {
        // console.error(
        //   'Es gab einen Fehler bei der Übermittlung:Labels können nicht gezogen werden ',
        //   error,
        // )

        if (error.message.includes('Failed to fetch')) {
          // alert('Der Server ist nicht erreichbar. Bitte überprüfen Sie Ihre Verbindung.')
        } else {
          // alert('Fehler bei der Übermittlung:Labels können nicht gezogen werden ' + error.message)
        }
      }
    },
  },
  mounted() {
    this.get_Prompts();

  },
}
</script>

<template>
  <div class="label_bereich">
    <ul style="padding: 20px 0 0 20px; margin-left: 20px">
      <li class="label-header">Label</li>
      <li class="value-header">Value</li>
    </ul>
    <!-- <div class="modell-antwort-bereich">
      <div class="label-antwort-box">
        <div class="label">
          <p v-for="prompt in prompts" :key="prompt.label_id">{{ prompt.label }}</p>
        </div>
        <div class="value">
          <p v-for="Antwort in Antworten" :key="Antwort.id">{{ Antwort }}</p>
        </div>
      </div>
    </div> -->
    <div v-for="antwort in Antworten" :key="antwort.label_id" class="label-value-row">
      <span class="label">{{ antwort.label }}</span>
      <span class="value">{{ antwort.antwort }}</span>
    </div>

  </div>
  <div class="main-bereich">
    <!-- <div class="modell-overview-container">
      <div class="row-modeloverwiew">
        <div class="col-1">Placeholder - Modell overview</div>
      </div> 

    <div class="row-drop-down-label-menu">
        <button v-on:click.left="get_Prompts">
          <div class="col-2-1">The Agentic skill was trained to recognize # labels</div>
          <div class="col-2-2">Click to view labels</div>
          <img src="../components/icons/cloud-download.svg" alt="dd-menü" class="col-2-3" />
        </button>
      </div>
  </div>  -->

    <div class="upload-button-container">
      <div class="upload-button">
        <button v-on:click.left="uploadImage">
          <p style="display: inline">Upload document</p>
          <img src="../components/icons/cloud-download.svg" alt="download_logo" />
        </button>
      </div>
      <!-- <button v-on:click.left="get_Prompts">
        <p style="display: inline">AskModel_test</p>
      </button> -->
    </div>
    <div class="dokument_bereich">
      <iframe v-bind:src="pdfUrl" width="100%" height="1000px"></iframe>
    </div>
  </div>
</template>

<style scoped>
.main-bereich {
  margin-left: 30%;
  height: 100%;
}

.upload-button-container {
  width: 90%;
  height: 75px;
  background-color: rgb(234, 236, 236);
  border-radius: 10px;
  display: flex;
  margin-top: 20px;
  float: left;
  min-width: 500px;
}


.upload-button>button {
  border-radius: 5px;
  background-color: #383e74;
  color: aliceblue;
  margin: 20px 0 0 10px;
}

.upload-button>button>p {
  margin-bottom: 0px;
  margin-right: 0px;
  padding: 10px 10px 5px 5px;
}

.upload-button>button>img {
  width: 25px;
  height: auto;
  border: 1px solid;
  border-radius: 10px;
  background-color: rgb(255, 255, 255);
}

.label_bereich {
  width: 600px;
  height: auto;
  min-height: 500px;
  background-color: #c6c8dd;
  position: absolute;
  top: 70px;
  border-radius: 10px;
  margin-left: 10px;
}

ul>li {
  display: inline-block;
  width: 100%;
}

.label-header {
  width: 40%;
  height: auto;
  min-width: 100px;
  border-right: 1px solid black;

}

.value-header {
  width: 60%;
  height: auto;
  margin-left: 5px;
  display: inline;
}

.label {
  width: 40%;
  height: auto;
  min-width: 100px;
  margin-top: 10px;
  display: block;
  margin-left: 17px;
  border-bottom: 1px, solid black;
}

.value {
  width: 60%;
  max-width: 340px;
  height: auto;
  min-width: 100px;
  margin-top: 10px;
  display: block;

}


.modell-antwort-bereich {
  width: 93%;
  height: auto;
  min-height: 400px;
  background-color: rgb(238, 234, 230);
  margin-left: 20px;
  border-radius: 10px;
  display: flex;

}

.label-antwort-box {
  width: 100%;
  height: auto;
  background-color: aqua;
  justify-content: space-between;
  display: flex;
  border-bottom: 1px solid grey;
  flex-direction: column;

}


.modell-antwort-bereich>ul {
  padding: 20px 0 0 20px;
  width: auto;
  height: auto;

}



.dokument_bereich {
  width: 950px;
  height: auto;
  display: flex;
  margin-top: 80px;
}


.label-value-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
  border-bottom: 1px solid rgb(184, 182, 182);
  margin-bottom: 0.5em;
  /* optional, falls zu wenig Platz da ist */
}

.label {
  font-weight: bold;
  white-space: nowrap;
}

.value {
  flex: 1;
  min-width: 0;
  overflow-wrap: break-word;
}
</style>
