chrome.runtime.onInstalled.addListener((details) => {
    const currentVersion  = chrome.runtime.getManifest().version
    const previousVersion = details.previousVersion
    const reason = details.reason

    const uuid = new UUID()
    const uuidStr = uuid.generateInstallUUID(currentVersion)

    switch (reason) {
        case 'install':
            sendUpdateNotification(uuidStr, currentVersion)
            uuid.saveInstallUUID(uuidStr)
            break;
        case 'update':
            sendUpdateNotification(uuidStr, currentVersion)
            uuid.saveInstallUUID(uuidStr)
        case 'chrome_update':
        case 'shared_module_update':
        default:
            console.log('Other install events within the browser')
            break;
    }
})


function sendUpdateNotification(installUUID, currentVersion) {
    const gateway = new Gateway()
    gateway.post(SETTINGS.eventsAPIURL + '/install/register', {
        install_uuid: installUUID,
        install_version: currentVersion
    })
}
