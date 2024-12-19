import { linkifyRequestId } from './features/linkifyRequestId';

console.log('enhanced-cw-insight is loaded!');

let isInsightOpened = false;

const handleHashChange = () => {
  if (window.location.hash.includes('#logsV2:logs-insights')) {
    if (isInsightOpened) {
      return;
    }
    isInsightOpened = true;
    linkifyRequestId();
  } else {
    isInsightOpened = false;
  }
};

// 初回読み込み時にも実行する
handleHashChange();

// CloudWatch のコンソールは SPA で構築しており、ハッシュによってページ分割されているため、
// hashchange イベントを利用してページ遷移を検知し、ログのインサイトのときのみ動作するようにする
window.addEventListener('hashchange', handleHashChange);
