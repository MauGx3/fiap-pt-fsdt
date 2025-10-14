OpenAPI / Swagger

This repository includes a minimal OpenAPI v3 spec at `openapi.yaml`. It documents the core auth and posts endpoints and is intended as a starting point for Swagger UI or code generation.

Quick local preview

1. Install `swagger-ui-express` and `yamljs` (optional) locally in the backend if you want to serve the spec:

```fish
cd tech_challenge1/backend
npm install --save-dev swagger-ui-express yamljs
```

2. Create a small Express route to serve the UI (example):

```js
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const spec = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

app.listen(3001, () => console.log('Swagger UI at http://localhost:3001/docs'));
```

3. Visit http://localhost:3001/docs to view the interactive API docs.

Notes

- The OpenAPI file is intentionally minimal. If you want I can expand it to include more endpoints, examples, and request/response examples.
- Do not ship swagger-ui-express in production unless you secure the endpoint.
