import { ethers } from "ethers";

export interface Department {
  name: string;
  departmentHead: string;
  budget: ethers.BigNumber;
  logoUri?: string;
}

export interface ContractTransaction extends ethers.ContractTransaction {
  wait: () => Promise<ethers.ContractReceipt>;
}
