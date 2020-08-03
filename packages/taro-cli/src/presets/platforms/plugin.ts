import * as path from 'path'

export default (ctx) => {
  ctx.registerPlatform({
    name: 'plugin',
    useConfigName: 'mini',
    async fn ({ config }) {
      const {
        plugin,
        isWatch
      } = ctx.runOpts
      const { sourcePath, outputPath } = ctx.paths
      const { emptyDirectory, chalk, fs, PLATFORMS } = ctx.helper
      const { WEAPP, ALIPAY } = PLATFORMS

      const PLUGIN_JSON = 'mini.project.json'

      const typeMap = {
        [WEAPP]: '微信',
        [ALIPAY]: '支付宝'
      }
      emptyDirectory(outputPath)

      if (plugin !== WEAPP && plugin !== ALIPAY) {
        console.log(chalk.red('目前插件编译仅支持 微信/支付宝 小程序！'))
        return
      }
      console.log(chalk.green(`开始编译${typeMap[plugin]}小程序插件`))

      async function buildWxPlugin () {
        await ctx.applyPlugins({
          name: 'build',
          opts: {
            config: {
              ...config,
              isBuildPlugin: true,
              isWatch,
              outputRoot: `${config.outputRoot}/miniprogram`,
              platform: 'weapp',
              needClearOutput: false
            },
            platform: 'weapp'
          }
        })
        await ctx.applyPlugins({
          name: 'build',
          opts: {
            config: {
              ...config,
              isBuildPlugin: false,
              isWatch,
              outputRoot: `${config.outputRoot}`,
              platform: 'weapp',
              needClearOutput: false
            },
            platform: 'weapp'
          }
        })
      }

      async function buildAlipayPlugin () {
        const pluginJsonPath = path.join(sourcePath, PLUGIN_JSON);
        let pluginConfig = {
          miniprogramRoot: 'miniprogram',
          pluginRoot: 'plugin',
          compileType: 'plugin'
        };

        if (fs.existsSync(pluginJsonPath)) {
          pluginConfig = fs.readJSONSync(pluginJsonPath);
          if (!pluginConfig.miniprogramRoot || !pluginConfig.pluginRoot) {
            console.log(chalk.red(`${PLUGIN_JSON}文件格式出错`));
            return;
          }
        } else {
          console.log(chalk.green(`源代码目录下缺少${PLUGIN_JSON}文件，自动生成${PLUGIN_JSON}！`));
        }
        fs.writeJSONSync(path.join(config.outputRoot, PLUGIN_JSON), pluginConfig);

        await ctx.applyPlugins({
          name: 'build',
          opts: {
            config: {
              ...config,
              isBuildPlugin: true,
              isWatch,
              outputRoot: config.outputRoot,
              platform: 'alipay',
              needClearOutput: false
            },
            platform: 'alipay'
          }
        })
        await ctx.applyPlugins({
          name: 'build',
          opts: {
            config: {
              ...config,
              isBuildPlugin: false,
              isWatch,
              outputRoot: `${config.outputRoot}/${pluginConfig.miniprogramRoot}`,
              platform: 'alipay',
              needClearOutput: false
            },
            platform: 'alipay'
          }
        })
      }

      switch (plugin) {
        case WEAPP:
          await buildWxPlugin()
          break
        case ALIPAY:
          await buildAlipayPlugin()
          break
        default:
          console.log(chalk.red('输入插件类型错误，目前只支持 weapp/alipay 插件类型'))
          break
      }
    }
  })
}
