<template>

    <v-main class="d-flex align-center justify-center fill-height">
        <AccessCodeDialog></AccessCodeDialog>

        <v-container class="text-center">
            <!-- Logo -->
            <v-img
                src="logo.png"
                contain
                max-width="150"
                class="mb-6 rounded-circle elevation-4"
            />

            <!-- Spinner -->
            <v-progress-circular
                indeterminate
                size="48"
                color="primary"
                v-if="accessStore.isLoading"
            />
        </v-container>
    </v-main>

</template>

<script setup>
// No script logic needed for static loading screen
import AccessCodeDialog from "@/components/AccessCodeDialog.vue";
import {onMounted} from "vue";
import {useAccess} from "@/stores/userProtection.js";

const accessStore = useAccess()

onMounted(() => {
    accessStore.loadOnStart()
});

</script>

<style scoped>
.v-img {
    margin: 0 auto;
}
</style>