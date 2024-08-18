document.addEventListener('DOMContentLoaded', () => {
  console.log('content loaded');
});

console.log('content.ts loaded');

setTimeout(() => {
  console.log('content.ts loaded after 2 seconds');
  const pageTitle = document.title;
  console.log('Page Title:', pageTitle);
}, 2000);

const makeRequestIdLink = () => {
  const headerRow = document.querySelector('.logs-table__header-row');

  if (headerRow == null) {
    console.error('HeaderRow is not found');
    return;
  }

  const thElements = Array.from(headerRow.querySelectorAll('th'));

  const requestIdIndex = thElements.findIndex((th) => th?.textContent?.includes('@requestId'));

  if (requestIdIndex === -1) {
    console.error('@requestId column is not found.');
  }

  console.log(requestIdIndex);

  const rows = document.querySelectorAll('.logs-table__body-row');

  // rows.forEach((row) => {
  //   const cells = Array.from(row.querySelectorAll('.logs-table__body-cell'));
  //   const requestIdCell = cells[requestIdIndex];
  //   const requestId = requestIdCell.textContent?.trim();
  //   if (requestId == null) {
  //     return;
  //   }
  //
  //   const link = document.createElement('a');
  //   link.href = createRequestIdQueryUrl(requestId);
  //   link.textContent = requestId;
  //   requestIdCell.innerHTML = '';
  //   requestIdCell.appendChild(link);
  // });
};

const createRequestIdQueryUrl = (requestId: string): string => {
  return '#';
};

// TODO: biome いれる
// TODO: これかく
const parseCWInsightUrl = (url: string) => {
  //   - 元のURL
  //     - https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
  // - 新しいURL
  //     - 時間変更なし
  //         - https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))
};

makeRequestIdLink();
