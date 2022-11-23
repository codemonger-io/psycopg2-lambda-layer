/**
 * Packages psycopg2 as an AWS Lambda layer.
 *
 * @packageDocumentation
 */

import {
  AssetStaging,
  DockerImage,
  aws_lambda as lambda,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Python runtimes.
 *
 * @beta
 */
export type PythonRuntime =
  typeof lambda.Runtime.PYTHON_3_7 |
  typeof lambda.Runtime.PYTHON_3_8 |
  typeof lambda.Runtime.PYTHON_3_9;

/**
 * Supported architectures.
 *
 * @beta
 */
export type SupportedArchitecture =
  typeof lambda.Architecture.ARM_64 |
  typeof lambda.Architecture.X86_64;

/**
 * Properties for `Psycopg2LambdaLayer`.
 *
 * @beta
 */
export interface Psycopg2LambdaLayerProps {
  /** Name of the layer version. */
  readonly layerVersionName?: string;
  /** Description of the layer. */
  readonly description?: string;
  /** License of the layer. */
  readonly license?: string;
  /** Architecture to build. */
  readonly architecture: SupportedArchitecture;
  /** Runtime to build. Only Python runtimes are acceptable. */
  readonly runtime: PythonRuntime;
}

/**
 * CDK construct that packages `psycopg2` as a Lambda layer.
 *
 * @beta
 */
export class Psycopg2LambdaLayer extends lambda.LayerVersion {
  constructor(scope: Construct, id: string, props: Psycopg2LambdaLayerProps) {
    const { architecture, runtime } = props;

    // builds a Docker image
    // psycopg2 will be installed in /var/packaged
    const image = DockerImage.fromBuild(__dirname, {
      buildArgs: {
        IMAGE: runtime.bundlingImage.image,
        PLATFORM: architecture.dockerPlatform,
      },
    });

    // script to output psycopg2
    const outputPath = `${AssetStaging.BUNDLING_OUTPUT_DIR}/python`;
    const script = `rsync -r /var/packaged/. ${outputPath}`;

    super(scope, id, {
      layerVersionName: props.layerVersionName,
      description: props.description,
      license: props.license,
      compatibleArchitectures: [props.architecture],
      compatibleRuntimes: [props.runtime],
      code: lambda.Code.fromAsset(__dirname, {
        bundling: {
          image,
          command: ['bash', '-c', script],
        },
      }),
    });
  }
}
