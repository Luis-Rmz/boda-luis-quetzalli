import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const profile = process.env.AWS_PROFILE ?? 'boda';
const region = process.env.AWS_REGION ?? 'us-east-2';
const certificateRegion = 'us-east-1';
const domainName = process.env.SITE_DOMAIN ?? 'luisyquetzalli.com';
const wwwDomainName = `www.${domainName}`;
const hostedZoneName = `${domainName}.`;
const cloudFrontHostedZoneId = 'Z2FDTNDATAQYW2';
const lambdaName = process.env.LAMBDA_NAME ?? 'boda-rsvp';
const lambdaRoleName = process.env.LAMBDA_ROLE_NAME ?? 'boda-rsvp-lambda-role';
const apiName = process.env.API_NAME ?? 'boda-rsvp-api';
const rewriteFunctionName = process.env.CLOUDFRONT_FUNCTION_NAME ?? 'boda-static-index-rewrite';
const originAccessControlName = process.env.OAC_NAME ?? 'boda-s3-oac';

function log(message) {
  process.stdout.write(`${message}\n`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: process.env,
    stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`${command} ${args.join(' ')} failed\n${output}`);
  }

  return result.stdout?.trim() ?? '';
}

function runJson(command, args) {
  const output = run(command, args);
  return output ? JSON.parse(output) : null;
}

function aws(args, options = {}) {
  const fullArgs = [...args, '--profile', profile];
  if (options.region !== false) fullArgs.push('--region', options.region ?? region);
  return options.json === false ? run('aws', fullArgs) : runJson('aws', fullArgs);
}

function tryAws(args, options = {}) {
  try {
    return aws(args, options);
  } catch {
    return null;
  }
}

function writeTempJson(prefix, data) {
  const file = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  fs.writeFileSync(file, JSON.stringify(data));
  return file;
}

function parseEnvFile(file) {
  const values = {};
  const content = fs.readFileSync(file, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    values[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }

  return values;
}

function cleanup(files) {
  for (const file of files) {
    fs.rmSync(file, { force: true });
  }
}

function ensureHostedZone() {
  const zones = aws(['route53', 'list-hosted-zones-by-name', '--dns-name', domainName], {
    region: false,
  });
  const zone = zones.HostedZones?.find((item) => item.Name === hostedZoneName && !item.Config?.PrivateZone);

  if (!zone) throw new Error(`No Route 53 hosted zone found for ${domainName}`);
  return zone.Id.replace('/hostedzone/', '');
}

function ensureBucket(bucketName) {
  const exists = tryAws(['s3api', 'head-bucket', '--bucket', bucketName], { json: false });

  if (exists === null) {
    const args = ['s3api', 'create-bucket', '--bucket', bucketName];
    if (region !== 'us-east-1') {
      args.push('--create-bucket-configuration', `LocationConstraint=${region}`);
    }
    aws(args, { json: false });
  }

  aws([
    's3api',
    'put-public-access-block',
    '--bucket',
    bucketName,
    '--public-access-block-configuration',
    'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true',
  ], { json: false });

  aws([
    's3api',
    'put-bucket-encryption',
    '--bucket',
    bucketName,
    '--server-side-encryption-configuration',
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}',
  ], { json: false });
}

function ensureLambdaRole(accountId) {
  const role = tryAws(['iam', 'get-role', '--role-name', lambdaRoleName], { region: false });
  if (role?.Role?.Arn) return role.Role.Arn;

  const trustFile = writeTempJson('boda-lambda-trust', {
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: { Service: 'lambda.amazonaws.com' },
      Action: 'sts:AssumeRole',
    }],
  });

  try {
    const created = aws([
      'iam',
      'create-role',
      '--role-name',
      lambdaRoleName,
      '--assume-role-policy-document',
      `file://${trustFile}`,
    ], { region: false });

    const policyFile = writeTempJson('boda-lambda-policy', {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Action: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        Resource: [
          `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaName}`,
          `arn:aws:logs:${region}:${accountId}:log-group:/aws/lambda/${lambdaName}:*`,
        ],
      }],
    });

    try {
      aws([
        'iam',
        'put-role-policy',
        '--role-name',
        lambdaRoleName,
        '--policy-name',
        'boda-rsvp-logs',
        '--policy-document',
        `file://${policyFile}`,
      ], { region: false, json: false });
    } finally {
      cleanup([policyFile]);
    }

    return created.Role.Arn;
  } finally {
    cleanup([trustFile]);
  }
}

