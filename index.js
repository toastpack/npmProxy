import Router from './itty-router.js';

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
  let data = await (
    await fetch(
      `https://registry.npmjs.org/${params.package}/${params.version}`
    )
  ).json();
  if (data.error) {
    return sendJSON(data, 500);
  } else {
    return sendJSON({
      name: data['name'],
      description: data['description'],
      license: data['license'],
      version: data['version'],
      tgz: `https://npmProxy.toastpack.dev/${params.package}/${params.version}/tgz`,
    });
  }
});

router.get('/:package/:version/tgz', async ({ params }) => {
  let response = await fetch(
    `https://registry.npmjs.org/${params.package}/-/${params.package}-${params.version}.tgz`
  );
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return sendJSON(await response.json(), 500);
  } else {
    let { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);
    return new Response(readable, response);
  }
});

router.all('*', () => {
  return sendJSON({ error: 'Not Found' }, 404);
});

export default {
  fetch: router.handle,
};
