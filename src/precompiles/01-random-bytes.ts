import type { ExecResult } from "@nomicfoundation/ethereumjs-evm";
import type { PrecompileInput } from "@nomicfoundation/ethereumjs-evm/dist/precompiles";
import { ethers } from "ethers-v5";
import nacl from "tweetnacl";

export function precompile01(opts: PrecompileInput): ExecResult {
  // TODO: more accurate gas usage in precompiles
  const gasUsed = BigInt(100_000);

  const abiCoder = new ethers.utils.AbiCoder();
  const inputs = abiCoder.decode(["uint256 numBytes", "bytes pers"], opts.data);

  const result = Buffer.from(nacl.randomBytes(inputs.numBytes.toNumber()));

  return {
    executionGasUsed: gasUsed,
    returnValue: result,
  };
}
