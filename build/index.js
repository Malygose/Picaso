var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var async = require('async');
var config = require('config');
var npm = require('npm');
var resolve = require('resolve');
var uuid = require('node-uuid');

async.waterfall([getNpmConfig, function(cfg, next) {
    console.log('Build modules start..');
    npm.load(cfg, next);
}, function(data, next) {
    npm.config.set('registry', config.get('npm.registry.local'));
    npm.prune(next);
}, installPrivateModule], function(err) {
    if (err) {
        console.log('%s', err.message);
    }
    console.log('Build modules finish..');
});

/**
 * 读取key并存放到npm的config属性中
 */
function getNpmConfig(next) {
    var cfg = config.get('npm');
    if (fs.existsSync(path.join(config.get('root'), cfg.authorizationFile))) {
        cfg.config[cfg.registry.local.replace('http:', '') + ':_authToken'] = fs.readFileSync(path.join(config.get('root'), cfg.authorizationFile)).toString().trim();
    } else {
        var key = uuid.v4();
        var ws = fs.createWriteStream(path.join(config.get('root'), cfg.authorizationFile));
        cfg.config[cfg.registry.local.replace('http:', '') + ':_authToken'] = key;
        ws.write(key);
        ws.close();
    }

    next(null, cfg.config);
}

/**
 * 安装私有模块与web开发基本模块
 */
function installPrivateModule(modules, next) {
    var executeArray = [function(next) {
        async.forEachSeries(config.get('privateRegistryModule'), function(mod, next) {
            if (mod.name) {
                var module = mod.name;
                if (mod.version) module += '@' + mod.version;
                resolve(mod.name, function(err, res) {
                    if (err) {
                        npm.install(module, next);
                    } else {
                        next();
                    }
                });
            }
        }, next);
    }];

    if (config.get('server.browserify.autoInstallModule')) {
        executeArray.push(function(next) {
            async.forEachSeries(config.get('server.browserify.commonReferenceModule'), function(mod, next) {
                if (mod.module) {
                    var module = mod.module;
                    if (mod.version) module += '@' + mod.version;
                    resolve(mod.module, function(err, res) {
                        if (err) {
                            npm.install(module, next);
                        } else {
                            next();
                        }
                    });
                } else {
                    next();
                }
            }, next);
        });
    }

    async.waterfall(executeArray, next);
}
