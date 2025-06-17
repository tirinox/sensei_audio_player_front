<template>
    <div v-if="store.loginWindowVisible">
        <!-- Modal Dialog -->
        <v-dialog persistent max-width="400" v-model="store.loginWindowVisible">
            <v-card>
                <v-card-title>
                    Введите код доступа
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" @submit.prevent="submit">
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
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {useAccess} from '@/stores/userProtection'

// Setup Pinia store
const store = useAccess()

// Access code input and validation state
const accessCode = ref('')

const failedToAccess = ref(false)

const incorrectCode = () => {
    if (failedToAccess.value) {
        return 'Неверный код доступа'
    }
    return true
}

// Validation rules

// Send access code
const submit = async () => {
    const passed = await store.submitAccessCode(accessCode.value)
    if (!passed) {
        // Show error message
        failedToAccess.value = true
        // force update validation state
        accessCode.value = ''
        console.log('Access code is incorrect')
    }
}

</script>
