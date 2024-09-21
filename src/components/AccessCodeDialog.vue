<template>
  <v-container>
    <!-- Modal Dialog -->
    <v-dialog v-model="store.accessRequired" persistent max-width="400">
      <v-card>
        <v-card-title>
          Введите код доступа
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
                v-model="accessCode"
                :rules="[required, validCode]"
                label="Код доступа"
                required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :disabled="!validCode" color="success" @click="store.submitAccessCode(accessCode)">Отправить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import {ref} from 'vue'
import {useAccess} from '@/stores/userProtection'

// Setup Pinia store
const store = useAccess()

// Access code input and validation state
const accessCode = ref('')

// Validation rules
const required = value => !!value || 'Поле обязательно для заполнения'
const validCode = value => store.validateAccessCode(value) || 'Неверный код доступа'

</script>

<style scoped>
/* Add any specific styling here */
</style>
