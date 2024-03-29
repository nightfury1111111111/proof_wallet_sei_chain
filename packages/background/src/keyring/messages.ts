import { ProofError, Message } from "@proof-wallet/router";
import { ROUTE } from "./constants";
import {
  KeyRing,
  KeyRingStatus,
  MultiKeyStoreInfoWithSelected,
} from "./keyring";
import { BIP44HDPath, ExportKeyRingData } from "./types";

import {
  Bech32Address,
  checkAndValidateADR36AminoSignDoc,
  EthermintChainIdHelper,
} from "@proof-wallet/cosmos";
import {
  BIP44,
  EthSignType,
  ProofSignOptions,
  Key,
  StdSignDoc,
  AminoSignResponse,
  StdSignature,
} from "@proof-wallet/types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require("bip39");
import { SignDoc } from "@proof-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { Buffer } from "buffer/";
import { LedgerApp } from "../ledger";

export class RestoreKeyRingMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-restore-keyring";
  }

  constructor() {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  validateBasic(): void {}

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RestoreKeyRingMsg.type();
  }
}

export class DeleteKeyRingMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-delete-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new ProofError("keyring", 201, "Invalid index");
    }

    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return DeleteKeyRingMsg.type();
  }
}

export class ResetKeyRingMsg extends Message<{
  status: KeyRingStatus;
}> {
  public static type() {
    return "proof-reset-keyring";
  }

  constructor(public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ResetKeyRingMsg.type();
  }
}

export class UpdateNameKeyRingMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-update-name-keyring";
  }

  constructor(public readonly index: number, public readonly name: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new ProofError("keyring", 201, "Invalid index");
    }

    if (!this.name) {
      throw new ProofError("keyring", 273, "name not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UpdateNameKeyRingMsg.type();
  }
}

export class ShowKeyRingMsg extends Message<string> {
  public static type() {
    return "proof-show-keyring";
  }

  constructor(public readonly index: number, public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!Number.isInteger(this.index)) {
      throw new ProofError("keyring", 201, "Invalid index");
    }

    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ShowKeyRingMsg.type();
  }
}

export class ChangePasswordMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-change-password";
  }

  constructor(
    public readonly currentPassword: string,
    public readonly newPassword: string,
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2"
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.currentPassword) {
      throw new ProofError("keyring", 274, "current password not set");
    }

    if (!this.newPassword) {
      throw new ProofError("keyring", 301, "new password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangePasswordMsg.type();
  }
}

export class CreateMnemonicKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-create-mnemonic-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly mnemonic: string,
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.mnemonic) {
      throw new ProofError("keyring", 272, "mnemonic not set");
    }

    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateMnemonicKeyMsg.type();
  }
}

export class AddMnemonicKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-add-mnemonic-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly mnemonic: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.mnemonic) {
      throw new ProofError("keyring", 272, "mnemonic not set");
    }

    // Validate mnemonic.
    // Checksome is not validate in this method.
    // Keeper should handle the case of invalid checksome.
    try {
      bip39.mnemonicToEntropy(this.mnemonic);
    } catch (e) {
      if (e.message !== "Invalid mnemonic checksum") {
        throw e;
      }
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddMnemonicKeyMsg.type();
  }
}

export class CreatePrivateKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-create-private-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly privateKey: Uint8Array,
    public readonly password: string,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.privateKey || this.privateKey.length === 0) {
      throw new ProofError("keyring", 275, "private key not set");
    }

    if (this.privateKey.length !== 32) {
      throw new ProofError("keyring", 260, "invalid length of private key");
    }

    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreatePrivateKeyMsg.type();
  }
}

export class CreateLedgerKeyMsg extends Message<{
  status: KeyRingStatus;
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-create-ledger-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly password: string,
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CreateLedgerKeyMsg.type();
  }
}

export class AddPrivateKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-add-private-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly privateKey: Uint8Array,
    public readonly meta: Record<string, string>
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    if (!this.privateKey || this.privateKey.length === 0) {
      throw new ProofError("keyring", 275, "private key not set");
    }

    if (this.privateKey.length !== 32) {
      throw new ProofError("keyring", 260, "invalid length of private key");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddPrivateKeyMsg.type();
  }
}

