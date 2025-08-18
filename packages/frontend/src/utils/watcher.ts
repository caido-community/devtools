type ConnectedMessage = {
  kind: "connected";
  downloadUrl: string;
  packageId: string;
};

type RebuildMessage = {
  kind: "rebuild";
  downloadUrl: string;
};

type ErrorMessage = {
  kind: "error";
  error: string;
};

const isRebuildMessage = (data: unknown): data is RebuildMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return "kind" in data && data.kind === "rebuild" && "downloadUrl" in data;
};

const isConnectedMessage = (data: unknown): data is ConnectedMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return (
    "kind" in data &&
    data.kind === "connected" &&
    "downloadUrl" in data &&
    "packageId" in data
  );
};

const isErrorMessage = (data: unknown): data is ErrorMessage => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return "kind" in data && data.kind === "error" && "error" in data;
};

export const toMessage = (
  event: MessageEvent,
): RebuildMessage | ErrorMessage | ConnectedMessage | undefined => {
  try {
    const parsed = JSON.parse(event.data as string);
    if (
      isRebuildMessage(parsed) ||
      isConnectedMessage(parsed) ||
      isErrorMessage(parsed)
    ) {
      return parsed;
    } else {
      return;
    }
  } catch (error) {
    return;
  }
};
