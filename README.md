# toastpack npm proxy

<img align="right" width="100" height="100" src="https://avatars.githubusercontent.com/u/99932849?s=400&u=3ab49df1af27e67db481c8ed7328010ff07ef81a&v=4">

A Cloudflare Worker that proxies toastpack requests to the npm registry, simplifying the client side fetching of packages.

## API Documentation

If a route returns a 500 or a 404, the response will be a JSON object with a key `error` with an error message.

### GET /

Returns a text response of "Hello toastpack npm proxy!"

### GET /:package

Returns a JSON response with the following fields:

```json5
{
  "name": "@toastpack/cli", // the name of the package
  "description": "description", // the description of the package
  "license": "MIT", // the license of the package
  "tags": { "latest": "1.0.0", "beta": "1.0.1-beta" }, // the tags of the package
  "versions": ["0.0.1", "0.1.0", "1.0.0", "1.0.1-beta"] // the versions of the package
}
```

### GET /:package/:version

Returns a JSON response with the following fields:

```json5
{
  "name": "@toastpack/cli", // the name of the package
  "description": "description", // the description of the package
  "license": "MIT", // the license of the package
  "version": "1.0.0", // the version of the package
  "tgz": "https://npmProxy.toastpack.dev/@toastpack%2Fcli/1.0.0/tgz", // the tarball of the package
}
```

### GET /:package/:version/tgz

Returns a tarball of the package.