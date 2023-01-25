import { ProofError, Message } from "@proof-wallet/router";
import { ChainInfoWithEmbed } from "./types";
import { ChainInfo } from "@proof-wallet/types";
import { ROUTE } from "./constants";

export class GetChainInfosMsg extends Message<{
  chainInfos: ChainInfoWithEmbed[];
}> {
  public static type() {
    return "proof-get-chain-infos";
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetChainInfosMsg.type();
  }
}

export class SuggestChainInfoMsg extends Message<void> {
  public static type() {
    return "proof-suggest-chain-info";
  }

  constructor(public readonly chainInfo: ChainInfo) {
    super();
  }

  validateBasic(): void {
    if (!this.chainInfo) {
      throw new ProofError("chains", 100, "Chain info not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestChainInfoMsg.type();
  }
}

export class RemoveSuggestedChainInfoMsg extends Message<ChainInfoWithEmbed[]> {
  public static type() {
    return "proof-remove-suggested-chain-info";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("chains", 101, "Chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveSuggestedChainInfoMsg.type();
  }
}