function ensureLambda(roleArn, envFile) {
  const zipFile = path.join(os.tmpdir(), `${lambdaName}.zip`);
  run('zip', ['-j', '-q', zipFile, path.join(root, 'infra/aws/lambda/rsvp/index.mjs')]);

  try {
    const existing = tryAws(['lambda', 'get-function', '--function-name', lambdaName]);

    if (existing) {
      aws([
        'lambda',
        'update-function-code',
        '--function-name',
        lambdaName,
        '--zip-file',
        `fileb://${zipFile}`,
      ]);
      aws(['lambda', 'wait', 'function-updated', '--function-name', lambdaName], { json: false });
      aws([
        'lambda',
        'update-function-configuration',
        '--function-name',
        lambdaName,
        '--runtime',
        'nodejs20.x',
        '--handler',
        'index.handler',
        '--timeout',
        '15',
        '--memory-size',
        '128',
        '--environment',
        `file://${envFile}`,
      ]);
      aws(['lambda', 'wait', 'function-updated', '--function-name', lambdaName], { json: false });
    } else {
      let created = false;
      for (let attempt = 1; attempt <= 8 && !created; attempt += 1) {
        try {
          aws([
            'lambda',
            'create-function',
            '--function-name',
            lambdaName,
            '--runtime',
            'nodejs20.x',
            '--handler',
            'index.handler',
            '--role',
            roleArn,
            '--timeout',
            '15',
            '--memory-size',
            '128',
            '--zip-file',
            `fileb://${zipFile}`,
            '--environment',
            `file://${envFile}`,
          ]);
          created = true;
        } catch (error) {
          if (attempt === 8) throw error;
          Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
        }
      }
    }

    if (tryAws(['lambda', 'get-function-url-config', '--function-name', lambdaName])) {
      tryAws(['lambda', 'delete-function-url-config', '--function-name', lambdaName], { json: false });
    }

    return aws(['lambda', 'get-function', '--function-name', lambdaName]).Configuration.FunctionArn;
  } finally {
    cleanup([zipFile]);
  }
}

function ensureApiGateway(lambdaArn, accountId) {
  const apis = aws(['apigatewayv2', 'get-apis']);
  let api = apis.Items?.find((item) => item.Name === apiName);

  if (!api) {
    api = aws([
      'apigatewayv2',
      'create-api',
      '--name',
      apiName,
      '--protocol-type',
      'HTTP',
    ]);
  }

  const integrations = aws(['apigatewayv2', 'get-integrations', '--api-id', api.ApiId]);
  let integration = integrations.Items?.find((item) => item.IntegrationUri === lambdaArn);

  if (!integration) {
    integration = aws([
      'apigatewayv2',
      'create-integration',
      '--api-id',
      api.ApiId,
      '--integration-type',
      'AWS_PROXY',
      '--integration-uri',
      lambdaArn,
      '--payload-format-version',
      '2.0',
    ]);
  }

  const routes = aws(['apigatewayv2', 'get-routes', '--api-id', api.ApiId]);
  const routeKeys = new Set(routes.Items?.map((route) => route.RouteKey) ?? []);

  for (const routeKey of ['ANY /api/rsvp', 'ANY /api/{proxy+}']) {
    if (routeKeys.has(routeKey)) continue;

    aws([
      'apigatewayv2',
      'create-route',
      '--api-id',
      api.ApiId,
      '--route-key',
      routeKey,
      '--target',
      `integrations/${integration.IntegrationId}`,
    ]);
  }

  const stage = tryAws(['apigatewayv2', 'get-stage', '--api-id', api.ApiId, '--stage-name', '$default']);
  if (stage) {
    aws([
      'apigatewayv2',
      'update-stage',
      '--api-id',
      api.ApiId,
      '--stage-name',
      '$default',
      '--auto-deploy',
    ]);
  } else {
    aws([
      'apigatewayv2',
      'create-stage',
      '--api-id',
      api.ApiId,
      '--stage-name',
      '$default',
      '--auto-deploy',
    ]);
  }

  ensureApiGatewayLambdaPermission(api.ApiId, accountId);

  return new URL(api.ApiEndpoint).hostname;
}

