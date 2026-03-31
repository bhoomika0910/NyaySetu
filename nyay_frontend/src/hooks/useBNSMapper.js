import { useMutation } from "@tanstack/react-query";
import { mapBNS } from "../services/api";

export function useBNSMapper() {
  return useMutation({
    mutationFn: mapBNS
  });
}
