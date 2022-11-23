[English](./README.md) / 日本語

# psycopg2 Lambda Layer

[`psycopg2`](https://github.com/psycopg/psycopg2)を[AWS Lambda (Lambda)](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)のLayerとしてパッケージします。

このモジュールは[AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)のバージョン2かそれ以降で使用することを想定しています。

## はじめる

### インストール方法

このモジュールは(この)GitHubレポジトリからインストールしてください。

```sh
npm install https://github.com/codemonger-io/psycopg2-lambda-layer.git#v0.1.0
```

### Lambda Layerを確保してリンクする

`Psycopg2LambdaLayer`をあなたのCDKスタックとLambda関数に追加してください。
```ts
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Psycopg2LambdaLayer } from 'psycopg2-lambda-layer';

class YourConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    // psycopg2のLambda Layerを作成
    const psycopg2Layer = new Psycopg2LambdaLayer(this, 'Psycopg2Layer', {
      description: 'AWS Lambda (ARM64) 用にビルドしたpsycopg2',
      runtime: lambda.Runtime.PYTHON_3_8,
      architecture: lambda.Architecture.ARM_64,
    });

    // psycopg2をインポートするLambda関数を作成
    const yourFunction = new PythonFunction(this, 'YourFunction', {
      description: 'psycopg2をインポートするLambda関数',
      entry: 'lambda/your-function',
      runtime: lambda.Runtime.PYTHON_3_8,
      architecture: lambda.Architecture.ARM_64,
      layers: [psycopg2Layer],
    });
  }
}
```

これであなたのLambda関数(`lambda/your-function/index.py`)から`psycopg2`をインポートできます。
```python
import psycopg2

def handler(event, context):
    conn = psycopg2.connect(database_uri)
```

## なぜこのモジュールが必要なのか?

Lambdaのランタイムには`psycopg2`が機能するのに必要な依存ライブラリ([`libpq`](https://www.postgresql.org/docs/15/libpq.html)や`openssl`)が欠けています。
このモジュールはLambdaランタイムイメージ上で`libpq`を[ソースコード](https://github.com/postgres/postgres)からビルドします。
それから`psycopg2`の[Wheel](https://pip.pypa.io/en/stable/cli/pip_wheel/)を[ソースコード](https://github.com/psycopg/psycopg2)からビルドします。[`auditwheel`](https://github.com/pypa/auditwheel)を用いてWheelにはすべての必要な共有オブジェクトをバンドルします。

より詳しくは[`src/Dockerfile`](./src/Dockerfile)をご覧ください。

## APIドキュメント

[`api-docs/markdown`](./api-docs/markdown/index.md)をご覧ください(英語版のみ)。

## このプロジェクトの代替

### jetbridge/psycopg2-lambda-layer

https://github.com/jetbridge/psycopg2-lambda-layer

このプロジェクトはあなたのLambda関数に直接追加することのできるビルド済みのLambda LayerのARNsを公開しています。
バイナリの出どころを気にしなければ非常に便利に使えそうです。

### jkehler/awslambda-psycopg2

https://github.com/jkehler/awslambda-psycopg2

このプロジェクトはLambdaランタイム用にビルド済みの`psycopg2`バイナリを提供しています。
こちらもバイナリの出どころを気にしなければ便利に使えそうです。
残念ながら、ARM64用にビルドしたパッケージはありません。