export class AddLedgerKeyMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-add-ledger-key";
  }

  constructor(
    public readonly kdf: "scrypt" | "sha256" | "pbkdf2",
    public readonly meta: Record<string, string>,
    public readonly bip44HDPath: BIP44HDPath
  ) {
    super();
  }

  validateBasic(): void {
    if (
      this.kdf !== "scrypt" &&
      this.kdf !== "sha256" &&
      this.kdf !== "pbkdf2"
    ) {
      throw new ProofError("keyring", 202, "Invalid kdf");
    }

    KeyRing.validateBIP44Path(this.bip44HDPath);
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return AddLedgerKeyMsg.type();
  }
}

export class LockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "proof-lock-keyring";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return LockKeyRingMsg.type();
  }
}

export class UnlockKeyRingMsg extends Message<{ status: KeyRingStatus }> {
  public static type() {
    return "proof-unlock-keyring";
  }

  constructor(public readonly password = "") {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return UnlockKeyRingMsg.type();
  }
}

export class GetKeyMsg extends Message<Key> {
  public static type() {
    return "proof-get-key";
  }

  constructor(public readonly chainId: string) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetKeyMsg.type();
  }
}

export class RequestSignAminoMsg extends Message<AminoSignResponse> {
  public static type() {
    return "proof-request-sign-amino";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: ProofSignOptions & {
      // Hack option field to detect the sign arbitrary for string
      isADR36WithString?: boolean;
      ethSignType?: EthSignType;
    } = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new ProofError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signOptions.ethSignType) {
        throw new Error(
          "Eth sign type can be requested with only ADR-36 amino sign doc"
        );
      }

      if (this.signDoc.chain_id !== this.chainId) {
        throw new ProofError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }
    } else {
      if (this.signDoc.msgs[0].value.signer !== this.signer) {
        throw new ProofError("keyring", 233, "Unmatched signer in sign doc");
      }

      if (this.signOptions.ethSignType) {
        switch (this.signOptions.ethSignType) {
          // TODO: Check chain id in tx data.
          // case EthSignType.TRANSACTION:
          case EthSignType.EIP712: {
            const message = JSON.parse(
              Buffer.from(this.signDoc.msgs[0].value.data, "base64").toString()
            );
            const { ethChainId } = EthermintChainIdHelper.parse(this.chainId);
            if (parseFloat(message.domain?.chainId) !== ethChainId) {
              throw new Error(
                `Unmatched chain id for eth (expected: ${ethChainId}, actual: ${message.domain?.chainId})`
              );
            }
          }
          // XXX: There is no way to check chain id if type is message because eth personal sign standard doesn't define chain id field.
          // case EthSignType.MESSAGE:
        }
      }
    }

    if (!this.signOptions) {
      throw new ProofError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignAminoMsg.type();
  }
}

export class RequestSignEIP712CosmosTxMsg_v0 extends Message<AminoSignResponse> {
  public static type() {
    return "proof-request-sign-eip-712-cosmos-tx-v0";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly eip712: {
      types: Record<string, { name: string; type: string }[] | undefined>;
      domain: Record<string, any>;
      primaryType: string;
    },
    public readonly signDoc: StdSignDoc,
    public readonly signOptions: ProofSignOptions
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new ProofError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    // Check and validate the ADR-36 sign doc.
    // ADR-36 sign doc doesn't have the chain id
    if (!checkAndValidateADR36AminoSignDoc(this.signDoc)) {
      if (this.signDoc.chain_id !== this.chainId) {
        throw new ProofError(
          "keyring",
          234,
          "Chain id in the message is not matched with the requested chain id"
        );
      }

      const { ethChainId } = EthermintChainIdHelper.parse(this.chainId);
      if (parseFloat(this.eip712.domain.chainId) !== ethChainId) {
        throw new Error(
          `Unmatched chain id for eth (expected: ${ethChainId}, actual: ${this.eip712.domain.chainId})`
        );
      }
    } else {
      throw new Error("Can't sign ADR-36 with EIP-712");
    }

    if (!this.signOptions) {
      throw new ProofError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignEIP712CosmosTxMsg_v0.type();
  }
}

export class RequestVerifyADR36AminoSignDoc extends Message<boolean> {
  public static type() {
    return "proof-request-verify-adr-36-amino-doc";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly data: Uint8Array,
    public readonly signature: StdSignature
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new ProofError("keyring", 230, "signer not set");
    }

