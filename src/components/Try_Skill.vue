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
      url: null,
      frage: null,
      label: null,
      type: null,
      Antworten: null,
      pdfUrl: null,
      url: null,
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
          Authorization: 'Bearer dBFznnVVDkfgvHricnDdXAljjvngXkjQ',
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

        this.askModel()
      } catch (error) {
        console.error('Es gab einen Fehler bei der Übermittlung:getURL', error)

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
          model: 'mistral-small-latest',
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
        //this.frageObject = []
        const data = await response.json()
        //const splitted_Antwort = data.choices[0].message.content.split("Lable:")
        this.Antworten = data.choices[0].message.content.split("#")
        // this.document = data.choices[0].message.content[0].document_url

        // alert(this.Antworten)
      } catch (error) {
        console.error('Es gab einen Fehler bei der Übermittlung: Ask modell', error)

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
        //alert(data[0].modell_api)
        //alert(JSON.stringify(data))
        for (let i = 0; i < data.length; i++) {
          this.frageObject.push({
            type: "text",
            text: this.globalInstruction + data[i].instructions,
          })
        }

      } catch (error) {
        console.error(
          'Es gab einen Fehler bei der Übermittlung:Labels können nicht gezogen werden ',
          error,
        )

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
      <li class="label-header">label</li>
      <li class="value-header">Value</li>
    </ul>
    <div class="modell-antwort-bereich">

      <ul>
        <li class=" label" v-for="prompt in prompts" :key="prompt.label_id">{{ prompt.label }}{{ Antwort }}</li>
      </ul>
      <ul>
        <li class="value" v-for="Antwort in Antworten" :key="Antwort.id">{{ Antwort }}</li>
      </ul>
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

/* .modell-overview-container {
  margin: 50px 100px 0 0;
  height: 150px;
  width: 90%;
  background-color: lightgray;
  display: flex;
  flex-wrap: wrap;
  border-radius: 10px;
  min-width: 500px;
} */

/* [class*='col-'] {
  float: left;
  min-height: 1px;
}

.col-1 {
  width: 100%;
  padding: 16px;
}

[class*='col-2'] {
  padding: 16px;
  font-size: 0.8rem;
}

.col-2-1 {
  padding: 13px 15px 5px 5px;
  opacity: 1;
}

.col-2-2 {
  width: auto;
  margin: 0%;
  padding: 13px 10px 5px 5px;
  opacity: 0.5;
}

.col-2-3 {
  width: 10%;
  padding: 0px 0 0 5px;
} */

/* .row-drop-down-label-menu {
  height: 50px;
  width: 100%;
  min-width: 500px;
}

.row-modeloverwiew {
  height: 50px;
  width: 100%;
} */

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

/* .row-drop-down-label-menu>button {
  width: auto;
  height: 45px;
  background-color: rgb(199, 205, 211);
  border-radius: 7px;
  margin-top: 4px;
}

.row-drop-down-label-menu>button img {
  width: 30px;
  height: auto;
  margin-top: 13px;
} */

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
  width: 180px;
  height: auto;
  min-width: 100px;
  border-right: 1px solid black;

}

.value-header {
  width: 200px;
  height: auto;
  margin-left: 5px;
  display: inline;
}

.label {
  width: 180px;
  height: auto;
  min-width: 100px;
  margin-top: 10px;
  display: block;
}

.value {
  width: auto;
  max-width: 340px;
  height: auto;
  min-width: 100px;
  margin-top: 10px;
  display: block;

}


.modell-antwort-bereich {
  width: 550px;
  height: auto;
  min-height: 400px;
  background-color: rgb(238, 234, 230);
  margin-left: 20px;
  border-radius: 10px;
  display: flex;

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
</style>
