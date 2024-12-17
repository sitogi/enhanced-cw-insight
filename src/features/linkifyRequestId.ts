export const linkifyRequestId = () => {
  // TODO: ここも MutationObserver を利用するよう最適化する
  const searchLogIframeInterval = setInterval(() => {
    const iframeElement = document.querySelector('#microConsole-Logs') as HTMLIFrameElement | null;

    if (iframeElement) {
      console.log('Iframe found:', iframeElement);
      clearInterval(searchLogIframeInterval);

      const iframeDocument = iframeElement.contentWindow?.document;
      if (iframeDocument == null) {
        console.log('iframe 内の document オブジェクトが取得できませんでした。');
        return;
      }

      const iframeObserver = new MutationObserver((mutations) => {
        for (const mu of mutations) {
          if (mu.type === 'childList') {
            for (const addedNode of mu.addedNodes) {
              if (addedNode instanceof HTMLElement) {
                if (addedNode.classList.contains('logs-table__body-row')) {
                  // convertRequestIdToLink(iframeDocument, addedNode);
                  makeUuidLink(iframeDocument, addedNode);
                } else {
                  const rows = addedNode.querySelectorAll('.logs-table__body-row');
                  for (const row of rows) {
                    // convertRequestIdToLink(iframeDocument, row);
                    makeUuidLink(iframeDocument, row);
                  }
                }

                // もし パラメータに autoExecute=true があったら data-testid='scroll-run-query' のボタンをクリック
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('autoExecute') === 'true') {
                  const runButton = addedNode.querySelector(
                    '[data-testid="scroll-run-query"]',
                  ) as HTMLButtonElement | null;
                  if (runButton) {
                    runButton.click();
                    console.log('autoExecute が true のため、実行ボタンをクリックしました。');
                  } else {
                    console.log('autoExecute が true ですが、実行ボタンが見つかりませんでした。');
                  }
                }
              }
            }
          }
        }
      });

      // iframe内のDOM変化を監視
      console.log('ログテーブルが存在する iframe.body の監視を開始します。');
      iframeObserver.observe(iframeDocument.body, { childList: true, subtree: true });
    } else {
      console.log('Iframe not found, checking again...');
    }
  }, 1000);
};

type TimeInfo = {
  tz: 'LOCAL' | 'UTC';
  startUtcTime: string;
  endUtcTime: string;
};

const calcTimeRange = (tdElements: NodeListOf<Element>): TimeInfo | undefined => {
  for (const tdElement of tdElements) {
    const textContent = tdElement.textContent ?? '';

    const localTimestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}/;
    const localTimestampMatch = textContent.match(localTimestampRegex);
    if (localTimestampMatch) {
      const timestamp = localTimestampMatch[0];
      const date = new Date(timestamp);
      // 前後 15 分の ISOString を取得
      const startUtcTime = new Date(date.getTime() - 15 * 60 * 1000).toISOString();
      const endUtcTime = new Date(date.getTime() + 15 * 60 * 1000).toISOString();

      return { tz: 'LOCAL', startUtcTime, endUtcTime };
    }

    const utcTimestampRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/;
    const utcTimestampMatch = textContent.match(utcTimestampRegex);
    if (utcTimestampMatch) {
      const timestamp = utcTimestampMatch[0];
      const date = new Date(timestamp);
      // 前後 15 分の ISOString を取得
      const startUtcTime = new Date(date.getTime() - 15 * 60 * 1000).toISOString();
      const endUtcTime = new Date(date.getTime() + 15 * 60 * 1000).toISOString();

      return { tz: 'UTC', startUtcTime, endUtcTime };
    }
  }

  return undefined;
};

function makeUuidLink(doc: Document, trElement: Element) {
  const tdElements = trElement.querySelectorAll('.logs-table__body-cell');

  // 先に `2024-12-14T21:13:52.897+09:00` のような timestamp カラムがあるかどうかをチェックする
  const timeInfo = calcTimeRange(tdElements);

  for (const tdElement of tdElements) {
    const textContent = tdElement.textContent ?? '';

    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const uuidMatch = textContent.match(uuidRegex);

    if (uuidMatch) {
      const uuid = uuidMatch[0];

      const link = doc.createElement('a');
      link.href = buildUrlWithReqIdFiltering(window.location.href, uuid, timeInfo);
      link.textContent = uuid;
      link.target = '_blank';
      link.onclick = (event) => event.stopPropagation(); // アコーディオンの開閉を抑制

      tdElement.innerHTML = textContent.replace(uuid, link.outerHTML);
    }
  }
}

export function buildUrlWithReqIdFiltering(
  currentUrl: string,
  requestId: string,
  timeInfo: TimeInfo | undefined,
): string {
  const [left, right] = currentUrl.split('~editorString~');
  const nextQueryIndex = right.indexOf('~');
  const currentEditorString = right.substring(0, nextQueryIndex === -1 ? undefined : nextQueryIndex);
  const otherQuery = nextQueryIndex === -1 ? '' : right.substring(nextQueryIndex);

  // left のうちの `(` から終わりまでが時間指定の部分
  const [base, currentTimeQuery] = left.split('(');
  // 時間の特定ができている場合は、その時間を絶対値指定することで無駄なスキャンを減らす
  const newTimeQuery = timeInfo
    ? `(end~'${timeInfo.endUtcTime.replaceAll(':', '*3a')}~start~'${timeInfo.startUtcTime.replaceAll(':', '*3a')}~timeType~'ABSOLUTE~tz~'${timeInfo.tz}`
    : currentTimeQuery;

  const newEditorStringParts: string[] = [currentEditorString];
  const { isRequestIdExist, isMessageExist } = isRequestIdOrMessageExistInFields(currentEditorString);
  if (isRequestIdExist) {
    // 末尾に `\n|filter @requestId = 'uuid'` を追加
    newEditorStringParts.push(`*0a*7c*20filter*20*40requestId*20*3d*20*27${requestId}*27`);
  } else if (isMessageExist) {
    // 末尾に `\n|filter @message like /uuid/` を追加
    newEditorStringParts.push(`*0a*7c*20filter*20*40message*20like*20*2f${requestId}*2f`);
  } else {
    // newEditorStringParts を一度クリアし、fallbackEditorString を追加
    newEditorStringParts.length = 0;
    const fallback = `'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20*3d*20*27${requestId}*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*201000`;
    newEditorStringParts.push(fallback);
  }

  const url = [base, newTimeQuery, '~editorString~', newEditorStringParts.join(''), otherQuery].join('');

  // 自動でクエリの実行をしたいので、パラメータに autoExecute=true を付与しておく
  const urlObject = new URL(url, window.location.origin); // window.location.origin を指定してベースURLを正しく設定
  const params = new URLSearchParams(urlObject.search);
  params.set('autoExecute', 'true');
  urlObject.search = params.toString();

  return urlObject.toString();
}

function isRequestIdOrMessageExistInFields(editorString: string): {
  isRequestIdExist: boolean;
  isMessageExist: boolean;
} {
  return {
    isRequestIdExist: editorString.includes('*40requestId'),
    isMessageExist: editorString.includes('*40message'),
  };
}
