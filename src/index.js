const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('node:path');
const { exec } = require("child_process");
const fs = require("fs");
const ffmpegPath = require("ffmpeg-static");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("dialog:openFile", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Media", extensions: ["mp4", "mov", "avi", "mkv", "mp3"] }]
  });
  if (canceled) return null;
  return filePaths[0];
});

ipcMain.handle("resize-video", async (event, { input, width, height }) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(input);
    const output = path.join(dir, `resized_${Date.now()}.mp4`);
    const cmd = `"${ffmpegPath}" -i "${input}" -vf "scale=${width}:${height}" "${output}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("FFmpeg error:", error);
        reject(error);
        return;
      }
      resolve(output);
    });
  });
});

ipcMain.handle("trim-video", async (event, {input, start, end}) => {
  return new Promise((resolve, reject)=>{
    let dir = path.dirname(input);
    const output = path.join(dir, `trimmed_${Date.now()}.mp4`);
    const cmd = `"${ffmpegPath}" -i "${input}" -ss ${start} -to ${end} -c copy "${output}"`;
    exec(cmd, (error) => {
      if(error){
        console.log("Error in trimming : ", error);
        reject(error);
        return;
      }
      resolve(output);
    });
  });
});

ipcMain.handle("add-caption", async(event, {input, captionHeight, captionBGcolor, caption, font, fontColor, fontSize}) => {
  return new Promise((resolve, reject) => {
    let dir = path.dirname(input);
    const output = path.join(dir, `captioned_${Date.now()}.mp4`);
    const cmd = `"${ffmpegPath}" -i "${input}" -vf "pad=width=iw:height=ih+${captionHeight}:x=0:y=${captionHeight}:color=${captionBGcolor}, drawtext=text='${caption}':font='${font}':fontsize=${fontSize}:fontcolor=${fontColor}:x=(w-text_w)/2:y=10" -c:v libx264 -pix_fmt yuv420p "${output}"`;

    exec(cmd, (error)=>{
      if(error){
        console.log(error);
        reject(error);
        return;
      }
      resolve(output);
    });
  });
});

ipcMain.handle("muted", async (event, {input}) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(input);
    const output = path.join(dir, `muted_${Date.now()}.mp4`);
    const cmd = `"${ffmpegPath}" -i "${input}" -c:v copy -an "${output}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("muted error:", error);
        reject(error);
        return;
      }
      resolve(output);
    });
  });
});

ipcMain.handle("mp3", async (event, {input}) => {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(input);
    const output = path.join(dir, `mp3_${Date.now()}.mp3`);
    const cmd = `"${ffmpegPath}" -i "${input}" -vn -acodec libmp3lame "${output}"`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("mp3 error:", error);
        reject(error);
        return;
      }
      resolve(output);
    });
  });
});