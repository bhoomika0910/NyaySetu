import { useMutation } from "@tanstack/react-query";
import { queryLegal } from "../services/api";

export function useLegalQuery() {
  return useMutation({
    mutationFn: queryLegal
  });
}