function ensureApiGatewayLambdaPermission(apiId, accountId) {
  const statementId = 'ApiGatewayInvokeBodaRsvp';
  const policy = tryAws(['lambda', 'get-policy', '--function-name', lambdaName]);

  if (policy?.Policy) {
    const parsed = JSON.parse(policy.Policy);
    const exists = parsed.Statement?.some((statement) => statement.Sid === statementId);
    if (exists) return;
  }

  aws([
    'lambda',
    'add-permission',
    '--function-name',
    lambdaName,
    '--statement-id',
    statementId,
    '--action',
    'lambda:InvokeFunction',
    '--principal',
    'apigateway.amazonaws.com',
    '--source-arn',
    `arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*/api/*`,
  ]);
}

function getOrRequestCertificate(hostedZoneId) {
  const list = aws([
    'acm',
    'list-certificates',
    '--certificate-statuses',
    'PENDING_VALIDATION',
    'ISSUED',
    'INACTIVE',
    'EXPIRED',
    'VALIDATION_TIMED_OUT',
  ], { region: certificateRegion });

  let certificate = list.CertificateSummaryList?.find((item) => item.DomainName === domainName);
  let certificateArn = certificate?.CertificateArn;

  if (!certificateArn) {
    certificateArn = aws([
      'acm',
      'request-certificate',
      '--domain-name',
      domainName,
      '--subject-alternative-names',
      wwwDomainName,
      '--validation-method',
      'DNS',
    ], { region: certificateRegion }).CertificateArn;
  }

  let details = null;
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    details = aws(['acm', 'describe-certificate', '--certificate-arn', certificateArn], {
      region: certificateRegion,
    }).Certificate;

    const records = details.DomainValidationOptions
      ?.map((option) => option.ResourceRecord)
      .filter(Boolean);

    if (records?.length) {
      const unique = new Map(records.map((record) => [`${record.Name}:${record.Type}`, record]));
      const changeFile = writeTempJson('boda-acm-validation', {
        Changes: [...unique.values()].map((record) => ({
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: record.Name,
            Type: record.Type,
            TTL: 300,
            ResourceRecords: [{ Value: record.Value }],
          },
        })),
      });

      try {
        aws([
          'route53',
          'change-resource-record-sets',
          '--hosted-zone-id',
          hostedZoneId,
          '--change-batch',
          `file://${changeFile}`,
        ], { region: false });
      } finally {
        cleanup([changeFile]);
      }
      break;
    }

    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
  }

  details = aws(['acm', 'describe-certificate', '--certificate-arn', certificateArn], {
    region: certificateRegion,
  }).Certificate;

  if (details.Status !== 'ISSUED') {
    log('Waiting for ACM certificate validation...');
    aws(['acm', 'wait', 'certificate-validated', '--certificate-arn', certificateArn], {
      region: certificateRegion,
      json: false,
    });
  }

  return certificateArn;
}

