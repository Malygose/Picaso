var path = require('path');

var uuid = require('node-uuid');

/**
 * default.js为最基本的配置文件，如果在本地开发时需要改动部分设置，请在同文件夹内建立local.js，并在local.js里修改需要改动的属性即可
 */
module.exports = {
    autoInstallReferenceModule: false, // 当web页面引用的模块在服务器端不存在时，是否自动安装此模块
    gulp: { // 任务部署相关设置
        tasks: { // 系统内置并可调用的任务
            gulpLess: true // 将静态资源文件夹下的所有less文件编译为压缩后的css文件，以提高访问速度；开发环境不需要此任务，配置文件中已默认设置为false
        }
    },
    npm: {
        authorizationFile: 'npm.key', // 存放用于安装私有模块时所需的key的文件名
        config: {}, // npm加载配置（相关配置内容参考 https://github.com/npm/npm）
        registry: {
            local: 'http://registry.npm.taobao.org/', // 本地registry镜像地址
            offical: 'https://registry.npmjs.org/', // 官方registry镜像地址
            taobao: 'https://registry.npm.taobao.org/' // 淘宝registry镜像地址
        }
    },
    privateRegistryModule: [], // 私服库集合，在引用模块时请注意顺序
    root: process.env.PWD, // 项目根目录
    server: {
        browserify: { // web页面的模块化管理
            autoInstallModule: true, // 项目build时自动安装所需的公共模块
            commonReferenceModule: [{ // 每一个web页面都需要引用的模块
                module: 'jquery', // 模块名，可以为空；如果此项为空，项目build时则不会安装此模块
                shim: ['$', 'jQuery'], // 代替此模块的关键词，可以为空
                version: '2.1.4' // 安装此模块的版本，可以为空，如果此项为空，则会默认安装最新版本
            }, {
                module: 'socket.io',
                require: 'socket.io-client/socket.io.js', // require入口，如果此项为空，则会默认以module属性进行require
                shim: 'socket',
                version: '1.3.7'
            }, {
                file: [path.join(process.env.PWD, './node_modules/bootstrap/less/bootstrap.less')], // 当前模块需要手动引用的样式，可以为空
                module: 'bootstrap',
                path: [path.join(process.env.PWD, './node_modules/bootstrap/dist')], // 当前模块的静态资源目录，可以为空
                version: '3.3.5'
            }, {
                module: 'angular',
                shim: 'angular',
                version: '1.3.20'
            }],
            commonReferenceUrl: '/global.js' // web页面引用的公共类库文件url
        },
        cors: false, // 是否允许跨域
        less: { // css文件预处理器，监视less文件变化，仅在非生产环境中生效
            commonReferenceUrl: '/global.css', // web页面引用的公共样式文件url
            config: {}, // 预处理器相关配置（相关配置内容参考 https://github.com/emberfeather/less.js-middleware#options）
            customFile: [], // 需要额外引入的公共样式，支持less文件和css文件
            path: [path.join(process.env.PWD, './src')] // 预处理器监视文件路径
        },
        permission: { // 所有非代理请求权限配置
            keyword: 'MYSELF', // 当权限为owner时，请求中的关键词将会被替换为当前访问用户的id
            owner: function(req, res, next) { // 用户只有存在session会话，并且具有当前查看内容的权限时才能通过
                if (req.session.user && req.session.user.id) {
                    req.url = req.url.replace(global.app.getConfig().permission.keyword, req.session.user.id);
                    req.baseUrl = req.baseUrl.replace(global.app.getConfig().permission.keyword, req.session.user.id);
                    req.originalUrl = req.originalUrl.replace(global.app.getConfig().permission.keyword, req.session.user.id);
                    next();
                } else {
                    res.status(403).send('Invalid login.');
                }
            },
            pass: function(req, res, next) { // 无论当前用户是否存在session会话，均会通过
                next();
            },
            usePermission: true, // 是否给所有非代理请求加入权限配置,如果为false，则permission下的所有设置均失效
            user: function(req, res, next) { // 用户只有存在session会话时才能通过
                if (req.session.user) {
                    next();
                } else {
                    res.status(403).send('Invalid login.');
                }
            }
        },
        port: 8000, // web服务监听端口
        proxy: { // 代理服务器配置，如果routers中有请求符合代理服务器的匹配规则，则会先通过routers，再通过代理服务器
            config: {}, // 创建代理时的相关配置（相关配置内容参考 https://github.com/nodejitsu/node-http-proxy/blob/master/lib/http-proxy.js#L33-L50）
            pattern: '/api/\*', // 需要通过代理服务器完成的请求所匹配的express规则
            target: 'http://127.0.0.1:8001', // 代理服务器地址
            useProxy: true // 是否启用代理，如果为false，则proxy下的所有设置均失效
        },
        redis: { // 数据缓存存储系统
            config: { // 数据缓存相关配置（相关配置内容参考 https://github.com/tj/connect-redis#options）
                host: '127.0.0.1',
                port: 6379
            }
        },
        routers: {
            checkSubFolders: true, // 是否检查路由文件夹下的子文件夹
            path: path.join(process.env.PWD, './routers'), // 路由文件所在地址，在此文件夹下的所有文件都会被识别为路由文件，并且文件所在地址也会被认为路由地址
            usePathAsRoute: true // 是否使用文件所在路径作为路由地址的一部分
        },
        session: {
            config: { // 会话相关配置
                cookie: {
                    maxAge: 1000 * 60 * 60 * 24 // 会话存活时间，单位毫秒
                },
                resave: false, // 强制会话保存即使是未修改的
                saveUninitialized: false, // 强制保存未初始化的会话到存储器
                secret: uuid.v4() // 用于注册会话ID
            }
        },
        Static: {
            config: { // 静态资源相关配置（相关配置内容参考 http://www.expressjs.com.cn/4x/api.html#express.static）
                index: 'index.html' // 设置首页，默认为 'index.html'
            },
            path: [path.join(process.env.PWD, './src')] // 静态资源集合
        },
        useBodyParser: false, // 是否解析Ajax请求参数
        useCookieParser: true, // 是否解析Cookie
        useSocket: false // 是否使用webSocket通信
    }
};
