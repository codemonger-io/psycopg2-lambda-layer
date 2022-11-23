English / [日本語](./README.ja.md)

# psycopg2 Lambda Layer

Packages [`psycopg2`](https://github.com/psycopg/psycopg2) as an [AWS Lambda (Lambda)](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) layer.

This library is intended to work with [AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html) version 2 or higher.

## Getting started

### How to install

Please install this module from the GitHub (this) repository.

```sh
npm install https://github.com/codemonger-io/psycopg2-lambda-layer.git#v0.1.0
```

### Provisioning and linking a Lambda layer

Add `Psycopg2LambdaLayer` to your CDK stack and your Lambda function:
```ts
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Psycopg2LambdaLayer } from 'psycopg2-lambda-layer';

class YourConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    // creates a Lambda layer of psycopg2
    const psycopg2Layer = new Psycopg2LambdaLayer(this, 'Psycopg2Layer', {
      description: 'psycopg2 built for AWS Lambda (ARM64)',
      runtime: lambda.Runtime.PYTHON_3_8,
      architecture: lambda.Architecture.ARM_64,
    });

    // creates a Lambda function that imports psycopg2
    const yourFunction = new PythonFunction(this, 'YourFunction', {
      description: 'Lambda function that imports psycopg2',
      entry: 'lambda/your-function',
      runtime: lambda.Runtime.PYTHON_3_8,
      architecture: lambda.Architecture.ARM_64,
      layers: [psycopg2Layer],
    });
  }
}
```

Then you can import `psycopg2` in your Lambda function (`lambda/your-function/index.py`):
```python
import psycopg2

def handler(event, context):
    conn = psycopg2.connect(database_uri)
```

## Why do you need this package?

Runtimes for Lambda lack some dependencies of `psycopg2` to operate; e.g., [`libpq`](https://www.postgresql.org/docs/15/libpq.html), `openssl`.
This package builds `libpq` from the [source code](https://github.com/postgres/postgres) on a Lambda runtime image.
And then it builds a [wheel](https://pip.pypa.io/en/stable/cli/pip_wheel/) of `psycopg2` from the [source code](https://github.com/psycopg/psycopg2) while bundling all the necessary shared objects into the wheel with [`auditwheel`](https://github.com/pypa/auditwheel).

Please refer to [`src/Dockerfile`](./src/Dockerfile) for more details.

## API documentation

Please refer to [`api-docs/markdown`](./api-docs/markdown/index.md).

## Alternatives to this project

### jetbridge/psycopg2-lambda-layer

https://github.com/jetbridge/psycopg2-lambda-layer

This project publishes ARNs of prebuilt Lambda layers you can directly add to your Lambda function.
This project may be very handy if you do not mind the origin of binaries.

### jkehler/awslambda-psycopg2

https://github.com/jkehler/awslambda-psycopg2

This project provides prebuilt psycopg2 binaries for Lambda runtimes.
This project may also be handy if you do not mind the origin of binaries.
But, unfortunately, there are no packages built for ARM64.