function ensureCloudFrontFunction() {
  const codeFile = path.join(os.tmpdir(), `${rewriteFunctionName}.js`);
  fs.writeFileSync(codeFile, `function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.indexOf('/api/') === 0) {
    return request;
  }

  if (uri.indexOf('/invitacion/') === 0 && (uri.endsWith('/confirmar') || uri.endsWith('/confirmar/'))) {
    request.uri = '/invitacion/confirmar/index.html';
    return request;
  }

  if (uri.indexOf('/invitacion/') === 0) {
    request.uri = '/invitacion/index.html';
    return request;
  }

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (uri.indexOf('.') === -1) {
    request.uri = uri + '/index.html';
  }

  return request;
}
`);

  try {
    const existing = tryAws(['cloudfront', 'describe-function', '--name', rewriteFunctionName], {
      region: false,
    });

    if (existing?.ETag) {
      aws([
        'cloudfront',
        'update-function',
        '--name',
        rewriteFunctionName,
        '--if-match',
        existing.ETag,
        '--function-config',
        JSON.stringify({ Comment: 'Rewrite static Next.js routes to index.html', Runtime: 'cloudfront-js-2.0' }),
        '--function-code',
        `fileb://${codeFile}`,
      ], { region: false });
    } else {
      aws([
        'cloudfront',
        'create-function',
        '--name',
        rewriteFunctionName,
        '--function-config',
        JSON.stringify({ Comment: 'Rewrite static Next.js routes to index.html', Runtime: 'cloudfront-js-2.0' }),
        '--function-code',
        `fileb://${codeFile}`,
      ], { region: false });
    }

    const described = aws(['cloudfront', 'describe-function', '--name', rewriteFunctionName], {
      region: false,
    });
    const published = aws([
      'cloudfront',
      'publish-function',
      '--name',
      rewriteFunctionName,
      '--if-match',
      described.ETag,
    ], { region: false });

    return published.FunctionSummary.FunctionMetadata.FunctionARN;
  } finally {
    cleanup([codeFile]);
  }
}

function ensureOriginAccessControl() {
  const controls = aws(['cloudfront', 'list-origin-access-controls'], { region: false });
  const existing = controls?.OriginAccessControlList?.Items?.find((item) => item.Name === originAccessControlName);
  if (existing?.Id) return existing.Id;

  return aws([
    'cloudfront',
    'create-origin-access-control',
    '--origin-access-control-config',
    JSON.stringify({
      Name: originAccessControlName,
      Description: 'OAC for boda static S3 bucket',
      SigningProtocol: 'sigv4',
      SigningBehavior: 'always',
      OriginAccessControlOriginType: 's3',
    }),
  ], { region: false }).OriginAccessControl.Id;
}

function findDistribution() {
  const list = aws(['cloudfront', 'list-distributions'], { region: false });
  return list?.DistributionList?.Items?.find((distribution) => {
    const aliases = distribution.Aliases?.Items ?? [];
    return aliases.includes(domainName) || aliases.includes(wwwDomainName);
  }) ?? null;
}

