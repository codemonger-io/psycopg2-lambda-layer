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
export const PYTHON_RUNTIMES = [
  lambda.Runtime.PYTHON_3_7,
  lambda.Runtime.PYTHON_3_8,
  lambda.Runtime.PYTHON_3_9,
] as const;

/**
 * Supported architectures.
 *
 * @beta
 */
export const SUPPORTED_ARCHITECTURES = [
  lambda.Architecture.ARM_64,
  lambda.Architecture.X86_64,
] as const;

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
  readonly architecture: lambda.Architecture;
  /** Runtime to build. Only Python runtimes are acceptable. */
  readonly runtime: lambda.Runtime;
  /**
   * Whether to skip checks of the architecture and runtime.
   *
   * @defaultValue `false`
   */
  readonly skipsRuntimeChecks?: boolean;
}

/**
 * CDK construct that packages `psycopg2` as a Lambda layer.
 *
 * @beta
 */
export class Psycopg2LambdaLayer extends lambda.LayerVersion {
  /**
   * @throws RangeError
   *
   *   If `architecture` is not in {@link SUPPORTED_ARCHITECTURES},
   *   or if `runtime` is not in {@link PYTHON_RUNTIMES}.
   *   This error is suppressed if
   *   {@link Psycopg2LambdaLayerProps.skipsRuntimeChecks | props.skipsRuntimeChecks} is `true`.
   */
  constructor(scope: Construct, id: string, props: Psycopg2LambdaLayerProps) {
    const { architecture, runtime } = props;

    // verifies the architecture and runtime
    if (!props.skipsRuntimeChecks) {
      verifyArchitecture(architecture);
      verifyRuntime(runtime);
    }

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

// makes sure a given architecture is supported.
function verifyArchitecture(architecture: lambda.Architecture) {
  // I am not sure we can directly compare references
  if (SUPPORTED_ARCHITECTURES.find(a => a.name === architecture.name) == null) {
    throw new RangeError(
      `architecture "${architecture.name}" is not supported`,
    );
  }
}

// makes sure a given runtime is supported.
function verifyRuntime(runtime: lambda.Runtime) {
  // I am not sure we can directly compare references
  if (PYTHON_RUNTIMES.find(r => r.name === runtime.name) == null) {
    throw new RangeError(`runtime "${runtime.name}" is not supported`);
  }
}