    if (!this.signature) {
      throw new ProofError("keyring", 271, "Signature not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestVerifyADR36AminoSignDoc.type();
  }
}

export class RequestSignDirectMsg extends Message<{
  readonly signed: {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: string;
  };
  readonly signature: StdSignature;
}> {
  public static type() {
    return "proof-request-sign-direct";
  }

  constructor(
    public readonly chainId: string,
    public readonly signer: string,
    public readonly signDoc: {
      bodyBytes?: Uint8Array;
      authInfoBytes?: Uint8Array;
      chainId?: string;
      accountNumber?: string;
    },
    public readonly signOptions: ProofSignOptions = {}
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (!this.signer) {
      throw new ProofError("keyring", 230, "signer not set");
    }

    // Validate bech32 address.
    Bech32Address.validate(this.signer);

    const signDoc = SignDoc.fromPartial({
      bodyBytes: this.signDoc.bodyBytes,
      authInfoBytes: this.signDoc.authInfoBytes,
      chainId: this.signDoc.chainId,
      accountNumber: this.signDoc.accountNumber,
    });

    if (signDoc.chainId !== this.chainId) {
      throw new ProofError(
        "keyring",
        234,
        "Chain id in the message is not matched with the requested chain id"
      );
    }

    if (!this.signOptions) {
      throw new ProofError("keyring", 235, "Sign options are null");
    }
  }

  approveExternal(): boolean {
    return true;
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return RequestSignDirectMsg.type();
  }
}

export class GetMultiKeyStoreInfoMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-get-multi-key-store-info";
  }

  constructor() {
    super();
  }

  validateBasic(): void {
    // noop
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetMultiKeyStoreInfoMsg.type();
  }
}

export class ChangeKeyRingMsg extends Message<{
  multiKeyStoreInfo: MultiKeyStoreInfoWithSelected;
}> {
  public static type() {
    return "proof-change-keyring";
  }

  constructor(public readonly index: number) {
    super();
  }

  validateBasic(): void {
    if (this.index < 0) {
      throw new ProofError("keyring", 200, "Index is negative");
    }

    if (!Number.isInteger(this.index)) {
      throw new ProofError("keyring", 201, "Invalid index");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ChangeKeyRingMsg.type();
  }
}

// Return the list of selectable path.
// If coin type was set for the key store, will return empty array.
export class GetIsKeyStoreCoinTypeSetMsg extends Message<
  {
    readonly path: BIP44;
    readonly bech32Address: string;
  }[]
> {
  public static type() {
    return "proof-get-is-keystore-coin-type-set";
  }

  constructor(public readonly chainId: string, public readonly paths: BIP44[]) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (this.paths.length === 0) {
      throw new ProofError("keyring", 250, "empty bip44 path list");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return GetIsKeyStoreCoinTypeSetMsg.type();
  }
}

export class SetKeyStoreCoinTypeMsg extends Message<KeyRingStatus> {
  public static type() {
    return "proof-set-keystore-coin-type";
  }

  constructor(
    public readonly chainId: string,
    public readonly coinType: number
  ) {
    super();
  }

  validateBasic(): void {
    if (!this.chainId) {
      throw new ProofError("keyring", 270, "chain id not set");
    }

    if (this.coinType < 0) {
      throw new ProofError("keyring", 240, "coin type can not be negative");
    }

    if (!Number.isInteger(this.coinType)) {
      throw new ProofError("keyring", 241, "coin type should be integer");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return SetKeyStoreCoinTypeMsg.type();
  }
}

export class CheckPasswordMsg extends Message<boolean> {
  public static type() {
    return "proof-check-keyring-password";
  }

  constructor(public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return CheckPasswordMsg.type();
  }
}

export class ExportKeyRingDatasMsg extends Message<ExportKeyRingData[]> {
  public static type() {
    return "proof-export-keyring-datas";
  }

  constructor(public readonly password: string) {
    super();
  }

  validateBasic(): void {
    if (!this.password) {
      throw new ProofError("keyring", 274, "password not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return ExportKeyRingDatasMsg.type();
  }
}

export class InitNonDefaultLedgerAppMsg extends Message<void> {
  public static type() {
    return "proof-init-non-default-ledger-app";
  }

  constructor(public readonly ledgerApp: LedgerApp) {
    super();
  }

  validateBasic(): void {
    if (!this.ledgerApp) {
      throw new Error("ledger app not set");
    }
  }

  route(): string {
    return ROUTE;
  }

  type(): string {
    return InitNonDefaultLedgerAppMsg.type();
  }
}