function distributionConfig({ bucketName, apiDomain, certificateArn, functionArn, originAccessControlId }) {
  return {
    CallerReference: `boda-${Date.now()}`,
    Aliases: { Quantity: 2, Items: [domainName, wwwDomainName] },
    DefaultRootObject: 'index.html',
    Origins: {
      Quantity: 2,
      Items: [
        {
          Id: 's3-site',
          DomainName: `${bucketName}.s3.${region}.amazonaws.com`,
          OriginPath: '',
          OriginAccessControlId: originAccessControlId,
          CustomHeaders: { Quantity: 0 },
          ConnectionAttempts: 3,
          ConnectionTimeout: 10,
          OriginShield: { Enabled: false },
          S3OriginConfig: { OriginAccessIdentity: '', OriginReadTimeout: 30 },
        },
        {
          Id: 'rsvp-api',
          DomainName: apiDomain,
          OriginPath: '',
          CustomHeaders: { Quantity: 0 },
          ConnectionAttempts: 3,
          ConnectionTimeout: 10,
          OriginShield: { Enabled: false },
          OriginAccessControlId: '',
          CustomOriginConfig: {
            HTTPPort: 80,
            HTTPSPort: 443,
            OriginProtocolPolicy: 'https-only',
            OriginSslProtocols: { Quantity: 1, Items: ['TLSv1.2'] },
            OriginReadTimeout: 30,
            OriginKeepaliveTimeout: 5,
          },
        },
      ],
    },
    OriginGroups: { Quantity: 0 },
    DefaultCacheBehavior: {
      TargetOriginId: 's3-site',
      ViewerProtocolPolicy: 'redirect-to-https',
      AllowedMethods: {
        Quantity: 2,
        Items: ['GET', 'HEAD'],
        CachedMethods: { Quantity: 2, Items: ['GET', 'HEAD'] },
      },
      SmoothStreaming: false,
      Compress: true,
      LambdaFunctionAssociations: { Quantity: 0 },
      ForwardedValues: {
        QueryString: false,
        Headers: { Quantity: 0 },
        Cookies: { Forward: 'none' },
        QueryStringCacheKeys: { Quantity: 0 },
      },
      TrustedSigners: { Enabled: false, Quantity: 0 },
      TrustedKeyGroups: { Enabled: false, Quantity: 0 },
      FunctionAssociations: {
        Quantity: 1,
        Items: [{ EventType: 'viewer-request', FunctionARN: functionArn }],
      },
      FieldLevelEncryptionId: '',
      GrpcConfig: { Enabled: false },
      MinTTL: 0,
      DefaultTTL: 300,
      MaxTTL: 86400,
    },
    CacheBehaviors: {
      Quantity: 1,
      Items: [{
        PathPattern: '/api/*',
        TargetOriginId: 'rsvp-api',
        ViewerProtocolPolicy: 'https-only',
        AllowedMethods: {
          Quantity: 7,
          Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'PATCH', 'POST', 'DELETE'],
          CachedMethods: { Quantity: 3, Items: ['GET', 'HEAD', 'OPTIONS'] },
        },
        SmoothStreaming: false,
        Compress: true,
        LambdaFunctionAssociations: { Quantity: 0 },
        FunctionAssociations: { Quantity: 0 },
        FieldLevelEncryptionId: '',
        GrpcConfig: { Enabled: false },
        ForwardedValues: {
          QueryString: true,
          Headers: {
            Quantity: 3,
            Items: ['Origin', 'Access-Control-Request-Headers', 'Access-Control-Request-Method'],
          },
          Cookies: { Forward: 'none' },
          QueryStringCacheKeys: { Quantity: 0 },
        },
        TrustedSigners: { Enabled: false, Quantity: 0 },
        TrustedKeyGroups: { Enabled: false, Quantity: 0 },
        MinTTL: 0,
        DefaultTTL: 0,
        MaxTTL: 0,
      }],
    },
    CustomErrorResponses: { Quantity: 0 },
    Comment: 'boda-luis-quetzalli static site',
    Logging: { Enabled: false, IncludeCookies: false, Bucket: '', Prefix: '' },
    PriceClass: 'PriceClass_100',
    Enabled: true,
    ViewerCertificate: {
      ACMCertificateArn: certificateArn,
      SSLSupportMethod: 'sni-only',
      MinimumProtocolVersion: 'TLSv1.2_2021',
      Certificate: certificateArn,
      CertificateSource: 'acm',
    },
    Restrictions: {
      GeoRestriction: { RestrictionType: 'none', Quantity: 0 },
    },
    WebACLId: '',
    HttpVersion: 'http2',
    IsIPV6Enabled: true,
    ContinuousDeploymentPolicyId: '',
    Staging: false,
  };
}

function ensureDistribution(config) {
  const existing = findDistribution();
  if (existing?.Id) {
    const current = aws(['cloudfront', 'get-distribution-config', '--id', existing.Id], { region: false });
    const updatedConfig = {
      ...config,
      CallerReference: current.DistributionConfig.CallerReference,
    };
    const configFile = writeTempJson('boda-cloudfront-distribution-update', updatedConfig);

    try {
      return aws([
        'cloudfront',
        'update-distribution',
        '--id',
        existing.Id,
        '--if-match',
        current.ETag,
        '--distribution-config',
        `file://${configFile}`,
      ], { region: false }).Distribution;
    } finally {
      cleanup([configFile]);
    }
  }

  const configFile = writeTempJson('boda-cloudfront-distribution', config);
  try {
    return aws([
      'cloudfront',
      'create-distribution',
      '--distribution-config',
      `file://${configFile}`,
    ], { region: false }).Distribution;
  } finally {
    cleanup([configFile]);
  }
}

