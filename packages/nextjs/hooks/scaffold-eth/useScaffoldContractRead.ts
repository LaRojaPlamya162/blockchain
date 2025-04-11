import { useReadContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";
import externalContracts from "~~/contracts/externalContracts";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

interface UseScaffoldContractReadProps {
  contractName: keyof typeof deployedContracts;
  functionName: string;
  args?: any[];
}

export function useScaffoldContractRead({ contractName, functionName, args = [] }: UseScaffoldContractReadProps) {
  const { targetNetwork } = useTargetNetwork();
  const chainId = targetNetwork.id;

  const contract = deployedContracts[contractName]?.[chainId] || externalContracts[contractName]?.[chainId];

  return useReadContract({
    address: contract?.address,
    abi: contract?.abi,
    functionName,
    args,
  });
}
