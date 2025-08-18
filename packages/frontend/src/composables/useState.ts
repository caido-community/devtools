import { ref } from "vue";

type State =
  | { kind: "Idle" }
  | { kind: "Connecting"; url: string }
  | { kind: "Connected"; ws: WebSocket };

export const useState = () => {
  const state = ref<State>({ kind: "Idle" });
  const setState = (newState: State) => {
    state.value = newState;
  };

  return {
    state,
    setState,
  };
};
