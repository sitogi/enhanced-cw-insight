// ページロード時に拡張機能も再読み込みする (開発中向け)
// TODO: リリース時には消すか、なんらかの分岐を追加する
chrome.tabs.onUpdated.addListener(() => {
  chrome.runtime.reload();
});
