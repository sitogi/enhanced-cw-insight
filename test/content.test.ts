// @vitest-environment jsdom
import { expect, test } from 'vitest'
import { createRequestIdQueryUrl } from "../src/content";

test('createRequestIdQueryUrl', () => {
  const fullUrl = `https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*2c*20*40logStream*0a*7c*20filter*20*40reqeustId*20*3d*20*27c30266c2-6103-4912-8267-0843f9bfc5a2*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))`;

  const result = createRequestIdQueryUrl(fullUrl, 'new-request-id')

  expect(result).toStrictEqual(`https://ap-northeast-1.console.aws.amazon.com/cloudwatch/home?region=ap-northeast-1#logsV2:logs-insights$3FqueryDetail$3D~(end~0~start~-10800~timeType~'RELATIVE~tz~'LOCAL~unit~'seconds~editorString~'fields*20*40timestamp*2c*20*40requestId*2c*20*40message*0a*7c*20filter*20*40requestId*20*3d*20*27new-request-id*27*0a*7c*20sort*20*40timestamp*20desc*0a*7c*20limit*2010000~queryId~'9aa5d271-27e0-4116-bcc3-00a2e215026a~source~(~'*2faws*2flambda*2fserverless-lambda-sandbox-dev-hello))`);
})
