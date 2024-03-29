import { ProofError, Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";

export class EnableAccessProofMsg extends Message<void> {
  public static type() {
    return "proof-enable-access";
  }

  constructor(public readonly chainIds: string[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainIds || this.chainIds.length === 0) {
      throw new ProofError("permission", 100, "chain id not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  approveExternal(): boolean {
    return true;
  }

  type(): string {
    return EnableAccessProofMsg.type();
  }
}

export class GetPermissionOriginsMsg extends Message<string[]> {
  public static type() {
    return "proof-get-permission-origins";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new ProofError("permission", 110, "empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetPermissionOriginsMsg.type();
  }
}

export class GetOriginPermittedChainsMsg extends Message<string[]> {
  public static type() {
    return "proof-get-origin-permitted-chains";
  }

  constructor(
    public readonly permissionOrigin: string,
    public readonly permissionType: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.permissionOrigin) {
      throw new ProofError("permission", 101, "origin not set");
    }

    if (!this.permissionType) {
      throw new ProofError("permission", 110, "empty permission type");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetOriginPermittedChainsMsg.type();
  }
}

export class AddPermissionOrigin extends Message<void> {
  public static type() {
    return "proof-add-permission-origin";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new ProofError("permission", 110, "empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new ProofError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddPermissionOrigin.type();
  }
}

export class RemovePermissionOrigin extends Message<void> {
  public static type() {
    return "proof-remove-permission-origin";
  }

  constructor(
    public readonly chainId: string,
    public readonly permissionType: string,
    public readonly permissionOrigin: string
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("permission", 100, "chain id not set");
    }

    if (!this.permissionType) {
      throw new ProofError("permission", 110, "empty permission type");
    }

    if (!this.permissionOrigin) {
      throw new ProofError("permission", 111, "empty permission origin");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RemovePermissionOrigin.type();
  }
}
