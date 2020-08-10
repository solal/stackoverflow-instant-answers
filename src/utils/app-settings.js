class ExtensionSettings {
    constructor(env) {
        this._env = env
    }


    get eventsAPIURL() {
        return this._env === 'dev' ? 'http://127.0.0.1:5000' : 'https://solalfitoussi.com'
    }


    get stackoverflowAPIURL() {
        return 'https://api.stackexchange.com'
    }
}


const SETTINGS = new ExtensionSettings('prod')