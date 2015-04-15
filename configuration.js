module.exports = {

    app_root: __dirname,
    port: 13800,
    sailfish_host: 'http://127.0.0.1:13800',
    mongo: 'mongodb://172.17.0.2/sailfish',

    //ssh key generation
    ssh: {
        bits: 1024
    }

}