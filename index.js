import Router from './packages/itty-router/index.js';
import { valid, validRange, maxSatisfying } from './packages/semver/index.cjs';

const sendJSON = (data = {}, code = 200, headers = {}) => {
  return new Response(JSON.stringify(data), {
    status: code,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Powered-By': 'toastpack',
      ...headers,
    },
  });
};

const getVersionData = async (params) => {
  let data = await (
    await fetch(`https://registry.npmjs.org/${params.package}`)
  ).json();
  if (data.error) {
    return sendJSON(data, 500);
  }
  let tags = data['dist-tags'];
  let versions = Object.keys(data.versions);
  let version;
  if (valid(params.version)) {
    version = params.version;
  } else if (validRange(decodeURI(params.version))) {
    version = maxSatisfying(versions, decodeURI(params.version));
  } else {
    version = tags[decodeURI(params.version)];
  }
  return data.versions[version];
};

const router = Router();

router.get('/', () => {
  return new Response('Hello toastpack npm proxy!');
});

router.get('/:package', async ({ params }) => {
  let data = await (
    await fetch(`https://registry.npmjs.org/${params.package}`)
  ).json();
  if (data.error) {
    return sendJSON(data, 500);
  } else {
    return sendJSON({
      name: data['name'],
      description: data['description'],
      license: data['license'],
      tags: data['dist-tags'],
      versions: Object.keys(data['versions']),
    });
  }
});

router.get('/:package/:version', async ({ params }) => {
  let info = await getVersionData(params);
  if (!info) {
    return sendJSON(data, 500);
  }
  return sendJSON({
    name: info['name'],
    description: info['description'],
    license: info['license'],
    version: info['version'],
    tgz: `https://npmProxy.toastpack.dev/${params.package}/${info['version']}/tgz`,
  });
});

router.get('/:package/:version/tgz', async ({ params }) => {
  let info = await getVersionData(params);
  let response = await fetch(info.dist.tarball);
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return sendJSON(
      { error: `NPM fetch failed: ${(await response.json()).message}` },
      500
    );
  } else {
    return response;
  }
});

router.all('*', () => {
  return sendJSON({ error: 'Not Found' }, 404);
});

export default {
  fetch: router.handle,
};
