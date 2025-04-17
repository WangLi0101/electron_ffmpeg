import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

export function setupAutoUpdater() {
  // autoUpdater.forceDevUpdateConfig = true
  // 检查更新
  autoUpdater.checkForUpdates()

  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
  })

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: '正在下载新版本，请稍后...'
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog
      .showMessageBox({
        type: 'question',
        buttons: ['重启', '稍后'],
        defaultId: 0,
        title: '更新完成',
        message: '新版本已准备好，是否现在重启应用？'
      })
      .then(({ response }) => {
        if (response === 0) autoUpdater.quitAndInstall()
      })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('当前已是最新版本')
  })

  autoUpdater.on('error', (error) => {
    console.log('更新出错', error)
    dialog.showErrorBox('更新失败', error == null ? '未知错误' : (error.stack || error).toString())
  })
}