function putBucketPolicy(bucketName, accountId, distributionId) {
  const policyFile = writeTempJson('boda-bucket-policy', {
    Version: '2012-10-17',
    Statement: [{
      Sid: 'AllowCloudFrontServicePrincipalReadOnly',
      Effect: 'Allow',
      Principal: { Service: 'cloudfront.amazonaws.com' },
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${bucketName}/*`,
      Condition: {
        StringEquals: {
          'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`,
        },
      },
    }],
  });

  try {
    aws([
      's3api',
      'put-bucket-policy',
      '--bucket',
      bucketName,
      '--policy',
      `file://${policyFile}`,
    ], { json: false });
  } finally {
    cleanup([policyFile]);
  }
}

function syncStatic(bucketName) {
  run('aws', [
    's3',
    'sync',
    'out',
    `s3://${bucketName}`,
    '--delete',
    '--cache-control',
    'no-store',
    '--profile',
    profile,
    '--region',
    region,
  ], { inherit: true });
}

function upsertDns(hostedZoneId, distributionDomainName) {
  const changeFile = writeTempJson('boda-cloudfront-dns', {
    Changes: [domainName, wwwDomainName].map((name) => ({
      Action: 'UPSERT',
      ResourceRecordSet: {
        Name: name,
        Type: 'A',
        AliasTarget: {
          HostedZoneId: cloudFrontHostedZoneId,
          DNSName: distributionDomainName,
          EvaluateTargetHealth: false,
        },
      },
    })),
  });

  try {
    aws([
      'route53',
      'change-resource-record-sets',
      '--hosted-zone-id',
      hostedZoneId,
      '--change-batch',
      `file://${changeFile}`,
    ], { region: false });
  } finally {
    cleanup([changeFile]);
  }
}

const sts = aws(['sts', 'get-caller-identity']);
const accountId = sts.Account;
const bucketName = process.env.S3_BUCKET ?? `boda-luis-quetzalli-${accountId}`;
const envValues = parseEnvFile(path.join(root, '.env.local'));
const serviceAccount = fs.readFileSync(path.join(root, 'credentials/google-service-account.json'), 'utf8');
const lambdaEnvFile = writeTempJson('boda-lambda-env', {
  Variables: {
    GOOGLE_SHEET_ID: envValues.GOOGLE_SHEET_ID,
    GOOGLE_SHEET_TAB: envValues.GOOGLE_SHEET_TAB ?? 'Tokens de Invitacion',
    GOOGLE_SERVICE_ACCOUNT_JSON: serviceAccount,
  },
});

try {
  log(`Using AWS account ${accountId} with profile ${profile}`);
  log('Building static export...');
  run('npm', ['run', 'build'], { inherit: true });

  log('Resolving Route 53 hosted zone...');
  const hostedZoneId = ensureHostedZone();

  log(`Ensuring S3 bucket ${bucketName}...`);
  ensureBucket(bucketName);

  log('Ensuring Lambda RSVP API...');
  const roleArn = ensureLambdaRole(accountId);
  const lambdaArn = ensureLambda(roleArn, lambdaEnvFile);
  const apiDomain = ensureApiGateway(lambdaArn, accountId);

  log('Ensuring ACM certificate...');
  const certificateArn = getOrRequestCertificate(hostedZoneId);

  log('Ensuring CloudFront function and OAC...');
  const functionArn = ensureCloudFrontFunction();
  const originAccessControlId = ensureOriginAccessControl();

  log('Ensuring CloudFront distribution...');
  const distribution = ensureDistribution(distributionConfig({
    bucketName,
    apiDomain,
    certificateArn,
    functionArn,
    originAccessControlId,
  }));

  putBucketPolicy(bucketName, accountId, distribution.Id);

  log('Uploading static files to S3...');
  syncStatic(bucketName);

  log('Creating CloudFront invalidation...');
  aws([
    'cloudfront',
    'create-invalidation',
    '--distribution-id',
    distribution.Id,
    '--paths',
    '/*',
  ], { region: false });

  log('Waiting for CloudFront deployment...');
  aws(['cloudfront', 'wait', 'distribution-deployed', '--id', distribution.Id], {
    region: false,
    json: false,
  });

  log('Pointing Route 53 records to CloudFront...');
  upsertDns(hostedZoneId, distribution.DomainName);

  log(`Done: https://${domainName}`);
} finally {
  cleanup([lambdaEnvFile]);
}
