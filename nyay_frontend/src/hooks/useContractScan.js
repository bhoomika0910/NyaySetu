import { useMutation, useQuery } from "@tanstack/react-query";
import { scanContract, analyzeCase } from "../services/api";

export function useContractScan() {
  return useMutation({
    mutationFn: scanContract
  });
}

export function useCaseAnalysis(payload, enabled) {
  return useQuery({
    queryKey: ["case-analysis", payload],
    queryFn: () => analyzeCase(payload),
    enabled
  });
}
