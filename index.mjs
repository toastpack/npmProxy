import Router from './itty-router.mjs';

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

router.all('*', () => {
  return sendJSON({ error: 'Not Found' }, 404);
});

export default {
  fetch: router.handle,
};
