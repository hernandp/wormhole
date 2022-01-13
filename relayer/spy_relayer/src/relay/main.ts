import { importCoreWasm } from "@certusone/wormhole-sdk/lib/cjs/solana/wasm";

import {
  ChainId,
  CHAIN_ID_SOLANA,
  CHAIN_ID_TERRA,
  hexToUint8Array,
  isEVMChain,
  parseTransferPayload,
} from "@certusone/wormhole-sdk";

import { logger } from "../helpers";
import { env } from "../configureEnv";
import { relayEVM } from "./evm";
import { relaySolana } from "./solana";
import { relayTerra } from "./terra";

function getChainConfigInfo(chainId: ChainId) {
  return env.supportedChains.find((x) => x.chainId === chainId);
}

export async function relay(signedVAA: string): Promise<any> {
  const { parse_vaa } = await importCoreWasm();
  const parsedVAA = parse_vaa(hexToUint8Array(signedVAA));
  if (parsedVAA.payload[0] === 1) {
    var transferPayload = parseTransferPayload(Buffer.from(parsedVAA.payload));

    const chainConfigInfo = getChainConfigInfo(transferPayload.targetChain);
    if (!chainConfigInfo) {
      logger.error("relay: improper chain ID: " + transferPayload.targetChain);
      return {
        redeemed: false,
        result: {
          message:
            "Fatal Error: target chain " +
            transferPayload.targetChain +
            " not supported",
        },
      };
    }

    if (isEVMChain(transferPayload.targetChain)) {
      const unwrapNative =
        transferPayload.originAddress == chainConfigInfo.wrappedAsset;
      logger.debug(
        "isEVMChain: originAddress: [" +
          transferPayload.originAddress +
          "], wrappedAsset: [" +
          chainConfigInfo.wrappedAsset +
          "], unwrapNative: " +
          unwrapNative
      );
      return await relayEVM(chainConfigInfo, signedVAA, unwrapNative);
    }

    if (transferPayload.targetChain === CHAIN_ID_SOLANA) {
      return await relaySolana(chainConfigInfo, signedVAA);
    }

    if (transferPayload.targetChain === CHAIN_ID_TERRA) {
      return await relayTerra(chainConfigInfo, signedVAA);
    }

    logger.error(
      "relay: target chain ID: " +
        transferPayload.targetChain +
        " is invalid, this is a program bug!"
    );

    return {
      redeemed: false,
      result: {
        message:
          "Fatal Error: target chain " +
          transferPayload.targetChain +
          " is invalid, this is a program bug!",
      },
    };
  }
}
