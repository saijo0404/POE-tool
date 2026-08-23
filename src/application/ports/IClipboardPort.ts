export interface IClipboardPort {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
}
