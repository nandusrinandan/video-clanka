// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  resizeVideo: (data) => ipcRenderer.invoke("resize-video", data),
  trimVideo: (data) => ipcRenderer.invoke("trim-video", data),
  addCaption: (data) => ipcRenderer.invoke("add-caption", data),
  muted: (data) => ipcRenderer.invoke("muted", data),
  mp3: (data) => ipcRenderer.invoke("mp3", data)
});