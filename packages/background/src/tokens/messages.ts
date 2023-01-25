import { ProofError, Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";
import { AppCurrency } from "@proof-wallet/types";

export class GetTokensMsg extends Message<AppCurrency[]> {
  public static type() {
    return "proof-get-tokens";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("tokens", 100, "Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetTokensMsg.type();
  }
}

export class SuggestTokenMsg extends Message<void> {
  public static type() {
    return "proof-suggest-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string,
    public readonly viewingKey?: string
  ) {
    super();
  }

  approveExternal(): boolean {
    return true;
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("tokens", 100, "Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new ProofError("tokens", 101, "Contract address is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SuggestTokenMsg.type();
  }
}

export class AddTokenMsg extends Message<void> {
  public static type() {
    return "proof-add-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly currency: AppCurrency
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("tokens", 100, "Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddTokenMsg.type();
  }
}

export class RemoveTokenMsg extends Message<void> {
  public static type() {
    return "proof-remove-token";
  }

  constructor(
    public readonly chainId: string,
    public readonly currency: AppCurrency
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("tokens", 100, "Chain id is empty");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemoveTokenMsg.type();
  }
}

export class GetSecret20ViewingKey extends Message<string> {
  public static type() {
    return "proof-get-secret20-viewing-key";
  }

  constructor(
    public readonly chainId: string,
    public readonly contractAddress: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("tokens", 100, "Chain id is empty");
    }

    if (!this.contractAddress) {
      throw new ProofError("tokens", 101, "Contract address is empty");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetSecret20ViewingKey.type();
  }
}
