
interface FBConfig {
  projectId: PROJECT;
  databaseURL: string;
  storageBucket: string;
}

export function getFirebaseConfig(): FBConfig {
  if (!process.env.FIREBASE_CONFIG) {
    throw new Error('empty process.env.FIREBASE_CONFIG')
  }
  return JSON.parse(process.env.FIREBASE_CONFIG) as FBConfig;
}

type PROJECT = 'black-stream-292507' | 'soteria-production';

export const DEVELOP: PROJECT = 'black-stream-292507';
export const PRODUCTION: PROJECT = 'soteria-production';

export class FirebaseConfig {
  private _config: FBConfig;

  // TODO: 本当はFBConfigをなくして移行したいけど差分大きくなるので一旦移行は見送り
  /**
   * @param config
   */
  private constructor(config: FBConfig) {
    this._config = config;
  }

  /**
   *
   */
  get projectId(): PROJECT {
    return this._config.projectId;
  }

  static defaultConfig(): FirebaseConfig {
    return new FirebaseConfig(getFirebaseConfig());
  }
}
