<template>
  <v-container v-if="visible">
    <!-- Modal Dialog -->
    <v-dialog persistent max-width="400" v-model="visible">
      <v-card>
        <v-card-title>
          Введите код доступа
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field
                v-model="accessCode"
                :rules="[incorrectCode]"
                label="Код доступа"
                required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="submit">Отправить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {computed, ref} from 'vue'
import {useAccess} from '@/stores/userProtection'

// Setup Pinia store
const store = useAccess()

const visible = computed(() => !store.accessGranted)

// Access code input and validation state
const accessCode = ref('')

const loading = ref(false)

const failedToAccess = ref(false)

const incorrectCode = () => {
  if(failedToAccess.value) {
    return 'Неверный код доступа'
  }
  return true
}

// Validation rules
const required = value => !!value || 'Поле обязательно для заполнения'

// Send access code
const submit = async () => {
  loading.value = true
  try {
    const passed = await store.submitAccessCode(accessCode.value)
    if(!passed) {
      // Show error message
      failedToAccess.value = true
      // force update validation state
      accessCode.value = ''

      console.log('Access code is incorrect')
    }
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* Add any specific styling here */
</style>
