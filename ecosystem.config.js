module.exports = {
    apps: [
        {
            name: "Api",
            script: "yarn start",
            automation: false
        },
        // TODO: !
        {
            name: "Tor",
            script: "tor",
            automation: false
        }
    ]
}
