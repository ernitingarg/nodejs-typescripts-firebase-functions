import { FirebaseConfig } from ".";

class CFHostCreator {
  constructor(private readonly config: FirebaseConfig){}

  create = (): string => {
    switch(this.config.projectId) {
      case 'black-stream-292507':
        return 'https://us-central1-black-stream-292507.cloudfunctions.net'
      case 'soteria-production':
        return 'https://us-central1-soteria-production.cloudfunctions.net'
      default:
        throw new Error('invalid project id')
    }
  }
}

export default CFHostCreator
