import { Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";

export class ApproveInteractionMsg extends Message<void> {
  public static type() {
    return "proof-approve-interaction";
  }

  constructor(public readonly id: string, public readonly result: unknown) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ApproveInteractionMsg.type();
  }
}

export class RejectInteractionMsg extends Message<void> {
  public static type() {
    return "proof-reject-interaction";
  }

  constructor(public readonly id: string) {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RejectInteractionMsg.type();
  }
}
