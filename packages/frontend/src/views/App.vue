<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Card from "primevue/card";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";


import { useSDK } from "@/plugins/sdk";

import { ref } from "vue";

// Retrieve the SDK instance to interact with the backend
const sdk = useSDK();

const myVar = ref("Hello World");

// Call the backend to generate a random string
const onGenerateClick = async () => {
  const result = await sdk.backend.generateRandomString(10);
  myVar.value = result;
};

const serverUrl = ref('');
</script>

<template>
  <div class="h-full flex justify-center items-center">
    <Card class="w-full h-full">
      <template #title>
        <h1 class="text-lg">Devtools</h1>
      </template>
      <template #content>
        <div>
          <div class="flex flex-col gap-2">
            <label for="server-url" class="text-sm text-surface-300">Server URL</label>
            <InputGroup>
              <InputText id="server-url" v-model="serverUrl" placeholder="Enter server URL" />
              <InputGroupAddon>
                <Button label="Connect" @click="onGenerateClick" />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>