import { useMutation } from "@tanstack/react-query";
import { draftFIR } from "../services/api";

export function useFIRDraft() {
  return useMutation({
    mutationFn: draftFIR
  });
}
