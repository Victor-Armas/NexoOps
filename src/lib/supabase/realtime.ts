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

export function subscribeToTableChanges({
  channelName,
  table,
  event = "*",
  filter,
  onChange,
}: SubscribeToTableChangesParams): RealtimeChannel {
  return supabase
    .channel(channelName)
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
