// src/types/global.d.ts

declare module "mammoth";
declare module "pdf-parse";
// types/global.d.ts
declare module "openai";
// types/appwrite-fix.d.ts
declare module "appwrite" {
  export class Client {
    setEndpoint(endpoint: string): this;
    setProject(projectId: string): this;
  }
  export class Realtime {
    constructor(client: Client);
    subscribe(
      channels: string[],
      callback: (response: any) => void,
    ): { unsubscribe(): void };
  }
}
