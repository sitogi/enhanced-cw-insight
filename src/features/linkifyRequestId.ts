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
                  convertRequestIdToLink(iframeDocument, addedNode);
                } else {
                  const rows = addedNode.querySelectorAll('.logs-table__body-row');
                  for (const row of rows) {
                    convertRequestIdToLink(iframeDocument, row);
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

function convertRequestIdToLink(doc: Document, row: Element) {
  console.log('変換処理を開始します。');

  // TODO: ここの requestIdIndex 算出も一度だけ行われるように最適化したい
  const headerRow = doc.querySelector('.logs-table__header-row');
  if (headerRow == null) {
    console.log('HeaderRow is not found');
    return;
  }

  const thElements = Array.from(headerRow.querySelectorAll('th'));
  const requestIdIndex = thElements.findIndex((th) => th?.textContent?.includes('@requestId'));

  if (requestIdIndex === -1) {
    console.log('@requestId column is not found.');
    return;
  }

  const cells = Array.from(row.querySelectorAll('.logs-table__body-cell'));
  const requestIdCell = cells[requestIdIndex];
  const requestId = requestIdCell.textContent?.trim();
  if (requestId == null) {
    return;
  }

  const link = document.createElement('a');
  link.href = createRequestIdQueryUrl(window.location.href, requestId);
  link.textContent = requestId;
  link.target = '_blank';
  link.onclick = (event) => event.stopPropagation(); // アコーディオンの開閉を抑制

  requestIdCell.innerHTML = '';
  requestIdCell.appendChild(link);
  console.log('変換しました。');

  console.log('変換処理を終了します。');
}

export function createRequestIdQueryUrl(currentUrl: string, requestId: string): string {
  // TODO: (できれば) 昇順/降順とか、表示するフィールドとか、ある程度ユーザーが調整できるのがベストだけど...
  // TODO: (必須) その requestId のタイムスタンプの前後 30 分を絶対時間として指定したい
  const newEditorString = `'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20*3d*20*27${requestId}*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*201000`;
  const [left, right] = currentUrl.split('~editorString~');
  const nextQueryIndex = right.indexOf('~');

  const url = [
    left,
    '~editorString~',
    newEditorString,
    nextQueryIndex === -1 ? undefined : right.substring(nextQueryIndex),
  ].join('');

  // パラメータ autoExecute=true を付与
  const urlObject = new URL(url, window.location.origin); // window.location.origin を指定してベースURLを正しく設定
  const params = new URLSearchParams(urlObject.search);
  params.set('autoExecute', 'true');
  urlObject.search = params.toString();
  const urlWithAutoExecute = urlObject.toString();
  return urlWithAutoExecute;
}

// export function parseCWInsightUrl(fullUrl: string) {
//   // fullUrl
//   // https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
//   const hashIndex = fullUrl.indexOf('#');
//   if (hashIndex === -1) {
//     throw new Error('hash index not found');
//   }
//
//   const url = fullUrl.substring(0, hashIndex);
//   const query = fullUrl.substring(hashIndex + 1);
//   const percentEncodedQuery = query.replace(/\*/g, '%');
//   const decodedQuery = decodeURIComponent(percentEncodedQuery);
//
//   console.log({ url, query, decodedQuery });
//
//   const queryDetailStr = (() => {
//     const detailChars: string[] = [];
//     let parenthesesCount = 0;
//     for (let i = 0; i < decodedQuery.length; i++) {
//       const char = decodedQuery[i];
//       if (parenthesesCount > 0) {
//         detailChars.push(char);
//       }
//       if (char === '(') {
//         parenthesesCount++;
//       }
//       if (char === ')') {
//         parenthesesCount--;
//       }
//     }
//
//     detailChars.pop(); // 末尾の ) は削る
//     return detailChars.join('');
//   })();
//
//   console.log({ queryDetailStr });
//
//   // 3. Split by `~` and process pairs
//   const pairs = queryDetailStr.split('~');
//   console.log({ pairs });
//   const result: { [key: string]: string } = {};
//
//   for (let i = 0; i < pairs.length; i += 2) {
//     const key = pairs[i];
//     const value = pairs[i + 1];
//     result[key] = value;
//   }
//
//   return result;
//
//   // TODO: これをクエリの末尾に足せば良さげ
//   // *0a*7c*20filter*20*40requestId*20*3d*20*27f1f3563c-8f58-406e-b4a4-c4f3ffd07ad3*27
//   // TODO: それかこのクエリ部分を抽出してまるまる置換かな
//   // ~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20*3d*20*27f1f3563c-8f58-406e-b4a4-c4f3ffd07ad3*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000
//
//   // #logsV2:logs-insights$3FqueryDetail$3D~(end~'2024-08-20T14*3a59*3a59.000Z~start~'2024-08-19T15*3a00*3a00.000Z~timeType~'ABSOLUTE~tz~'LOCAL~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*23*20*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
//   // url
//   // https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1
//
//   // hashParam
//   // logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
//
//   // https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~'2024-08-20T14*3a59*3a59.000Z~start~'2024-08-19T15*3a00*3a00.000Z~timeType~'ABSOLUTE~tz~'LOCAL~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40requestId*20*3d*20*27f1f3563c-8f58-406e-b4a4-c4f3ffd07ad3*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
//
//   return { url, hashParam: query };
// }
