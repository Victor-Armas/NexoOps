import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./client";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

type SubscribeToTableChangesParams = {
  channelName: string;
  table: string;
  event?: RealtimeEvent;
  filter?: string;
  onChange: () => void;
};

let channelSequence = 0;

function createUniqueChannelName(baseName: string) {
  channelSequence += 1;

  return `${baseName}:${Date.now()}:${channelSequence}`;
}

export function subscribeToTableChanges({
  channelName,
  table,
  event = "*",
  filter,
  onChange,
}: SubscribeToTableChangesParams): RealtimeChannel {
  const uniqueChannelName = createUniqueChannelName(channelName);

  return supabase
    .channel(uniqueChannelName)
    .on(
      "postgres_changes",
      {
        event,
        schema: "public",
        table,
        filter,
      },
      () => {
        onChange();
      },
    )
    .subscribe();
}
