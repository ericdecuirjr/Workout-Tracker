import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { KeepAwake } from '@capacitor-community/keep-awake';

window.WorkoutNative = {
  isNative: Capacitor.isNativePlatform(),
  async setScreenAwake(enabled) {
    if (!Capacitor.isNativePlatform()) return false;
    if (enabled) await KeepAwake.keepAwake();
    else await KeepAwake.allowSleep();
    return true;
  },
  async shareFile(filename, contents, mime) {
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const result = await Filesystem.writeFile({
      path: safeName,
      data: contents,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });
    await Share.share({
      title: 'Workout Tracker export',
      text: 'Workout Tracker ' + (mime === 'application/json' ? 'backup' : 'history'),
      files: [result.uri],
      dialogTitle: 'Save or share your workout file'
    });
  }
};
