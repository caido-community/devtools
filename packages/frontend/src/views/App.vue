<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import InputText from "primevue/inputtext";
import Tag from "primevue/tag";
import TextArea from "primevue/textarea";

import { useForm } from "./useForm";

const {
  serverUrl,
  forceUninstall,
  onSubmit,
  state,
  onDisconnect,
  logs,
  onClearLogs,
} = useForm();
</script>

<template>
  <div class="h-full flex justify-center items-center">
    <Card
      class="w-full h-full"
      pt:body:class="p-4 h-full flex flex-col"
      pt:content:class="h-full"
    >
      <template #title>
        <h1 class="text-lg">Devtools</h1>
      </template>
      <template #content>
        <div class="flex flex-col gap-4 h-full">
          <div class="flex flex-col gap-2">
            <label for="server-url" class="text-sm text-surface-300"
              >Server URL</label
            >
            <InputGroup>
              <InputGroupAddon>
                <Tag
                  v-if="state.kind === 'Connected'"
                  value="Connected"
                  severity="success"
                />
                <Tag
                  v-else-if="state.kind === 'Connecting'"
                  value="Connecting"
                  severity="info"
                />
                <Tag v-else value="Not Connected" severity="info" />
              </InputGroupAddon>
              <InputText
                id="server-url"
                v-model="serverUrl"
                placeholder="Enter server URL"
              />
              <InputGroupAddon>
                <Button
                  v-if="state.kind === 'Idle'"
                  label="Connect"
                  @click="onSubmit"
                />
                <Button
                  v-else-if="state.kind === 'Connecting'"
                  label="Connecting..."
                />
                <Button
                  v-else-if="state.kind === 'Connected'"
                  severity="danger"
                  label="Disconnect"
                  @click="onDisconnect"
                />
              </InputGroupAddon>
            </InputGroup>
            <div class="flex gap-2 items-center">
              <Checkbox v-model="forceUninstall" binary />
              <label class="text-nowrap"
                >Force uninstall between rebuilds</label
              >
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <div class="flex items-end justify-between">
              <label for="logs" class="text-sm text-surface-300">Logs</label>
              <Button severity="danger" label="Clear" @click="onClearLogs" />
            </div>
            <TextArea
              id="logs"
              readonly
              placeholder="Logs will appear here..."
              :model-value="logs"
              class="flex-1 resize-none"
            ></TextArea>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
