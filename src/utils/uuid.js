class UUID {
    constructor() {}

    v4String() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    nowTimeStamp() {
        return + new Date()
    }

    get generatedUUID() {
        return this.nowTimeStamp() + "-" + this.v4String()
    }

    // Installation related UUID functions
    generateInstallUUID(extensionVersion) {
        return "install_" + extensionVersion + "_" + this.nowTimeStamp() + "-" + this.v4String()
    }

    saveInstallUUID(installUUID) {
        chrome.storage.local.set({ installUUID: installUUID }, () => {
            return
        })
    }

    retrieveInstallUUID(handler) {
        chrome.storage.local.get('installUUID', (val) => {
            return handler(val.installUUID)
        })
    }
}